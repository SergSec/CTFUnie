const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('../models/User');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;

/**
 * Nota: Este script ya no expone emails/contraseñas en texto plano.
 * - Para crear usuarios específicos desde fuera del código, exporta las variables de entorno:
 *   ADMIN1_EMAIL, ADMIN1_PASSWORD, ADMIN2_EMAIL, ADMIN2_PASSWORD, ADVISOR_EMAIL, ADVISOR_PASSWORD, CLIENT_EMAIL, CLIENT_PASSWORD, VULNERABLE_EMAIL, VULNERABLE_PASSWORD
 * - Si una EMAIL no está definida en las vars de entorno, el script la omitirá (no creará ese usuario).
 * - Si se define un EMAIL pero no una PASSWORD, se generará una password aleatoria y NO se mostrará en logs.
 */

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoURI);
    console.log('✅ Conectado a MongoDB');

    const makeRandomPassword = () => crypto.randomBytes(12).toString('hex');

    const handleUser = async ({ envEmail, envPassword, name, role, extra = {} }) => {
      if (!envEmail) return null; // No queremos tener emails literales en el código; usar env
      const email = envEmail.toLowerCase().trim();
      const exists = await User.findOne({ email });
      if (exists) {
        console.log(`⚠️  Usuario existente encontrado para ${role} (id: ${exists._id})`);
        return exists;
      }
      const password = envPassword || makeRandomPassword();
      const user = await User.create({ name, email, password, role, ...extra });
      console.log(`✅ Usuario creado: role=${role}, id=${user._id}`); // NO mostramos email/contraseña
      return user;
    };

    // Admin 1
    await handleUser({
      envEmail: process.env.ADMIN1_EMAIL,
      envPassword: process.env.ADMIN1_PASSWORD,
      name: 'Administrador Principal',
      role: 'admin',
      extra: { phone: process.env.ADMIN1_PHONE || '' }
    });

    // Admin 2
    await handleUser({
      envEmail: process.env.ADMIN2_EMAIL,
      envPassword: process.env.ADMIN2_PASSWORD,
      name: 'Administrador Secundario',
      role: 'admin',
      extra: { phone: process.env.ADMIN2_PHONE || '' }
    });

    // Advisor
    await handleUser({
      envEmail: process.env.ADVISOR_EMAIL,
      envPassword: process.env.ADVISOR_PASSWORD,
      name: 'Asesor Test',
      role: 'asesor',
      extra: { phone: process.env.ADVISOR_PHONE || '', specialization: process.env.ADVISOR_SPECIALIZATION || '' }
    });

    // Client
    await handleUser({
      envEmail: process.env.CLIENT_EMAIL,
      envPassword: process.env.CLIENT_PASSWORD,
      name: 'Cliente Test',
      role: 'cliente',
      extra: { phone: process.env.CLIENT_PHONE || '' }
    });

    // Vulnerable (pentesting) - only if explicitly provided via env
    await handleUser({
      envEmail: process.env.VULNERABLE_EMAIL,
      envPassword: process.env.VULNERABLE_PASSWORD,
      name: 'Usuario Vulnerable',
      role: 'cliente',
      extra: { phone: process.env.VULNERABLE_PHONE || '' }
    });

    console.log('\n✅ Operación de seed finalizada. No se han mostrado credenciales en consola.');
    console.log('   Si necesitas ver/recuperar contraseñas, revisa tu gestor de secretos o la base de datos (usuarios creados).');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear usuarios:', error);
    process.exit(1);
  }
};

seedUsers();

