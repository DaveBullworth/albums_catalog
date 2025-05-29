require('dotenv').config();
const express = require('express');
const i18next = require('./i18n');
const i18nextMiddleware = require('i18next-http-middleware');
const sequelize = require('./db');
const { createDbIfNotExists, waitForPostgres } = require('./db');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const router = require('./routes/index.js');
const errorHandler = require('./middleware/errorHandlingMiddleware');
const path = require('path');
const cookieParser = require('cookie-parser');
const { logError } = require('./utils/logger');

const PORT = process.env.PORT || 5000;
const app = express();
app.use(i18nextMiddleware.handle(i18next));
// Configure CORS to allow credentials
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'static')));
app.use(fileUpload({}));
app.use('/api', router);
//обработка ошибок, последний MW
app.use(errorHandler);
async function start() {
  try {
    await waitForPostgres(); // 1) ждём готовности PostgreSQL
    await createDbIfNotExists(); // 2) Создаем базу, если нет
    await sequelize.authenticate(); // 3) Подключаемся к базе
    await sequelize.sync(); // 4) Синхронизируем модели (таблицы)
    // eslint-disable-next-line no-console
    app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));
  } catch (error) {
    logError(error, 'Server startup error');
  }
}
start();
