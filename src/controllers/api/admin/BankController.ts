import { Request, Response } from 'express';
import { sendError, sendSuccess } from '@libs/response';
import BankOfficialModel from '@models/banks';

class BankController {
  public async getAll (req: Request, res: Response) {
    try {
      const page: number = parseInt(req.query.page ? req.query.page.toString() : '1');
      const pageSize: number = parseInt(req.query.pageSize ? req.query.pageSize.toString() : '20');
      const statusShowWithdraw: any = req.query.statusShowWithdraw ? req.query.statusShowWithdraw : null;
      const cursor: number = (page - 1) * pageSize;

      const where = Object.assign({},
        statusShowWithdraw ? { statusShowWithdraw: req.query.statusWithdrawAuto } : null,
      );
      const { rows, count } =
       await BankOfficialModel.findAndCountAll({
         where,
         attributes: ['id', 'bankFullName', ['bankBID', 'napasID'], 'bankName', 'bankCode', 'statusShowWithdraw', 'order'],
         order: [
           ['statusShowWithdraw', 'DESC'],
           ['order', 'DESC'],
           ['bankName', 'ASC'],
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

  public async show (req: Request, res: Response) {
    try {
      const bank = await BankOfficialModel.findByPk(req.params.id);
      if (!bank) {
        return sendError(res, 404, 'no data');
      }
      sendSuccess(res, { bank });
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }

  public async patch (req: Request, res: Response) {
    try {
      const bank = await BankOfficialModel.findByPk(req.params.id);
      if (!bank) {
        return sendError(res, 404, 'no data');
      }
      const bankUpdated = await bank.update(req.body);
      sendSuccess(res, { bank: bankUpdated });
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }
}

export default new BankController();
