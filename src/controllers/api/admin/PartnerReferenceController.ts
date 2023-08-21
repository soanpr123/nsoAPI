import { Request, Response } from 'express';
import { sendError, sendSuccess } from '@libs/response';
import moment from 'moment';
import TopupRequestModel from '@models/topupRequest';
import { col, fn, Op } from 'sequelize';
import WithdrawModel from '@models/withdrawRequest';
import { TOPUP_CALLBACK_STATUS, TOPUP_STATUS, TOPUP_TRANSFER_STATUS, WITHDRAW_STATUS, WITHDRAW_TRANSFER_STATUS } from '@libs/constants';

class PartnerReferenceController {
  public async getOneByPartnerReference (req: Request, res: Response) {
    try {
      const fromDate: any = req.query.fromDate ? Number(req.query.fromDate) : moment(Date.now()).startOf('year');
      const toDate: any = req.query.toDate ? Number(req.query.toDate) : Date.now();
      const where = Object.assign({},
        fromDate && toDate ? { createdAt: { [Op.between]: [moment(fromDate), moment(toDate)] } } : null,
      );
      const sumTopup: any = await TopupRequestModel.findAll({
        where: {
          UserId: req.user.merchantId,
          partnerReference: req.query.partnerReference,
          status: TOPUP_STATUS.SUCCESS,
          statusTransfer: TOPUP_TRANSFER_STATUS.SUCCESS,
          statusCallback: TOPUP_CALLBACK_STATUS.SUCCESS,
          ...where,
        },
        attributes: [
          [fn('sum', col('transferAmount')), 'total_amount'],
        ],
        group: ['UserId'],
        raw: true,
      });
      const sumWithdraw: any = await WithdrawModel.findAll({
        where: {
          UserId: req.user.merchantId,
          partnerReference: req.query.partnerReference,
          status: WITHDRAW_STATUS.SUCCESS,
          statusTransfer: WITHDRAW_TRANSFER_STATUS.SUCCESS,
          ...where,
        },
        attributes: [
          [fn('sum', col('transferAmount')), 'total_amount'],
        ],
        group: ['UserId'],
        raw: true,
      });
      const responseData = {
        sumTopup,
        sumWithdraw,
      };
      sendSuccess(res, responseData);
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }
}

export default new PartnerReferenceController();
