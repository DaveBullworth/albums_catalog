require('dotenv').config();
const express = require('express');
const sequelize = require('./db');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const router = require('./routes/index.js');
const errorHandler = require('./middleware/errorHandlingMiddleware');
const path = require('path');
const { logError } = require('./utils/logger');

const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'static')));
app.use(fileUpload({}));
app.use('/api', router);
//обработка ошибок, последний MW
app.use(errorHandler);
async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    // eslint-disable-next-line no-console
    app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));
  } catch (error) {
    logError(error, 'Server startup error');
  }
}
start();
