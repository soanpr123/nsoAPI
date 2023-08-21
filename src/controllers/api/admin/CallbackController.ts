import { Request, Response } from 'express';
import { sendError, sendSuccess } from '@libs/response';
import CallbackLogModel from '@models/callbackLogs';
import { Op } from 'sequelize';

class CallbackLogsController {
  public async show (req: Request, res: Response) {
    try {
      const callbackLogs = await CallbackLogModel.findAll({
        where: {
          payload: { [Op.substring]: req.query.transferId as string },
        },
      });
      sendSuccess(res, callbackLogs, 'success');
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }
}

export default new CallbackLogsController();
