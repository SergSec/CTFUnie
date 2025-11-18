const mongoose = require('mongoose');
const Service = require('../models/Service');
const User = require('../models/User');
require('dotenv').config();

const defaultServices = [
  {
    id: 'laboral',
    title: 'Laboral',
    description: 'Despidos, contratos, indemnizaciones, incapacidades…',
    order: 1
  },
  {
    id: 'mercantil',
    title: 'Mercantil / Empresarial',
    description: 'Contratos, constitución de empresas, cambios societarios…',
    order: 2
  },
  {
    id: 'familia',
    title: 'Familia',
    description: 'Separaciones, herencias, custodias, pensiones de alimentos…',
    order: 3
  },
  {
    id: 'proteccion-datos',
    title: 'Protección de datos',
    description: 'Páginas web, servicios profesionales, venta electrónica.',
    order: 4
  },
  {
    id: 'seguros',
    title: 'Seguros / Contratos / Inmobiliario',
    description: 'Redacción y revisión de contratos. Reclamaciones de consumo y contra seguros.',
    order: 5
  },
  {
    id: 'extranjeria',
    title: 'Extranjería',
    description: 'Certificado UE, Visa nómada digital, permisos de residencia, residencia no lucrativa…',
    order: 6
  }
];

async function seedServices() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    
    const mongoURI = process.env.MONGODB_URI;
    const connectionOptions = {
      dbName: 'Afyl'
    };
    
    await mongoose.connect(mongoURI, connectionOptions);
    console.log('✅ Conectado a MongoDB\n');

    // Buscar un usuario admin para asignar como creador
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      console.log('❌ No se encontró ningún usuario admin.');
      console.log('💡 Por favor, crea un usuario admin primero ejecutando: npm run seed');
      process.exit(1);
    }

    console.log(`📋 Usuario admin encontrado: ${admin.name} (${admin.email})\n`);
    console.log('🔄 Poblando servicios...\n');

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const serviceData of defaultServices) {
      const existingService = await Service.findOne({ id: serviceData.id });

      if (existingService) {
        // Actualizar servicio existente
        existingService.title = serviceData.title;
        existingService.description = serviceData.description;
        existingService.order = serviceData.order;
        existingService.isActive = true;
        await existingService.save();
        console.log(`✓ Actualizado: ${serviceData.title}`);
        updated++;
      } else {
        // Crear nuevo servicio
        await Service.create({
          ...serviceData,
          createdBy: admin._id,
          isActive: true
        });
        console.log(`✓ Creado: ${serviceData.title}`);
        created++;
      }
    }

    console.log('\n✅ Proceso completado:');
    console.log(`   - Servicios creados: ${created}`);
    console.log(`   - Servicios actualizados: ${updated}`);
    console.log(`   - Total: ${created + updated}`);

    const allServices = await Service.find({ isActive: true }).sort({ order: 1 });
    console.log('\n📋 Servicios activos:');
    allServices.forEach((service, index) => {
      console.log(`   ${index + 1}. ${service.title}`);
      console.log(`      ID: ${service.id}`);
      console.log(`      Descripción: ${service.description}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

seedServices();
