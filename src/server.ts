/* eslint-disable import/first */
require('module-alias/register');
import path from 'path';
import express from 'express';
import compression from 'compression';
import session from 'express-session';
import cors from 'cors';
import sequelize from '@initializers/sequelize';
import strongParams from '@middlewares/parameters';
import { morganLogger } from '@middlewares/morgan';
import amqp from 'amqplib';
import amqpConsumers from '@controllers/amqp';
import routes from '@configs/routes/index';
import gate from '@configs/routes/gate';
import Settings from '@configs/settings';
import swaggerUi from 'swagger-ui-express';
import cron from 'node-cron';
// import HistorySummaryService from '@services/HistorySummaryService';
// import GetTransactionsJobs from '@jobs/GetTransactionsJobs';
// import TopupJobs from '@jobs/TopupJobs';
import swaggerDocument from './swagger/doc';
import gateDocument from './swagger/gateDoc';

const port = process.env.PORT || 7000;
const host = process.env.HOST || '0.0.0.0';

const app = express();

app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({
  extended: true,
  limit: '50mb',
}));
app.use(express.static(path.join(__dirname, '../public')));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: Settings.sessionSecret,
}));

app.use(cors());
app.options('*', cors());
app.use(morganLogger());
app.use(strongParams());
const swaggerHtmlAPI = swaggerUi.generateHTML(swaggerDocument);
const swaggerHtmlGate = swaggerUi.generateHTML(gateDocument);

app.use('/api-docs', swaggerUi.serveFiles(swaggerDocument));
app.get('/api-docs', (req, res) => { res.send(swaggerHtmlAPI); });

app.use('/gate-docs', swaggerUi.serveFiles(gateDocument));
app.get('/gate-docs', (req, res) => { res.send(swaggerHtmlGate); });

app.use('/api', routes);
app.use('/gate', gate);

app.use((req, res) => {
  res.status(404).send({ url: `${req.path} not found` });
});

app.set('trust proxy', true);

sequelize.authenticate().then(() => {
  app.listen(port, () => {
    console.log(`App is running ${host}:${port}`);
    console.log('  Press CTRL-C to stop\n');
  });
  // const amqpConnection = amqp.connect({
  //   protocol: process.env.AMQP_PROTOCOL,
  //   hostname: process.env.AMQP_HOST_NAME,
  //   port: parseInt(process.env.AMQP_PORT, 10),
  //   username: process.env.AMQP_USERNAME,
  //   password: process.env.AMQP_PASSWORD,
  // });

  // amqpConnection.then(async (connection: any) => {
  //   await amqpConsumers(connection);
  // });
});

cron.schedule('59 23 * * *', async () => {
  // HistorySummaryService.sumBankByDay();
}, {
  scheduled: true,
  timezone: 'Asia/Ho_Chi_Minh',
});

cron.schedule('* * * * *', async () => {
  // TopupJobs.cashOutAlleviate();
}, {
  scheduled: true,
  timezone: 'Asia/Ho_Chi_Minh',
});

if (process.env.IB_WORKER === 'enable') {
  cron.schedule('*/15 * * * * *', async () => {
    // GetTransactionsJobs.getTransactions();
  }, {
    scheduled: true,
    timezone: 'Asia/Ho_Chi_Minh',
  });
}
