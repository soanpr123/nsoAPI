import { Request, Response } from 'express';
import { sendError, sendSuccess } from '@libs/response';
import SendReadSms from '@services/SendReadSms';

class SmsController {
  public async single (req: Request, res: Response) {
    const smsContent = req.body.content;
    try {
      await SendReadSms.singleSms(req.user.id, req.user.apiKey, req.user.merchantId, req.user.typeTopup, smsContent, req.body.phoneNumber || '', req.body.phoneReceive || '');
      sendSuccess(res, { smsContent });
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }

  public async multiple (req: Request, res: Response) {
    try {
      const listSms: any = req.body;
      for (const content of listSms) {
        const smsContent = content.body;
        await SendReadSms.singleSms(req.user.id, req.user.apiKey, req.user.merchantId, req.user.typeTopup, smsContent, req.body.phoneNumber || '', req.body.phoneReceive || '');
      }
      sendSuccess(res, req.body);
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }
}

export default new SmsController();
