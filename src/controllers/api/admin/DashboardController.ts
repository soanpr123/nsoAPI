import { Request, Response } from 'express';
import { sendError, sendSuccess } from '@libs/response';
import SmsLogModel from '@models/smsLogs';
import { Op, fn, col } from 'sequelize';
import moment from 'moment';
import SmsErrorLogModel from '@models/smsErrorLogs';
import HistorySummaryService from '@services/HistorySummaryService';

class DashboardController {
  public async run (req: Request, res: Response) {
    try {
      const fromDate: any = parseInt(req.body.fromDate ? req.body.fromDate : moment().unix());
      const toDate: any = parseInt(req.body.toDate ? req.body.toDate : moment().unix());
      const fromDiff = Math.floor((moment().unix() - fromDate) / 86400);
      const toDiff = Math.floor((moment().unix() - toDate) / 86400);
      for (let index = toDiff; index < fromDiff + 1; index++) {
        const day = moment(new Date()).startOf('day').subtract(index, 'days').toDate();
        HistorySummaryService.sumBankByDay(day);
      }
      sendSuccess(res, { status: 'success' });
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }

  public async topup (req: Request, res: Response) {
    try {
      const fromDate: any = req.query.fromDate ? Number(req.query.fromDate) : Date.now();
      const toDate: any = req.query.toDate ? Number(req.query.toDate) : Date.now();

      const where = Object.assign({},
        fromDate && toDate ? { createdAt: { [Op.between]: [moment(fromDate), moment(toDate)] } } : null,
        { UserId: req.user.merchantId },
      );

      const formatExport = '%d-%m-%Y';
      const result = await SmsLogModel.findAll({
        paranoid: false,
        where,
        attributes: [
          [fn('DATE_FORMAT', col('createdAt'), formatExport), 'formatCreatedAt'],
          [fn('sum', col('transferAmount')), 'totalTopup'],
        ],
        group: ['formatCreatedAt'],
      });
      sendSuccess(res, result);
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }

  public async bankCount (req: Request, res: Response) {
    try {
      const fromDate: any = req.query.fromDate ? Number(req.query.fromDate) : Date.now();
      const toDate: any = req.query.toDate ? Number(req.query.toDate) : Date.now();

      const where = Object.assign({},
        fromDate && toDate ? { createdAt: { [Op.between]: [moment(fromDate), moment(toDate)] } } : null,
        { UserId: req.user.merchantId },
      );

      const result = await SmsLogModel.findAll({
        paranoid: false,
        where,
        attributes: [
          [fn('count', col('id')), 'countBank'],
          'targetAccNo',
        ],
        group: ['targetAccNo'],
      });
      sendSuccess(res, result);
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }

  public async total (req: Request, res: Response) {
    try {
      const fromDate: any = req.query.fromDate ? Number(req.query.fromDate) : Date.now();
      const toDate: any = req.query.toDate ? Number(req.query.toDate) : Date.now();

      const where = Object.assign({},
        fromDate && toDate ? { createdAt: { [Op.between]: [moment(fromDate), moment(toDate)] } } : null,
        { UserId: req.user.merchantId },
      );

      const totalTopup = await SmsLogModel.findAll({
        paranoid: false,
        where,
        attributes: [
          [fn('sum', col('transferAmount')), 'totalTopup'],
        ],
      });

      const totalSMS = await SmsLogModel.findAll({
        paranoid: false,
        where,
        attributes: [
          [fn('count', col('id')), 'totalSMS'],
        ],
      });

      const totalSMSError = await SmsErrorLogModel.findAll({
        paranoid: false,
        where,
        attributes: [
          [fn('count', col('id')), 'totalSMSError'],
        ],
      });

      const lastSMS = await SmsLogModel.findOne({
        paranoid: false,
        where,
        order: [
          ['createdAt', 'DESC'],
        ],
        limit: 1,
      });

      sendSuccess(res, { totalTopup, totalSMS, totalSMSError, lastSMS });
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }
}

export default new DashboardController();
