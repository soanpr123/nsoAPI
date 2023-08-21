import { Request, Response } from 'express';
import { sendError, sendSuccess } from '@libs/response';
import { GridInterface } from '@models/Transformers/Grid';
import HistorySummaryModel from '@models/historySummary';
import moment from 'moment';
import { Op } from 'sequelize';
import HistorySummaryService from '@services/HistorySummaryService';

class HistorySummaryController {
  public async getAll (req: Request, res: Response) {
    try {
      const page: number = parseInt(req.query.page ? req.query.page.toString() : '1');
      const pageSize: number = parseInt(req.query.pageSize ? req.query.pageSize.toString() : '20');
      const cursor: number = (page - 1) * pageSize;

      const fromDate: any = req.query.fromDate ? Number(req.query.fromDate) : Date.parse;
      const toDate: any = req.query.toDate ? Number(req.query.toDate) : Date.now();

      const where = Object.assign({},
        fromDate && toDate ? { createdAt: { [Op.between]: [moment(fromDate), moment(toDate)] } } : null,
        { UserId: req.user.merchantId },
      );
      const { rows, count } =
       await HistorySummaryModel.findAndCountAll({
         where,
         paranoid: false,
         order: [
           ['createdAt', 'DESC'],
         ],
         limit: pageSize,
         offset: cursor,
       });

      const day = moment(new Date()).toDate();
      const resultCurrentDay = await HistorySummaryService.sumBankByDay(day, false);
      const responseData: GridInterface<HistorySummaryModel> = {
        data: resultCurrentDay ? [...rows, ...resultCurrentDay] : rows,
        page: page,
        pageSize: pageSize,
        total: count,
      };
      sendSuccess(res, responseData);
    } catch (error) {
      sendError(res, 500, error.message, error);
    }
  }
}

export default new HistorySummaryController();
