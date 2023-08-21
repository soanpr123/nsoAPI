import { Request, Response } from 'express';
import { sendError, sendSuccess } from '@libs/response';
import WhiteListIpModel from '@models/whiteListIp';
import { Op } from 'sequelize';

class WhiteListIpController {
  public async getAll (req: Request, res: Response) {
    try {
      const page: number = parseInt(req.query.page ? req.query.page.toString() : '1');
      const pageSize: number = parseInt(req.query.pageSize ? req.query.pageSize.toString() : '20');
      const searchKey: any = req.query.searchKey ? req.query.searchKey : null;
      const cursor: number = (page - 1) * pageSize;
      let ip = null;
      if (searchKey) {
        ip = { [Op.like]: `%${searchKey.trim()}%` };
      }
      const where = Object.assign({},
        ip === null ? null : { ip },
      );
      const { rows, count } =
       await WhiteListIpModel.findAndCountAll({
         paranoid: false,
         where,
         order: [
           ['createdAt', 'DESC'],
         ],
         limit: pageSize,
         offset: cursor,
       });
      const responseData: any = {
        data: rows,
        pagination: {
          page: page,
          pageSize: pageSize,
          total: count,
        },
      };
      sendSuccess(res, responseData);
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }

  public async show (req: Request, res: Response) {
    try {
      const whiteListIps = await WhiteListIpModel.findAll({ where: { id: req.params.id }, paranoid: false });
      sendSuccess(res, { whiteListIps }, 'success');
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }

  public async delete (req: Request, res: Response) {
    try {
      const deleted = await WhiteListIpModel.destroy({ where: { id: req.params.id }, force: true });
      sendSuccess(res, { deleted });
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }

  public async create (req: Request, res: Response) {
    try {
      const exist = await WhiteListIpModel.findOne({ where: { ip: (req.body.ip || '').trim() } });
      if (!exist) {
        const created = await WhiteListIpModel.create({ ...req.body });
        sendSuccess(res, { created, message: 'suceess' });
      }
      return sendError(res, 500, 'duplicate ip');
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }

  public async patch (req: Request, res: Response) {
    try {
      const updated = await WhiteListIpModel.update({ ...req.body }, { where: { id: req.params.id } });
      sendSuccess(res, { updated, message: 'suceess' });
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }
}

export default new WhiteListIpController();
