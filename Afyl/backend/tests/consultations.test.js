const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const { createApp } = require('./setupTestApp');
const User = require('../models/User');

let mongod;
let app;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  app = await createApp(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

test('POST /api/consultations creates temporary user and case', async () => {
  const payload = {
    nombre: 'Test User',
    email: 'tempuser@example.com',
    telefono: '12345678',
    servicio: 'test-service',
    consulta: 'Esta es una consulta de prueba'
  };

  const res = await request(app).post('/api/consultations').field(payload);

  expect(res.statusCode).toBe(201);
  expect(res.body.success).toBe(true);
  expect(res.body.data).toBeDefined();
  // Check that temp user exists in DB
  const user = await User.findOne({ email: payload.email });
  expect(user).not.toBeNull();
  expect(user.isTemporary).toBe(true);
});
