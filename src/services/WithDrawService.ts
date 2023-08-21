// import { notiSms } from '@libs/telegramBot';
import { LOG_TARGET, WITHDRAW_CALLBACK_STATUS, WITHDRAW_STATUS, WITHDRAW_TRANSFER_STATUS } from '@libs/constants';
import { notiRequestTopup, notiRequestWithdraw } from '@libs/telegramBot';
import SystemLogModel from '@models/systemLogs';
import WithdrawModel from '@models/withdrawRequest';
import axios, { AxiosRequestConfig } from 'axios';

require('dotenv').config();

class WithDrawService {
  public async createRequest (requestInfo: { WithDrawId: number, BID: string, bankAccNumber: string, bankAccName: string, transferAmount: number, transferId: string, message: string, fromAccNumber: string, adminUsername: string, clientIP: string }, nickname: string = '') {
    try {
      const body: any = {
        bank: requestInfo.BID,
        account_number: requestInfo.bankAccNumber,
        account_name: requestInfo.bankAccName,
        amount: requestInfo.transferAmount,
        description: (requestInfo.message || requestInfo.transferId).replaceAll(/[^a-zA-Z0-9]+/g, ''),
        transaction_code: requestInfo.transferId,
        from_account: requestInfo.fromAccNumber,
      };
      const config: AxiosRequestConfig = {
        method: 'post',
        url: `${process.env.WITHDRAW_API_HOST}/transaction/create`,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.WITHDRAW_API_KEY,
          'merchant': process.env.MERCHANT,
        },
        data: JSON.stringify([body]),
      };
      notiRequestWithdraw(`
        ${requestInfo.adminUsername} duyệt yêu cầu rút - <a href="https://www.iplocation.net/?query=${requestInfo.clientIP}">${requestInfo.clientIP}</a>
        =========================
        NickName: <b>${nickname}</b>
        Số tiền: <b>${body.amount.toLocaleString()} đ</b>
        TransferId: ${body.transaction_code} 
      `, body.amount);
      axios(config)
        .then(async (response) => {
          await WithdrawModel.update({ statusCallback: WITHDRAW_TRANSFER_STATUS.PROCESSING }, { where: { id: requestInfo.WithDrawId } });
        })
        .catch(async (error) => {
          console.log(error);
          await WithdrawModel.update({ statusCallback: WITHDRAW_CALLBACK_STATUS.ERROR }, { where: { id: requestInfo.WithDrawId } });
        });
    } catch (error) {
      console.log(error.message);
      return false;
    }
  }

  public async cashoutTopup (requestInfo: { BID: string, bankAccNumber: string, bankAccName: string, transferAmount: number, transferId: string, message: string, fromAccNumber: string }) {
    try {
      const body: any = {
        bank: requestInfo.BID,
        account_number: requestInfo.bankAccNumber,
        account_name: requestInfo.bankAccName,
        amount: requestInfo.transferAmount,
        description: (requestInfo.message || requestInfo.transferId).replaceAll(/[^a-zA-Z0-9]+/g, ''),
        transaction_code: requestInfo.transferId,
        from_account: requestInfo.fromAccNumber,
      };
      const config: AxiosRequestConfig = {
        method: 'post',
        url: `${process.env.WITHDRAW_API_HOST}/transaction/create`,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.WITHDRAW_API_KEY,
          'merchant': process.env.MERCHANT,
        },
        data: JSON.stringify([body]),
      };
      notiRequestTopup(`
        <b>Thực hiện rút từ tài khoản nạp</b>
        =========================
        Số tiền: <b>-${body.amount.toLocaleString()} đ</b>
        TransferId: ${body.transaction_code} 
      `, body.amount);
      axios(config)
        .then(async (response) => {
          // Save log
          const newLog: any = {
            UserId: -1,
            targetName: LOG_TARGET.SYSTEM,
            message: JSON.stringify({ body, status: WITHDRAW_STATUS.SUCCESS }),
            type: 'TOPUP_CASHOUT_MAX',
          };
          await SystemLogModel.create(newLog);
        })
        .catch(async (error) => {
          console.log(error);
          // Save log
          const newLog: any = {
            UserId: -1,
            targetName: LOG_TARGET.SYSTEM,
            message: JSON.stringify({ body, error, status: WITHDRAW_STATUS.ERROR }),
            type: 'TOPUP_CASHOUT_MAX',
          };
          await SystemLogModel.create(newLog);
        });
    } catch (error) {
      return false;
    }
  }
}

export default new WithDrawService();
