import { Request, Response } from 'express';
import { sendError, sendSuccess } from '@libs/response';
import { Op } from 'sequelize';
import SmsErrorLogModel from '@models/smsErrorLogs';
import { getOTP } from '@libs/banks';

class SmsErrorController {
  public async getOTP (req: Request, res: Response) {
    try {
      const transactionId: any = req.query.transactionId ? req.query.transactionId : null;
      const phoneReceive: any = req.query.phoneReceive ? req.query.phoneReceive : null;

      const where = Object.assign({},
        transactionId == null ? null : { transferMessage: { [Op.like]: `%${transactionId.trim()}%` } },
        phoneReceive == null ? null : { phoneReceive: phoneReceive },
        { type: 'otp' },
        { UserId: req.user.merchantId },
      );
      const rows = await SmsErrorLogModel.findOne({
        where,
        order: [['id', 'DESC']],
      });
      const data: any[] = [];
      if (rows) {
        data.push(getOTP(rows.transferMessage));
      }
      const responseData: any = {
        data,
      };
      sendSuccess(res, responseData);
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }
}

export default new SmsErrorController();
