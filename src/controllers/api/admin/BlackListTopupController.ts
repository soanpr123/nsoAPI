import { Request, Response } from 'express';
import { sendError, sendSuccess } from '@libs/response';
import { Op } from 'sequelize';
import BlackListTopupModel from '@models/blackListTopup';

class BlackListController {
  public async create (req: Request, res: Response) {
    try {
      const newBlock = req.body;
      const existBlock = await BlackListTopupModel.findOne({ where: { UserId: req.user.merchantId, partnerReference: newBlock.partnerReference } });
      if (existBlock) {
        return sendSuccess(res, { message: 'Existed Block' });
      }
      await BlackListTopupModel.create({ ...newBlock, UserId: req.user.merchantId });
      sendSuccess(res, { user: newBlock });
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }

  public async delete (req: Request, res: Response) {
    try {
      const deletedBlock = await BlackListTopupModel.destroy({ where: { UserId: req.user.merchantId, id: req.params.id }, force: true });
      sendSuccess(res, { deletedBlock });
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }

  public async getAll (req: Request, res: Response) {
    try {
      const page: number = parseInt(req.query.page ? req.query.page.toString() : '1');
      const pageSize: number = parseInt(req.query.pageSize ? req.query.pageSize.toString() : '20');
      const searchKey: any = req.query.searchKey ? req.query.searchKey : null;
      const cursor: number = (page - 1) * pageSize;
      let partnerReference = null;
      if (searchKey) {
        partnerReference = { [Op.like]: `%${searchKey.trim()}%` };
      }
      const where = Object.assign({},
        partnerReference === null ? null : { partnerReference },
        { UserId: req.user.merchantId },
      );
      const { rows, count } =
       await BlackListTopupModel.findAndCountAll({
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
}

export default new BlackListController();
