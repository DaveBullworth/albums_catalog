const { Sequelize } = require('sequelize');
const pg = require('pg');

const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;

// Создаем подключение к Postgres без указания базы (или к базе 'postgres')
const createDbIfNotExists = async () => {
  const client = new pg.Client({
    user: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOST,
    port: DB_PORT,
    database: 'postgres', // стандартная БД для управления Postgres
  });

  await client.connect();

  // Проверяем, есть ли база
  const res = await client.query(`SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'`);

  if (res.rowCount === 0) {
    // Базы нет — создаем
    await client.query(`CREATE DATABASE "${DB_NAME}"`);
    // eslint-disable-next-line no-console
    console.log(`Database ${DB_NAME} created`);
  } else {
    // eslint-disable-next-line no-console
    console.log(`Database ${DB_NAME} exists`);
  }

  await client.end();
};

const waitForPostgres = async (retries = 10, delay = 2000) => {
  while (retries > 0) {
    try {
      const client = new pg.Client({
        user: DB_USER,
        password: DB_PASSWORD,
        host: DB_HOST,
        port: DB_PORT,
        database: 'postgres',
      });
      await client.connect();
      await client.end();
      // eslint-disable-next-line no-console
      console.log('✅ PostgreSQL is ready');
      return;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(`⏳ PostgreSQL not ready yet. Retrying in ${delay}ms...`);
      retries--;
      await new Promise((res) => setTimeout(res, delay));
    }
  }

  throw new Error('❌ PostgreSQL not ready after retries');
};

// Создаем Sequelize, уже подключаясь к нужной базе
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  dialect: 'postgres',
  host: DB_HOST,
  port: DB_PORT,
});

module.exports = sequelize;
module.exports.createDbIfNotExists = createDbIfNotExists;
module.exports.waitForPostgres = waitForPostgres;
