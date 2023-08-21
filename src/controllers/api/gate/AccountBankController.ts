import { Request, Response } from 'express';
import { sendError, sendSuccess } from '@libs/response';
import AccountBankModel from '@models/accountBank';
import { lowerCase } from 'lodash';
import { Op } from 'sequelize';
import BankOfficialModel from '@models/banks';

class AccountBankController {
  public async getAll (req: Request, res: Response) {
    try {
      const page: number = parseInt(req.query.page ? req.query.page.toString() : '1');
      const pageSize: number = parseInt(req.query.pageSize ? req.query.pageSize.toString() : '20');
      const searchKey: any = req.query.searchKey ? lowerCase(req.query.searchKey as string) : null;
      const cursor: number = (page - 1) * pageSize;

      const where = Object.assign({},
        req.query.status ? { status: req.query.status } : { status: 'active' },
        req.query.type ? { type: req.query.type } : { type: 'topup' },
        searchKey ? { bankAccName: { [Op.substring]: searchKey } } : null,
        { UserId: req.user.merchantId },
      );
      const { rows, count } =
       await AccountBankModel.findAndCountAll({
         where,
         attributes: ['id', 'bankAccName', 'bankAccNumber', 'bankBranchName'],
         include: [
           {
             model: BankOfficialModel,
             as: 'BankInfo',
             attributes: ['bankFullName', ['bankBID', 'napasID'], 'bankName', 'bankCode'],
             order: [
               ['order', 'DESC'],
             ],
             required: false,
           },
         ],
         order: [
           ['createdAt', 'DESC'],
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
      sendSuccess(res, responseData, 'success');
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }

  public async create (req: Request, res: Response) {
    try {
      const newAcc: any = req.body;
      newAcc.UserId = req.user.merchantId;
      const bank = await AccountBankModel.create(newAcc);
      sendSuccess(res, { bank });
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }

  public async patch (req: Request, res: Response) {
    try {
      const bank = await AccountBankModel.findByPk(req.params.id);
      if (!bank) {
        sendError(res, 404, 'no data');
      }
      const bankUpdated = await bank.update(req.body);
      sendSuccess(res, { bank: bankUpdated });
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }

  public async delete (req: Request, res: Response) {
    try {
      const bank = await AccountBankModel.findByPk(req.params.id);
      if (!bank) {
        sendError(res, 404, 'no data');
      }
      const bankUpdated = await bank.destroy();
      sendSuccess(res, { bank: bankUpdated });
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }
}

export default new AccountBankController();
