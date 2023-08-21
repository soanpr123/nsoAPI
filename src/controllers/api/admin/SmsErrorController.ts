import { Request, Response } from 'express';
import { sendError, sendSuccess } from '@libs/response';
import { Op } from 'sequelize';
import moment from 'moment';
import SmsErrorLogModel from '@models/smsErrorLogs';
import BankOfficialModel from '@models/banks';

class SmsErrorController {
  public async getAll (req: Request, res: Response) {
    try {
      const page: number = parseInt(req.query.page ? req.query.page.toString() : '1');
      const pageSize: number = parseInt(req.query.pageSize ? req.query.pageSize.toString() : '20');
      const searchContent: any = req.query.searchContent ? req.query.searchContent : null;
      const fromDate: any = Number(req.query.fromDate);
      const toDate: any = Number(req.query.toDate);
      const cursor: number = (page - 1) * pageSize;

      const where = Object.assign({},
        searchContent == null ? null : { transferMessage: { [Op.like]: `%${searchContent.trim()}%` } },
        req.query.status == null ? null : { status: req.query.status },
        req.query.type == null ? null : { type: req.query.type },
        fromDate && toDate ? { createdAt: { [Op.between]: [moment(fromDate), moment(toDate)] } } : null,
        { UserId: req.user.merchantId },
      );
      const { rows, count } = await SmsErrorLogModel.findAndCountAll({
        where,
        include: [
          {
            model: BankOfficialModel,
            as: 'Bank',
          },
        ],
        order: [
          ['id', 'DESC'],
        ],
        limit: pageSize,
        offset: cursor,
      });
      const responseData: any = {
        data: rows,
        pagination: {
          page: page,
          pageSize: pageSize,
          total: count,
        },
      };
      sendSuccess(res, responseData);
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }
}

export default new SmsErrorController();
