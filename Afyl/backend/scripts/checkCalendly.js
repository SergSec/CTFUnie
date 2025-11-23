const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Script para verificar la configuración de Calendly
 * Verifica que los webhooks funcionan y que los datos se guardan correctamente
 */

async function checkCalendlySetup() {
  try {
    console.log('🔍 Verificando configuración de Calendly...\n');

    // 1. Verificar conexión a MongoDB
    console.log('1️⃣ Verificando conexión a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'Afyl'
    });
    console.log('✅ Conectado a MongoDB\n');

    // 2. Verificar modelos
    console.log('2️⃣ Verificando modelos...');
    const Appointment = require('../models/Appointment');
    const User = require('../models/User');
    const Case = require('../models/Case');
    console.log('✅ Modelos cargados correctamente\n');

    // 3. Verificar citas con calendlyEventId
    console.log('3️⃣ Verificando citas de Calendly en la base de datos...');
    const calendlyAppointments = await Appointment.find({ 
      calendlyEventId: { $exists: true, $ne: null } 
    }).populate('clientId advisorId caseId');
    
    if (calendlyAppointments.length === 0) {
      console.log('⚠️  No se encontraron citas creadas desde Calendly');
      console.log('   Esto es normal si aún no has configurado los webhooks\n');
    } else {
      console.log(`✅ Se encontraron ${calendlyAppointments.length} citas de Calendly:\n`);
      calendlyAppointments.forEach((apt, index) => {
        console.log(`   Cita ${index + 1}:`);
        console.log(`   - ID: ${apt._id}`);
        console.log(`   - Cliente: ${apt.clientId?.name || 'N/A'} (${apt.clientId?.email || 'N/A'})`);
        console.log(`   - Asesor: ${apt.advisorId?.name || 'Sin asignar'}`);
        console.log(`   - Fecha: ${apt.scheduledDate}`);
        console.log(`   - Estado: ${apt.status}`);
        console.log(`   - Calendly Event ID: ${apt.calendlyEventId}`);
        console.log('');
      });
    }

    // 4. Verificar usuarios (para que los webhooks puedan asignar)
    console.log('4️⃣ Verificando usuarios disponibles...');
    const advisors = await User.find({ role: 'asesor' });
    const admins = await User.find({ role: 'admin' });
    
    console.log(`   - Asesores: ${advisors.length}`);
    console.log(`   - Administradores: ${admins.length}`);
    
    if (advisors.length === 0 && admins.length === 0) {
      console.log('   ⚠️  No hay asesores ni administradores en el sistema');
      console.log('   Los webhooks crearán citas sin asesor asignado\n');
    } else {
      console.log('   ✅ Hay usuarios disponibles para asignar citas\n');
    }

    // 5. Verificar variables de entorno
    console.log('5️⃣ Verificando variables de entorno...');
    const hasSigningKey = !!process.env.CALENDLY_SIGNING_KEY;
    const hasApiToken = !!process.env.CALENDLY_API_TOKEN;
    
    console.log(`   - CALENDLY_SIGNING_KEY: ${hasSigningKey ? '✅ Configurado' : '❌ No configurado (opcional)'}`);
    console.log(`   - CALENDLY_API_TOKEN: ${hasApiToken ? '✅ Configurado' : '❌ No configurado (opcional)'}`);
    console.log('');

    // 6. Resumen y recomendaciones
    console.log('📋 RESUMEN:\n');
    console.log('Estado actual de la integración de Calendly:');
    console.log(`- Base de datos: ✅ Conectada`);
    console.log(`- Modelos: ✅ Funcionando`);
    console.log(`- Citas de Calendly: ${calendlyAppointments.length > 0 ? '✅' : '⚠️'} ${calendlyAppointments.length} encontradas`);
    console.log(`- Usuarios disponibles: ${(advisors.length + admins.length) > 0 ? '✅' : '⚠️'} ${advisors.length + admins.length} encontrados`);
    console.log('');

    if (calendlyAppointments.length === 0) {
      console.log('📝 SIGUIENTE PASO:');
      console.log('1. Configura tu cuenta de Calendly (ver GUIA_COMPLETA_CALENDLY.md)');
      console.log('2. Crea un evento en Calendly');
      console.log('3. Actualiza REACT_APP_CALENDLY_URL en frontend/.env');
      console.log('4. (Opcional) Configura webhooks si tienes plan de pago de Calendly');
      console.log('5. Haz una reserva de prueba para verificar la integración');
    } else {
      console.log('🎉 ¡La integración de Calendly está funcionando correctamente!');
    }

    await mongoose.connection.close();
    console.log('\n✅ Verificación completada');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error durante la verificación:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Ejecutar verificación
checkCalendlySetup();
