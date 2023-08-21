import { TOPUP_STATUS, TOPUP_TRANSFER_STATUS, WITHDRAW_STATUS, WITHDRAW_TRANSFER_STATUS } from '@libs/constants';
import HistorySummaryModel from '@models/historySummary';
import TopupRequestModel from '@models/topupRequest';
import UserModel from '@models/users';
import WithdrawModel from '@models/withdrawRequest';
import moment from 'moment-timezone';
import { col, fn, Op } from 'sequelize';

class HistorySummaryService {
  public async sumBankByDay (sumDate: Date = new Date(), shouldCreate: Boolean = true) {
    try {
      const users = await UserModel.findAll({ group: ['merchantId'] });
      const results: any[] = [];
      for await (const user of users) {
        const updatedAt: any = {
          [Op.between]: [moment(sumDate).tz('Asia/Ho_Chi_Minh').startOf('day').format(), moment(sumDate).tz('Asia/Ho_Chi_Minh').endOf('day').format()],
        };
        const sumTopup: any = await TopupRequestModel.findAll({
          where: {
            // UserId: user.merchantId,
            updatedAt,
            status: TOPUP_STATUS.SUCCESS,
            statusTransfer: TOPUP_TRANSFER_STATUS.SUCCESS,
          },
          attributes: [
            'UserId',
            [fn('sum', col('transferAmount')), 'total_amount'],
          ],
          group: ['UserId'],
          raw: true,
        });
        const countNickNameTopup: any = await TopupRequestModel.findAll({
          where: {
            // UserId: user.merchantId,
            updatedAt,
            status: TOPUP_STATUS.SUCCESS,
            statusTransfer: TOPUP_TRANSFER_STATUS.SUCCESS,
          },
          attributes: [
            'partnerReference',
          ],
          group: ['partnerReference'],
          raw: true,
        });
        const countRequestTopup: any = await TopupRequestModel.findAll({
          where: {
            // UserId: user.merchantId,
            updatedAt,
            status: TOPUP_STATUS.SUCCESS,
            statusTransfer: TOPUP_TRANSFER_STATUS.SUCCESS,
          },
          attributes: [
            'UserId',
            [fn('count', col('id')), 'count_id'],
          ],
          group: ['UserId'],
          raw: true,
        });

        // Withdraw
        const sumWithdraw: any = await WithdrawModel.findAll({
          where: {
            // UserId: user.merchantId,
            updatedAt,
            status: WITHDRAW_STATUS.SUCCESS,
            statusTransfer: WITHDRAW_TRANSFER_STATUS.SUCCESS,
          },
          attributes: [
            'UserId',
            [fn('sum', col('transferAmount')), 'total_amount'],
          ],
          group: ['UserId'],
          raw: true,
        });
        const countNickNameWithdraw: any = await WithdrawModel.findAll({
          where: {
            // UserId: user.merchantId,
            updatedAt,
            status: WITHDRAW_STATUS.SUCCESS,
            statusTransfer: WITHDRAW_TRANSFER_STATUS.SUCCESS,
          },
          attributes: [
            'partnerReference',
          ],
          group: ['partnerReference'],
          raw: true,
        });
        const countRequestWithdraw: any = await WithdrawModel.findAll({
          where: {
            // UserId: user.merchantId,
            updatedAt,
            status: WITHDRAW_STATUS.SUCCESS,
            statusTransfer: WITHDRAW_TRANSFER_STATUS.SUCCESS,
          },
          attributes: [
            'UserId',
            [fn('count', col('id')), 'count_id'],
          ],
          group: ['UserId'],
          raw: true,
        });

        const newRecord: any = {
          // UserId: user.merchantId,
          type: 'bank',
          date: moment(sumDate).format('YYYYMMDD'),

          totalTopup: sumTopup[0]?.total_amount || 0,
          countNickNameTopup: countNickNameTopup?.length || 0,
          countRequestTopup: countRequestTopup[0]?.count_id || 0,

          totalWithdraw: sumWithdraw[0]?.total_amount || 0,
          countNickNameWithdraw: countNickNameWithdraw?.length || 0,
          countRequestWithdraw: countRequestWithdraw[0]?.count_id || 0,
          createdAt: moment(sumDate),
          updatedAt: moment(sumDate),
        };

        if (shouldCreate) {
          const exist = await HistorySummaryModel.findOne({
            where: {
             
              type: 'bank',
              date: moment(sumDate).format('YYYYMMDD'),
            },
          });
          if (exist) {
            await exist.update(newRecord);
          } else {
            await HistorySummaryModel.create(newRecord);
          }
        } else {
          results.push(newRecord);
        }
      }
      return results.filter((item: any) => item.UserId !== null);
    } catch (error) {
      console.log(error);
    }
  }
}

export default new HistorySummaryService();
