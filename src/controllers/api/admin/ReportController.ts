import { Request, Response } from 'express';
import { sendError, sendSuccess } from '@libs/response';
import moment from 'moment';
import TopupRequestModel from '@models/topupRequest';
import { col, fn, Op } from 'sequelize';
import WithdrawModel from '@models/withdrawRequest';
import { TOPUP_CALLBACK_STATUS, TOPUP_STATUS, TOPUP_TRANSFER_STATUS, WITHDRAW_STATUS, WITHDRAW_TRANSFER_STATUS } from '@libs/constants';

class ReportController {
  public async byHour (req: Request, res: Response) {
    try {
      const fromDate: any = req.query.fromDate ? Number(req.query.fromDate) : moment(Date.now()).startOf('year');
      const toDate: any = req.query.toDate ? Number(req.query.toDate) : Date.now();
      const where = Object.assign({},
        fromDate && toDate ? { createdAt: { [Op.between]: [moment(fromDate), moment(toDate)] } } : null,
      );
      const countTopup: any = await TopupRequestModel.findAll({
        where: {
          UserId: req.user.merchantId,
          status: TOPUP_STATUS.SUCCESS,
          statusTransfer: TOPUP_TRANSFER_STATUS.SUCCESS,
          statusCallback: TOPUP_CALLBACK_STATUS.SUCCESS,
          ...where,
        },
        attributes: [
          'hourUpdatedAt',
          [fn('count', col('partnerReference')), 'count_request'],
          [fn('sum', col('transferAmount')), 'sum_amount'],
        ],
        group: ['UserId', 'hourUpdatedAt'],
        raw: true,
      });
      const countWithdraw: any = await WithdrawModel.findAll({
        where: {
          UserId: req.user.merchantId,
          status: WITHDRAW_STATUS.SUCCESS,
          statusTransfer: WITHDRAW_TRANSFER_STATUS.SUCCESS,
          ...where,
        },
        attributes: [
          'hourUpdatedAt',
          [fn('count', col('partnerReference')), 'count_request'],
          [fn('sum', col('transferAmount')), 'sum_amount'],
        ],
        group: ['UserId', 'hourUpdatedAt'],
        raw: true,
      });
      const responseData = {
        countTopup,
        countWithdraw,
      };
      sendSuccess(res, responseData);
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }

  public async byTop (req: Request, res: Response) {
    try {
      const fromDate: any = req.query.fromDate ? Number(req.query.fromDate) : moment(Date.now()).startOf('year');
      const toDate: any = req.query.toDate ? Number(req.query.toDate) : Date.now();
      const limit: any = req.query.limit ? req.query.limit : 20;
      const where = Object.assign({},
        fromDate && toDate ? { createdAt: { [Op.between]: [moment(fromDate), moment(toDate)] } } : null,
      );
      const countTopup: any = await TopupRequestModel.findAll({
        where: {
          UserId: req.user.merchantId,
          status: TOPUP_STATUS.SUCCESS,
          statusTransfer: TOPUP_TRANSFER_STATUS.SUCCESS,
          statusCallback: TOPUP_CALLBACK_STATUS.SUCCESS,
          ...where,
        },
        attributes: [
          'partnerReference',
          [fn('count', col('partnerReference')), 'count_request'],
          [fn('sum', col('transferAmount')), 'sum_ammount'],
        ],
        group: ['UserId', 'partnerReference'],
        order: [[fn('sum', col('transferAmount')), 'DESC']],
        limit,
        raw: true,
      });
      const countWithdraw: any = await WithdrawModel.findAll({
        where: {
          UserId: req.user.merchantId,
          status: WITHDRAW_STATUS.SUCCESS,
          statusTransfer: WITHDRAW_TRANSFER_STATUS.SUCCESS,
          ...where,
        },
        attributes: [
          'partnerReference',
          [fn('count', col('partnerReference')), 'count_request'],
          [fn('sum', col('transferAmount')), 'sum_ammount'],
        ],
        group: ['UserId', 'partnerReference'],
        order: [[fn('sum', col('transferAmount')), 'DESC']],
        limit,
        raw: true,
      });
      const responseData = {
        countTopup,
        countWithdraw,
      };
      sendSuccess(res, responseData);
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }
}

export default new ReportController();
