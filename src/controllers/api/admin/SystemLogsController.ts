import { Request, Response } from 'express';
import { sendError, sendSuccess } from '@libs/response';
import { Op } from 'sequelize';
import SystemLogModel from '@models/systemLogs';
import UserModel from '@models/users';

class SystemLogsController {
  public async show (req: Request, res: Response) {
    try {
      const Logs = await SystemLogModel.findAll({
        where: {
          message: { [Op.substring]: req.query.targetId as string },
          targetName: req.query.type,
        },
        include: [
          {
            model: UserModel,
            as: 'User',
            required: false,
          },
        ],
        order: [['createdAt', 'ASC']],
      });
      sendSuccess(res, Logs, 'success');
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }
}

export default new SystemLogsController();
