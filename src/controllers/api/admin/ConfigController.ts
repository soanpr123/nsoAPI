import { Request, Response } from 'express';
import { sendError, sendSuccess } from '@libs/response';
import AccountBankModel from '@models/accountBank';
import SystemSettingsModel from '@models/systemSettings';
import UserModel from '@models/users';

class ConfigController {
  public async show (req: Request, res: Response) {
    try {
      const apiUrl = process.env.APP_URL;
      const { callBackUrl: callBackUrlTopup } = await AccountBankModel.findOne({ where: { type: 'topup' } });
      const { callBackUrl: callBackUrlWithdraw } = await AccountBankModel.findOne({ where: { type: 'withdraw' } });
      const clientUser = await UserModel.findOne({ where: {  } });
      const settings = await SystemSettingsModel.findAll({ paranoid: false });
      sendSuccess(res, { apiUrl, callBackUrlTopup, callBackUrlWithdraw, settings, clientUser }, 'success');
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }

  public async patch (req: Request, res: Response) {
    try {
      if (req.body.callBackUrlTopup) {
        await AccountBankModel.update({ callBackUrl: req.body.callBackUrlTopup }, { where: { type: 'topup' } });
      }
      if (req.body.callBackUrlWithdraw) {
        await AccountBankModel.update({ callBackUrl: req.body.callBackUrlWithdraw }, { where: { type: 'withdraw' } });
      }
      if (req.body.settings?.length > 0) {
        req.body.settings.forEach(async (element: any) => {
          await SystemSettingsModel.update({ value: element.value }, { where: { key: element.key } });
        });
      }
      sendSuccess(res, { message: 'suceess' });
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }
}

export default new ConfigController();
