const mongoose = require('mongoose');
const User = require('../models/User');
const Case = require('../models/Case');
require('dotenv').config();

/**
 * Script para limpiar usuarios temporales:
 * - Elimina usuarios temporales que han expirado (más de 10 días)
 * - Elimina usuarios rechazados después de 48 horas
 */

async function cleanTemporaryUsers() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    
    const mongoURI = process.env.MONGODB_URI;
    const connectionOptions = {
      dbName: 'Afyl'
    };
    
    await mongoose.connect(mongoURI, connectionOptions);
    console.log('✅ Conectado a MongoDB\n');

    const now = new Date();

    // 1. Buscar usuarios temporales expirados (más de 10 días sin revisión)
    const expiredUsers = await User.find({
      isTemporary: true,
      expiresAt: { $lt: now },
      deleteAt: null // No están marcados para eliminación
    });

    console.log(`📋 Usuarios temporales expirados (10+ días): ${expiredUsers.length}`);

    for (const user of expiredUsers) {
      console.log(`   - Eliminando: ${user.name} (${user.email})`);
      
      // Eliminar caso asociado si existe
      if (user.caseId) {
        await Case.findByIdAndDelete(user.caseId);
      }
      
      await user.deleteOne();
    }

    // 2. Buscar usuarios marcados para eliminación (casos rechazados, 48h después)
    const usersToDelete = await User.find({
      isTemporary: true,
      deleteAt: { $lt: now }
    });

    console.log(`\n📋 Usuarios rechazados (48+ horas): ${usersToDelete.length}`);

    for (const user of usersToDelete) {
      console.log(`   - Eliminando: ${user.name} (${user.email})`);
      
      // El caso ya está marcado como rechazado, solo eliminamos el usuario
      await user.deleteOne();
    }

    const totalDeleted = expiredUsers.length + usersToDelete.length;

    console.log(`\n✅ Limpieza completada:`);
    console.log(`   - Total usuarios eliminados: ${totalDeleted}`);
    console.log(`   - Por expiración (10 días): ${expiredUsers.length}`);
    console.log(`   - Por rechazo (48 horas): ${usersToDelete.length}`);

    // Mostrar estadísticas de usuarios temporales activos
    const activeTemp = await User.countDocuments({
      isTemporary: true,
      expiresAt: { $gte: now },
      isActive: true
    });

    const pendingDeletion = await User.countDocuments({
      isTemporary: true,
      deleteAt: { $gte: now }
    });

    console.log(`\n📊 Estadísticas actuales:`);
    console.log(`   - Usuarios temporales activos: ${activeTemp}`);
    console.log(`   - Usuarios pendientes de eliminación: ${pendingDeletion}`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

cleanTemporaryUsers();
