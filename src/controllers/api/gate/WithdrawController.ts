import moment from 'moment';
import XLSX from 'xlsx';
import { Request, Response } from 'express';
import { col, fn, Op } from 'sequelize';
import { customAlphabet } from 'nanoid';
import { cloneDeep, trim } from 'lodash';

import { withdrawCallback } from '@libs/callbackToMerchant';
import { LOG_TARGET, WITHDRAW_CALLBACK_STATUS, WITHDRAW_STATUS, WITHDRAW_TRANSFER_STATUS } from '@libs/constants';
import { sendError, sendSuccess } from '@libs/response';
import { signCallback } from '@libs/sign';
import { notiRequestWithdraw } from '@libs/telegramBot';

import AccountBankModel from '@models/accountBank';
import BankOfficialModel from '@models/banks';
import BlackListModel from '@models/blackList';
import SystemLogModel from '@models/systemLogs';
import SystemSettingsModel from '@models/systemSettings';
import UserModel from '@models/users';
import WithdrawRequest from '@models/withdrawRequest';

import ExcelService from '@services/ExcelService';

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

      const whereCondition = Object.assign({},
        transferId == null ? null : { transferId: { [Op.like]: `%${transferId.trim()}%` } },
        requestId == null ? null : { requestId: { [Op.like]: `%${requestId.trim()}%` } },
        transferMessage == null ? null : { transferMessage: { [Op.like]: `%${transferMessage.trim()}%` } },
        partnerReference == null ? null : { partnerReference: { [Op.like]: `%${partnerReference.trim()}%` } },
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
        const result = await WithdrawRequest.findAll({
          paranoid: false,
          include: [
            {
              model: BankOfficialModel,
              as: 'Bank',
              attributes: [
                'id',
                'bankFullName',
                'bankBID',
                'bankName',
                'bankCode',
              ],
            },
            {
              model: UserModel,
              as: 'Admin',
              attributes: ['id', 'username', 'fullName'],
              required: false,
            },
          ],
          where: whereCondition,
          order: orderBy,
        });
        const wb: any = await ExcelService.listWithdrawLogs(result);
        const data = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        return res.end(data);
      }
      const { rows, count } = await WithdrawRequest.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: BankOfficialModel,
            as: 'Bank',
            attributes: [
              'id',
              'bankFullName',
              'bankBID',
              'bankName',
              'bankCode',
            ],
          },
          {
            model: UserModel,
            as: 'Admin',
            attributes: ['id', 'username', 'fullName'],
            required: false,
          },
        ],
        order: orderBy,
        limit: pageSize,
        offset: cursor,
      });

      const countSuccess: any = await WithdrawRequest.count({
        paranoid: false,
        where: { ...whereCondition, ...{ status: WITHDRAW_STATUS.SUCCESS } },
      });
      const sumSuccess: any = await WithdrawRequest.findAll({
        paranoid: false,
        where: { ...whereCondition, ...{ status: WITHDRAW_STATUS.SUCCESS } },
        attributes: [
          [fn('sum', col('transferAmount')), 'total_amount'],
        ],
        raw: true,
      });

      const countTransferSuccess: any = await WithdrawRequest.count({
        paranoid: false,
        where: { ...whereCondition, ...{ status: WITHDRAW_STATUS.SUCCESS, statusTransfer: WITHDRAW_CALLBACK_STATUS.SUCCESS } },
      });
      const sumTransferSuccess: any = await WithdrawRequest.findAll({
        paranoid: false,
        where: { ...whereCondition, ...{ status: WITHDRAW_STATUS.SUCCESS, statusTransfer: WITHDRAW_CALLBACK_STATUS.SUCCESS } },
        attributes: [
          [fn('sum', col('transferAmount')), 'total_amount'],
        ],
        raw: true,
      });

      const countTransferError: any = await WithdrawRequest.count({
        paranoid: false,
        where: { ...whereCondition, ...{ status: WITHDRAW_STATUS.SUCCESS, statusTransfer: WITHDRAW_CALLBACK_STATUS.ERROR } },
      });
      const sumTransferError: any = await WithdrawRequest.findAll({
        paranoid: false,
        where: { ...whereCondition, ...{ status: WITHDRAW_STATUS.SUCCESS, statusTransfer: WITHDRAW_CALLBACK_STATUS.ERROR } },
        attributes: [
          [fn('sum', col('transferAmount')), 'total_amount'],
        ],
        raw: true,
      });

      const countPendding: any = await WithdrawRequest.count({
        paranoid: false,
        where: { ...whereCondition, ...{ status: WITHDRAW_STATUS.PENDDING } },
      });
      const sumPendding: any = await WithdrawRequest.findAll({
        paranoid: false,
        where: { ...whereCondition, ...{ status: WITHDRAW_STATUS.PENDDING } },
        attributes: [
          [fn('sum', col('transferAmount')), 'total_amount'],
        ],
        raw: true,
      });

      const countError: any = await WithdrawRequest.count({
        paranoid: false,
        where: { ...whereCondition, ...{ [Op.or]: [{ status: WITHDRAW_STATUS.CANCELED }, { status: null }] } },
      });
      const sumError: any = await WithdrawRequest.findAll({
        paranoid: false,
        where: { ...whereCondition, ...{ [Op.or]: [{ status: WITHDRAW_STATUS.CANCELED }, { status: null }] } },
        attributes: [
          [fn('sum', col('transferAmount')), 'total_amount'],
        ],
        raw: true,
      });

      const allowWithdraw = await SystemSettingsModel.findOne({ where: { key: 'ALLOW_WITHDRAW' } });

      const responseData: any = {
        data: rows,
        pagination: {
          page: page,
          pageSize: pageSize,
          total: count,
        },
        countSuccess: parseInt(countSuccess),
        sumSuccess: parseInt(sumSuccess[0]?.total_amount),
        countTransferSuccess: parseInt(countTransferSuccess),
        sumTransferSuccess: parseInt(sumTransferSuccess[0]?.total_amount),
        countTransferError: parseInt(countTransferError),
        sumTransferError: parseInt(sumTransferError[0]?.total_amount),
        countPendding: parseInt(countPendding),
        sumPendding: parseInt(sumPendding[0]?.total_amount),
        countError: parseInt(countError),
        sumError: parseInt(sumError[0]?.total_amount),
        allowWithdraw: allowWithdraw,
      };
      sendSuccess(res, responseData);
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }

  public async show (req: Request, res: Response) {
    try {
      const data: any = await WithdrawRequest.findOne({ where: { requestId: req.params.id } });
      if (!data) {
        return sendError(res, 404, 'no data request withdraw');
      }
      return sendSuccess(res, data);
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }

  public async callbackGate (req: Request, res: Response) {
    try {
      const wdLog: any = await WithdrawRequest.findOne({
        where: {
          requestId: req.body.requestId,
        },
      });
      if (!wdLog) {
        return sendError(res, 404, 'no data');
      }
      const beforeWdLog = cloneDeep(wdLog);
      if (req.body.statusRequest === WITHDRAW_STATUS.CANCELED) {
        await wdLog.update({ status: WITHDRAW_STATUS.CANCELED, statusTransfer: WITHDRAW_TRANSFER_STATUS.CANCELED, note: req.body.note });
      }

      // Save log
      const newLog: any = {
        UserId: -1,
        targetName: LOG_TARGET.REQUEST_WITHDRAW,
        message: JSON.stringify({ id: wdLog.id, clientIp: '', before: beforeWdLog, after: wdLog, callbackPayload: req.body }),
        type: 'update',
      };
      await SystemLogModel.create(newLog);
      sendSuccess(res, { wdLog });
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }

  public async create (req: Request, res: Response) {
    try {
      const bank = await BankOfficialModel.findOne({ where: { bankBID: req.body.napasID } });
      if (!bank) {
        return sendError(res, 404, 'invalid bank');
      }
      const existRequest = await WithdrawRequest.findOne({ where: { requestId: trim(req.body.requestId) } });
      if (existRequest) {
        return sendError(res, 404, 'requestId duplicate');
      }
      const blackAcc = await BlackListModel.findOne({ where: { bankAccNumber: req.body.bankAccNumber } });
      const nanoId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);
      const transferId = `${moment(new Date()).format('YYYYMMDD')}${nanoId()}`;
      const newRequest: any = {
        UserId: req.user.merchantId,
        transferId,
        requestId: req.body.requestId,
        partnerReference: req.body.partnerReference,
        note: blackAcc ? 'STK rút về nằm trong blacklist' : req.body.note,

        bankId: bank.id,
        bankAccNumber: req.body.bankAccNumber,
        bankAccName: req.body.bankAccName,
        transferAmount: req.body.transferAmount,
        transferMessage: (req.body.transferMessage || transferId).replace('-', ' '),

        status: blackAcc ? WITHDRAW_STATUS.CANCELED : WITHDRAW_STATUS.PENDDING,
        statusTransfer: blackAcc ? WITHDRAW_TRANSFER_STATUS.CANCELED : WITHDRAW_TRANSFER_STATUS.PENDDING,
        statusCallback: blackAcc ? WITHDRAW_TRANSFER_STATUS.CANCELED : WITHDRAW_TRANSFER_STATUS.PENDDING,
      };
      const wdLog = await WithdrawRequest.create(newRequest);
      if (blackAcc) {
        // Noti
        notiRequestWithdraw(`
          Từ chối giao dịch trong Blacklist
          =========================
          NickName: ${wdLog.partnerReference}
          Số tiền: <b>${wdLog.transferAmount.toLocaleString()} đ</b>
          Số tài khoản: ${wdLog.bankAccNumber} 
          Tên tài khoản: ${wdLog.bankAccName}
        `, wdLog.transferAmount);
        const newCallbackData: any = {
          code: 1,
          message: 'Từ chối giao dịch trong Blacklist',
          data: {
            callbackType: 'withdraw',
            partnerReference: wdLog?.partnerReference,
            requestId: wdLog.requestId,
            chargeType: 'bank',
            transferAmount: wdLog.transferAmount,
            status: WITHDRAW_STATUS.CANCELED,
          },
          signature: signCallback(`${req.user.apiKey}${wdLog?.partnerReference}${wdLog.requestId}`),
        };
        const accBank: any = await AccountBankModel.findOne({ where: { type: 'withdraw', status: 'active' } });
        if (accBank) {
          withdrawCallback(accBank.callBackUrl, newCallbackData, wdLog.id);
        }
      }
      sendSuccess(res, { wdLog });
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }
}

export default new WithdrawController();
