import moment from 'moment';
import XLSX from 'xlsx';
import { Request, Response } from 'express';
import { col, fn, Op } from 'sequelize';
import { customAlphabet } from 'nanoid';
import { cloneDeep, trim } from 'lodash';

import { withdrawCallback } from '@libs/callbackToMerchant';
import { LOG_TARGET, WITHDRAW_CALLBACK_STATUS, WITHDRAW_ERROR_MESS, WITHDRAW_STATUS, WITHDRAW_TRANSFER_STATUS } from '@libs/constants';
import { decryptStringWithRsaPrivateKey } from '@libs/crypto';
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
import WithDrawService from '@services/WithDrawService';

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

  public async forceUpdate (req: Request, res: Response) {
    try {
      const wdLog: any = await WithdrawRequest.findByPk(req.params.id, {
        include: [
          {
            model: BankOfficialModel,
            as: 'Bank',
          },
        ],
      });
      if (!wdLog) {
        return sendError(res, 404, 'no data request withdraw');
      }
      const beforeWdLog = cloneDeep(wdLog);
      const updated = await wdLog.update({
        status: req.body.status,
        statusTransfer: req.body.statusTransfer,
      });
      // Save log
      const newLog: any = {
        UserId: req.user.id,
        targetName: LOG_TARGET.REQUEST_WITHDRAW,
        message: JSON.stringify({ id: req.params.id, clientIp: decryptStringWithRsaPrivateKey(req.headers['x-client-ip'] as string) || '', before: beforeWdLog, after: updated }),
        type: 'success',
      };
      await SystemLogModel.create(newLog);
      sendSuccess(res, { wdLog: updated });
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }

  public async confirm (req: Request, res: Response) {
    try {
      const wdLog: any = await WithdrawRequest.findByPk(req.params.id, {
        include: [
          {
            model: BankOfficialModel,
            as: 'Bank',
          },
        ],
      });
      if (!wdLog) {
        return sendError(res, 404, 'no data request withdraw');
      }

      const blackAcc = await BlackListModel.findOne({ where: { bankAccNumber: wdLog.bankAccNumber } });
      if (blackAcc) {
        return sendError(res, 403, 'account number is blocked');
      }

      const allowWithdraw = await SystemSettingsModel.findOne({ where: { key: 'ALLOW_WITHDRAW' } });
      if (req.body.status === WITHDRAW_STATUS.SUCCESS && allowWithdraw.value === 'off') {
        return sendError(res, 403, 'not allow to withdraw at this time');
      }
      if (req.body.status === WITHDRAW_STATUS.SUCCESS && (wdLog.statusTransfer === WITHDRAW_TRANSFER_STATUS.ERROR || wdLog.status !== WITHDRAW_STATUS.SUCCESS)) {
        const beforeWdLog = cloneDeep(wdLog);
        const updated = await wdLog.update({
          status: WITHDRAW_STATUS.SUCCESS,
          statusTransfer: WITHDRAW_TRANSFER_STATUS.PROCESSING,
          AdminId: req.user.id,
        });

        // Save log
        const newLog: any = {
          UserId: req.user.id,
          targetName: LOG_TARGET.REQUEST_WITHDRAW,
          message: JSON.stringify({ id: req.params.id, clientIp: decryptStringWithRsaPrivateKey(req.headers['x-client-ip'] as string) || '', before: beforeWdLog, after: updated }),
          type: 'success',
        };
        await SystemLogModel.create(newLog);

        const accBankWithdraw = await AccountBankModel.findOne({ where: { type: 'withdraw' } });
        await WithDrawService.createRequest({
          WithDrawId: wdLog.id,
          BID: wdLog.Bank?.bankBID,
          bankAccNumber: wdLog.bankAccNumber,
          bankAccName: wdLog.bankAccName,
          transferAmount: wdLog.transferAmount,
          transferId: wdLog.transferId,
          message: '',
          fromAccNumber: accBankWithdraw.bankAccNumber,
          adminUsername: req.user.username as string,
          clientIP: decryptStringWithRsaPrivateKey(req.headers['x-client-ip'] as string) || '',
        }, wdLog.partnerReference);
        sendSuccess(res, { wdLog: updated });
      } else {
        return sendError(res, 404, 'no data request withdraw');
      }
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }

  public async update (req: Request, res: Response) {
    try {
      const wdLog: any = await WithdrawRequest.findByPk(req.params.id, {
        include: [
          {
            model: BankOfficialModel,
            as: 'Bank',
          },
        ],
      });
      if (!wdLog) {
        return sendError(res, 404, 'no data request withdraw');
      }

      if (req.body.status === WITHDRAW_STATUS.CANCELED) {
        const beforeWdLog = cloneDeep(wdLog);
        const updated = await wdLog.update({ ...req.body, statusTransfer: WITHDRAW_TRANSFER_STATUS.CANCELED, AdminId: req.user.id });

        // Save log
        const newLog: any = {
          UserId: req.user.id,
          targetName: LOG_TARGET.REQUEST_WITHDRAW,
          message: JSON.stringify({ id: req.params.id, clientIp: decryptStringWithRsaPrivateKey(req.headers['x-client-ip'] as string) || '', before: beforeWdLog, after: updated }),
          type: 'canceled',
        };
        await SystemLogModel.create(newLog);

        if (beforeWdLog.statusTransfer === WITHDRAW_TRANSFER_STATUS.PENDDING || beforeWdLog.statusTransfer === WITHDRAW_TRANSFER_STATUS.ERROR) {
          try {
            // Create callback to gate
            const newCallbackData: any = {
              code: 1,
              message: WITHDRAW_STATUS.CANCELED,
              data: {
                callbackType: 'withdraw',
                partnerReference: wdLog?.partnerReference,
                requestId: wdLog.requestId,
                chargeType: 'bank',
                transferAmount: wdLog.transferAmount,
                status: WITHDRAW_STATUS.CANCELED,
                note: updated.note,
              },
              signature: signCallback(`${req.user.apiKey}${wdLog?.partnerReference}${wdLog.requestId}`),
            };

            // Update Callback
            const accBank: any = await AccountBankModel.findOne({ where: { type: 'withdraw' } });
            withdrawCallback(accBank.callBackUrl, newCallbackData, wdLog.id);
            const clientIP = decryptStringWithRsaPrivateKey(req.headers['x-client-ip'] as string) || '';
            notiRequestWithdraw(`
              ${req.user.username} HỦY yêu cầu rút - <a href="https://www.iplocation.net/?query=${clientIP}">${clientIP}</a>
              =========================
              NickName: <b>${wdLog?.partnerReference}</b>
              Số tiền: <b>${wdLog.transferAmount?.toLocaleString()} đ</b>
              TransferId: ${wdLog.transferId} 
            `, wdLog.transferAmount);
          } catch (e) {
            console.log(e.message);
          }
        }
        sendSuccess(res, { wdLog: updated });
      }
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

  public async callback (req: Request, res: Response) {
    try {
      const wdLog: any = await WithdrawRequest.findOne({
        where: {
          transferId: req.body.transferId,
        },
      });
      if (!wdLog) {
        return sendError(res, 404, 'no data');
      }
      const beforeWdLog = cloneDeep(wdLog);
      const updated = await wdLog.update({ statusTransfer: req.body.statusTransfer });

      // Save log
      const newLog: any = {
        UserId: -1,
        targetName: LOG_TARGET.REQUEST_WITHDRAW,
        message: JSON.stringify({ id: req.params.id, clientIp: '', before: beforeWdLog, after: updated, callbackPayload: req.body }),
        type: 'update',
      };
      await SystemLogModel.create(newLog);
      const callbackErrorCode = parseInt(req.body.error_code);
      if (callbackErrorCode >= 2) {
        try {
          // Nếu thông tin người nhận sai thì tự động hủy yêu cầu rút
          if (callbackErrorCode === 3) {
            // Noti
            notiRequestWithdraw(`
              Chuyển khoản thất bại: Thông tin không hợp lệ
              =========================
              NickName: ${wdLog.partnerReference}
              Số tiền: <b>${wdLog.transferAmount.toLocaleString()} đ</b>
              Số tài khoản: ${wdLog.bankAccNumber} 
              Tên tài khoản: ${wdLog.bankAccName}
            `, wdLog.transferAmount);
          }

          // Nếu có vấn đề chuyển bước cuối lỗi nhưng tiền đã đi chờ SMS để xác nhận
          if (callbackErrorCode === 5) {
            await updated.update({ status: WITHDRAW_STATUS.SUCCESS, statusTransfer: WITHDRAW_TRANSFER_STATUS.CHECKING });
          }

          // Update Callback
          const accBank: any = await AccountBankModel.findOne({ where: { type: 'withdraw', bankAccNumber: req.body.data.from_account } });
          if (accBank) {
            // Nếu tài khoản hết tiền
            if (callbackErrorCode === 4) {
              // Noti
              notiRequestWithdraw(`
                <b>TÀI KHOẢN HẾT TIỀN</b>
                =========================
                NickName: ${wdLog.partnerReference}
                Số tiền: <b>${wdLog.transferAmount.toLocaleString()} đ</b>
                Số tài khoản: ${wdLog.bankAccNumber} 
                Tên tài khoản: ${wdLog.bankAccName}
                Số dư hiện tại: <b>${parseInt(accBank.bankAccBalance, 10).toLocaleString()} đ</b>
              `, wdLog.transferAmount);
            }
            await accBank.update({ bankAccBalance: parseInt(req.body.data?.balance, 10) });
          }
        } catch (e) {
          console.log(e.message);
        }
      } else {
        const newCallbackData: any = {
          code: 0,
          message: WITHDRAW_ERROR_MESS.get('0'),
          data: {
            callbackType: 'withdraw',
            partnerReference: wdLog?.partnerReference,
            requestId: wdLog.requestId,
            chargeType: 'bank',
            transferAmount: wdLog.transferAmount,
            status: WITHDRAW_STATUS.SUCCESS,
          },
          signature: signCallback(`${req.user.apiKey}${wdLog?.partnerReference}${wdLog.requestId}`),
        };

        // Update Callback
        const accBank: any = await AccountBankModel.findOne({ where: { type: 'withdraw', bankAccNumber: req.body.data.from_account } });
        if (accBank) {
          // Noti
          let screenShotUrl = '';
          req.body.data?.screenshots?.forEach((element: any, index: number) => {
            screenShotUrl += `<a href="${element}">Screenshot ${index + 1}</a> `;
          });
          notiRequestWithdraw(`
            Chuyển khoản thành công
            NickName: ${wdLog.partnerReference}
            Số tiền: <b>${wdLog.transferAmount.toLocaleString()} đ</b>
            Số tài khoản: ${req.body.data.to_account} 
            Tên tài khoản: ${req.body.data.to_account_name} 
            Số dư hiện tại: <b>${parseInt(req.body.data?.balance, 10).toLocaleString()} đ</b>
            =========================
            ${screenShotUrl}
          `, wdLog.transferAmount);
          await accBank.update({ bankAccBalance: parseInt(req.body.data?.balance, 10) });
          withdrawCallback(accBank.callBackUrl, newCallbackData, wdLog.id);
        }
      }
      sendSuccess(res, { wdLog: updated });
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }

  public async retryCallback (req: Request, res: Response) {
    try {
      const withdrawRequest = await WithdrawRequest.findByPk(req.params.id);
      if (!withdrawRequest) {
        return sendError(res, 404, 'no data');
      }
      if (withdrawRequest.status === WITHDRAW_STATUS.SUCCESS) {
        const newCallbackData: any = {
          code: 0,
          message: WITHDRAW_ERROR_MESS.get('0'),
          data: {
            callbackType: 'withdraw',
            partnerReference: withdrawRequest?.partnerReference,
            requestId: withdrawRequest.requestId,
            chargeType: 'bank',
            transferAmount: withdrawRequest.transferAmount,
            status: withdrawRequest.status,
          },
          signature: signCallback(`${req.user.apiKey}${withdrawRequest?.partnerReference}${withdrawRequest.requestId}`),
        };
        const accBank: any = await AccountBankModel.findOne({ where: { type: 'withdraw', bankAccNumber: req.body.data.from_account } });
        if (accBank) {
          withdrawCallback(accBank.callBackUrl, newCallbackData, withdrawRequest.id);
        }
        sendSuccess(res, { withdrawRequest });
      } else {
        return sendError(res, 404, 'invalid status');
      }
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }

  public async retryWithdraw (req: Request, res: Response) {
    try {
      const wdLog: any = await WithdrawRequest.findByPk(req.params.id, {
        include: [
          {
            model: BankOfficialModel,
            as: 'Bank',
          },
        ],
      });
      if (!wdLog) {
        return sendError(res, 404, 'no data');
      }
      if (wdLog.statusTransfer === 'error' && wdLog.status === 'success') {
        const beforeWdLog = cloneDeep(wdLog);
        const updated = await wdLog.update({
          status: 'success',
          AdminId: req.user.id,
        });

        // Save log
        const newLog: any = {
          UserId: -1,
          targetName: LOG_TARGET.REQUEST_WITHDRAW,
          message: JSON.stringify({ id: req.params.id, clientIp: decryptStringWithRsaPrivateKey(req.headers['x-client-ip'] as string) || '', before: beforeWdLog, after: updated }),
          type: 'retry',
        };
        await SystemLogModel.create(newLog);

        const accBankWithdraw = await AccountBankModel.findOne({ where: { type: 'withdraw' } });
        await WithDrawService.createRequest({
          WithDrawId: wdLog.id,
          BID: wdLog.Bank?.bankBID,
          bankAccNumber: wdLog.bankAccNumber,
          bankAccName: wdLog.bankAccName,
          transferAmount: wdLog.transferAmount,
          transferId: wdLog.transferId,
          message: '',
          fromAccNumber: accBankWithdraw.bankAccNumber,
          adminUsername: req.user.username as string,
          clientIP: decryptStringWithRsaPrivateKey(req.headers['x-client-ip'] as string) || '',
        }, wdLog.partnerReference);
        sendSuccess(res, { wdLog: updated });
      } else {
        sendError(res, 404, 'invalid status');
      }
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
        statusCallback: blackAcc ? WITHDRAW_CALLBACK_STATUS.ERROR : WITHDRAW_CALLBACK_STATUS.PENDDING,
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
