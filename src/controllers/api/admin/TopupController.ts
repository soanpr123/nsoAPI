import { Request, Response } from 'express';
import { sendError, sendSuccess } from '@libs/response';
import { col, fn, Op } from 'sequelize';
import moment from 'moment';
import ExcelService from '@services/ExcelService';
import XLSX from 'xlsx';
import { customAlphabet } from 'nanoid';
import TopupRequestModel from '@models/topupRequest';
import AccountBankModel from '@models/accountBank';
import BankOfficialModel from '@models/banks';
import { cloneDeep, trim } from 'lodash';
import { signCallback } from '@libs/sign';
import { LOG_TARGET, TOPUP_CALLBACK_STATUS, TOPUP_STATUS, TOPUP_TRANSFER_STATUS } from '@libs/constants';
import { topupCallback } from '@libs/callbackToMerchant';
import { retryCallbackTopup } from '@libs/actionRequest';
import SmsTopupModel from '@models/smsTopup';
import SystemLogModel from '@models/systemLogs';
import { decryptStringWithRsaPrivateKey } from '@libs/crypto';

class WithdrawController {
  public async getAll (req: Request, res: Response) {
    try {
      const page: number = parseInt(req.query.page ? req.query.page.toString() : '1');
      const pageSize: number = parseInt(req.query.pageSize ? req.query.pageSize.toString() : '20');
      const fromDate: any = req.query.fromDate ? Number(req.query.fromDate) : moment(Date.now()).startOf('year');
      const toDate: any = req.query.toDate ? Number(req.query.toDate) : Date.now();
      const cursor: number = (page - 1) * pageSize;

      const download: boolean = !!req.query.download;

      const transferId: any = req.query.transferId ? req.query.transferId : null;
      const requestId: any = req.query.requestId ? req.query.requestId : null;
      const transferMessage: any = req.query.transferMessage ? req.query.transferMessage : null;
      const partnerReference: any = req.query.partnerReference ? req.query.partnerReference : null;

      const where = Object.assign({},
        transferId == null ? null : { transferId: { [Op.like]: `%${transferId.trim()}%` } },
        requestId == null ? null : { requestId: { [Op.like]: `%${requestId.trim()}%` } },
        transferMessage == null ? null : { transferMessage: { [Op.like]: `%${transferMessage.trim()}%` } },
        partnerReference == null ? null : { partnerReference: { [Op.like]: `%${partnerReference.trim()}%` } },
        req.query.statusCallback == null ? null : { statusCallback: req.query.statusCallback },
        req.query.status == null ? null : { status: req.query.status },
        req.query.statusTransfer == null ? null : { statusTransfer: req.query.statusTransfer },
        fromDate && toDate ? { createdAt: { [Op.between]: [moment(fromDate), moment(toDate)] } } : null,
        { UserId: req.user.merchantId },
      );

      const orderBy: any[] = [
        req.query.orderBy == null ? ['id', 'DESC'] : [req.query.orderBy, req.query.sort || 'DESC'],
        ['createdAt', 'DESC'],
      ];

      if (download) {
        const result = await TopupRequestModel.findAll({
          paranoid: false,
          where,
          include: [
            {
              model: AccountBankModel,
              as: 'AccBank',
              include: [
                {
                  model: BankOfficialModel,
                  as: 'BankInfo',
                },
              ],
            },
          ],
          order: orderBy,
        });
        const wb: any = await ExcelService.listTopupLogs(result);
        const data = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        return res.end(data);
      }
      const { rows, count } = await TopupRequestModel.findAndCountAll({
        paranoid: false,
        where,
        include: [
          {
            model: AccountBankModel,
            as: 'AccBank',
            required: false,
            include: [
              {
                model: BankOfficialModel,
                as: 'BankInfo',
                required: false,
              },
            ],
          },
          {
            model: SmsTopupModel,
            as: 'SmsTopup',
          },
        ],
        order: orderBy,
        limit: pageSize,
        offset: cursor,
      });

      const countSuccess: any = await TopupRequestModel.count({
        paranoid: false,
        where: { ...where, ...{ status: 'success' } },
      });
      const sumSuccess: any = await TopupRequestModel.findAll({
        paranoid: false,
        where: { ...where, ...{ status: 'success' } },
        attributes: [
          [fn('sum', col('transferAmount')), 'total_amount'],
        ],
        raw: true,
      });

      const countPendding: any = await TopupRequestModel.count({
        paranoid: false,
        where: { ...where, ...{ status: 'pendding' } },
      });
      const sumPendding: any = await TopupRequestModel.findAll({
        paranoid: false,
        where: { ...where, ...{ status: 'pendding' } },
        attributes: [
          [fn('sum', col('requestAmount')), 'total_amount'],
        ],
        raw: true,
      });

      const countError: any = await TopupRequestModel.count({
        paranoid: false,
        where: { ...where, ...{ [Op.or]: [{ status: 'canceled' }, { status: null }] } },
      });
      const sumError: any = await TopupRequestModel.findAll({
        paranoid: false,
        where: { ...where, ...{ [Op.or]: [{ status: 'canceled' }, { status: null }] } },
        attributes: [
          [fn('sum', col('requestAmount')), 'total_amount'],
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
        countSuccess: parseInt(countSuccess),
        sumSuccess: parseInt(sumSuccess[0]?.total_amount),
        countPendding: parseInt(countPendding),
        sumPendding: parseInt(sumPendding[0]?.total_amount),
        countError: parseInt(countError),
        sumError: parseInt(sumError[0]?.total_amount),
      };
      sendSuccess(res, responseData);
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }

  public async retryCallback (req: Request, res: Response) {
    try {
      const topupRequest = await TopupRequestModel.findByPk(req.params.id);
      if (!topupRequest) {
        return sendError(res, 404, 'no data');
      }
      if (topupRequest.status === TOPUP_STATUS.SUCCESS) {
        await retryCallbackTopup(topupRequest, req.user);
        sendSuccess(res, { topupRequest });
      } else {
        return sendError(res, 404, 'invalid status');
      }
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }

  public async create (req: Request, res: Response) {
    try {
      const accBank = await AccountBankModel.findOne({
        where: {
          id: req.body.accBankID,
        },
        include: [
          {
            model: BankOfficialModel,
            as: 'BankInfo',
            required: true,
          },
        ],
      });
      if (!accBank) {
        return sendError(res, 404, 'invalid bank');
      } else if (accBank.type !== 'topup') {
        return sendError(res, 404, 'invalid acc bank');
      }
      const existRequest = await TopupRequestModel.findOne({ where: { requestId: trim(req.body.requestId) } });
      if (existRequest) {
        return sendError(res, 404, 'requestId duplicate');
      }
      const nanoId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);
      const transferId = `${moment(new Date()).format('YYYYMMDD')}${nanoId()}`;
      const newRequest: any = {
        UserId: req.user.merchantId,

        accBankId: accBank.id,
        note: req.body.note,
        transferId,

        requestId: req.body.requestId,
        partnerReference: req.body.partnerReference,
        transferMessage: (req.body.transferMessage || req.body.partnerReference).replace('-', ' '),
        requestAmount: parseInt(req.body.requestAmount as string, 10),

        status: TOPUP_STATUS.PENDDING,
        statusTransfer: TOPUP_TRANSFER_STATUS.PENDDING,
        statusCallback: TOPUP_CALLBACK_STATUS.PROCESSING,
      };
      const topupRequest = await TopupRequestModel.create(newRequest);
      sendSuccess(res, { topupRequest });
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }

  public async createManual (req: Request, res: Response) {
    try {
      const accBank = await AccountBankModel.findOne({
        where: {
          id: req.body.accBankID,
        },
        include: [
          {
            model: BankOfficialModel,
            as: 'BankInfo',
            required: true,
          },
        ],
      });
      if (!accBank) {
        return sendError(res, 404, 'invalid bank');
      } else if (accBank.type !== 'topup') {
        return sendError(res, 404, 'invalid acc bank');
      }

      const nanoId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);
      const transferId = `${moment(new Date()).format('YYYYMMDD')}_manual_${nanoId()}`;
      const requestId = `${moment(new Date()).format('YYYYMMDD')}_manual_${nanoId()}`;
      const existRequest = await TopupRequestModel.findOne({ where: { requestId } });
      if (existRequest) {
        return sendError(res, 404, 'requestId duplicate');
      }

      const newRequest: any = {
        UserId: req.user.merchantId,
        AdminId: req.user.id,

        accBankId: accBank.id,
        note: req.body.note,
        transferId,

        requestId,
        partnerReference: req.body.partnerReference,
        transferMessage: (req.body.transferMessage || req.body.partnerReference).replace('-', ' '),
        requestAmount: parseInt(req.body.requestAmount as string, 10),
        transferAmount: parseInt(req.body.requestAmount as string, 10),

        status: TOPUP_STATUS.SUCCESS,
        statusTransfer: TOPUP_TRANSFER_STATUS.SUCCESS,
        statusCallback: null,
      };
      const topupRequest = await TopupRequestModel.create(newRequest);

      // Save log
      const newLog: any = {
        UserId: req.user.id,
        targetName: LOG_TARGET.REQUEST_TOPUP,
        message: JSON.stringify({ id: req.params.id, clientIp: decryptStringWithRsaPrivateKey(req.headers['x-client-ip'] as string) || '', after: topupRequest }),
        type: 'created',
      };
      await SystemLogModel.create(newLog);

      sendSuccess(res, { topupRequest });
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }

  public async delete (req: Request, res: Response) {
    try {
      const topupRequest = await TopupRequestModel.findByPk(req.params.id);
      if (!topupRequest) {
        return sendError(res, 404, 'no data');
      }
      topupRequest.destroy({ force: true });
      sendSuccess(res, { id: req.params.id });
    } catch (e) {
      console.log(e.message);
    }
  }

  public async update (req: Request, res: Response) {
    try {
      const topupRequest = await TopupRequestModel.findByPk(req.params.id);
      if (!topupRequest) {
        return sendError(res, 404, 'no data');
      }
      const beforeTopupRequest = cloneDeep(topupRequest);
      await topupRequest.update(req.body);
      const updated = await topupRequest.update(req.body);

      // Save log
      const newLog: any = {
        UserId: req.user.id,
        targetName: LOG_TARGET.REQUEST_TOPUP,
        message: JSON.stringify({ id: req.params.id, clientIp: decryptStringWithRsaPrivateKey(req.headers['x-client-ip'] as string) || '', before: beforeTopupRequest, after: updated }),
        type: 'update',
      };
      await SystemLogModel.create(newLog);

      if (req.body.status === TOPUP_STATUS.CANCELED) {
        try {
        // Create callback to gate
          const newCallbackData: any = {
            code: 0,
            message: 'canceled',
            data: {
              callbackType: 'topup',
              partnerReference: topupRequest?.partnerReference,
              requestId: topupRequest.requestId,
              chargeType: 'bank',
              transferAmount: topupRequest.transferAmount,
              status: TOPUP_STATUS.CANCELED,
            },
            signature: signCallback(`${req.user.apiKey}${topupRequest?.partnerReference}${topupRequest.requestId}`),
          };

          // Update Callback
          const accBank: any = AccountBankModel.findByPk(topupRequest.accBankId);
          topupCallback(accBank.callBackUrl, newCallbackData, topupRequest.id);
        } catch (e) {
          console.log(e.message);
        }
      }

      if (req.body.status === TOPUP_STATUS.SUCCESS) {
        try {
        // Create callback to gate
          const newCallbackData: any = {
            code: 0,
            message: 'success',
            data: {
              callbackType: 'topup',
              partnerReference: topupRequest?.partnerReference,
              requestId: topupRequest.requestId,
              chargeType: 'bank',
              transferAmount: topupRequest.transferAmount,
              status: TOPUP_STATUS.SUCCESS,
            },
            signature: signCallback(`${req.user.apiKey}${topupRequest?.partnerReference}${topupRequest.requestId}`),
          };

          // Update Callback
          const accBank: any = AccountBankModel.findByPk(topupRequest.accBankId);
          topupCallback(accBank.callBackUrl, newCallbackData, topupRequest.id);
        } catch (e) {
          console.log(e.message);
        }
      }
      sendSuccess(res, { topupRequest: updated });
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }
}

export default new WithdrawController();
