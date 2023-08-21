import { Request, Response } from 'express';
import { sendError, sendSuccess } from '@libs/response';
import { col, fn, Op } from 'sequelize';
import moment from 'moment';
import SmsTopupModel from '@models/smsTopup';
import { readSms } from '@libs/readSms';
import BankOfficialModel from '@models/banks';
import ExcelService from '@services/ExcelService';
import XLSX from 'xlsx';
import TopupRequestModel from '@models/topupRequest';

class SmsTopupController {
  public async getAll (req: Request, res: Response) {
    try {
      const page: number = parseInt(req.query.page ? req.query.page.toString() : '1');
      const pageSize: number = parseInt(req.query.pageSize ? req.query.pageSize.toString() : '20');
      const searchContent: any = req.query.searchContent ? req.query.searchContent : null;
      const transferId: any = req.query.transferId ? req.query.transferId : null;
      const fromDate: any = Number(req.query.fromDate);
      const toDate: any = Number(req.query.toDate);
      const cursor: number = (page - 1) * pageSize;
      const download: boolean = !!req.query.download;

      const where = Object.assign({},
        searchContent == null ? null : { content: { [Op.like]: `%${searchContent.trim()}%` } },
        req.query.status == null ? null : { status: req.query.status },
        fromDate && toDate ? { createdAt: { [Op.between]: [moment(fromDate), moment(toDate)] } } : null,
        { UserId: req.user.merchantId },
      );

      const whereTopupRequest = Object.assign({},
        transferId == null ? null : { transferId: { [Op.like]: `%${transferId.trim()}%` } },
      );

      if (download) {
        const result = await SmsTopupModel.findAll({
          where,
          include: [
            {
              model: BankOfficialModel,
              as: 'Bank',
            },
            {
              model: TopupRequestModel,
              as: 'TopupRequest',
              where: whereTopupRequest,
              required: false,
            },
          ],
          order: [
            ['createdAt', 'DESC'],
          ],
        });
        const wb: any = await ExcelService.listTopupSms(result);
        const data = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        return res.end(data);
      }
      const { rows, count } = await SmsTopupModel.findAndCountAll({
        where,
        include: [
          {
            model: BankOfficialModel,
            as: 'Bank',
          },
          {
            model: TopupRequestModel,
            as: 'TopupRequest',
            where: whereTopupRequest,
            required: false,
          },
        ],
        order: [
          ['createdAt', 'DESC'],
        ],
        limit: pageSize,
        offset: cursor,
      });
      const sumSuccess: any = await SmsTopupModel.findAll({
        paranoid: false,
        where: { ...where, ...{ status: 'success' } },
        attributes: [
          [fn('sum', col('transferAmount')), 'total_amount'],
        ],
        raw: true,
      });
      const sumPendding: any = await SmsTopupModel.findAll({
        paranoid: false,
        where: { ...where, ...{ status: { [Op.ne]: 'success' } } },
        attributes: [
          [fn('sum', col('transferAmount')), 'total_amount'],
        ],
        raw: true,
      });
      const responseData: any = {
        data: rows,
        pagination: {
          page: page,
          pageSize: pageSize,
          total: count,
        },
        sumSuccess: parseInt(sumSuccess[0]?.total_amount),
        sumPendding: parseInt(sumPendding[0]?.total_amount),
      };
      sendSuccess(res, responseData);
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }

  public async update (req: Request, res: Response) {
    try {
      const smsLog = await SmsTopupModel.findByPk(req.params.id);
      if (!smsLog) {
        return sendError(res, 404, 'no data');
      }
      const updated = await smsLog.update(req.body);
      sendSuccess(res, { smsLog: updated });
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }

  public async retryMapping (req: Request, res: Response) {
    try {
      const smsLog = await SmsTopupModel.findByPk(req.params.id);
      if (!smsLog) {
        return sendError(res, 404, 'no data');
      }
      const result = await readSms({ id: req.user.id, apiKey: req.user.apiKey, merchantId: req.user.merchantId, typeTopup: req.user.typeTopup }, smsLog, null);
      sendSuccess(res, { smsLog, result });
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }
}

export default new SmsTopupController();
