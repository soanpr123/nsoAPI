import HistorySummaryController from '@controllers/api/admin/HistorySummaryController';
import { Router } from 'express';

const router = Router();

/**
 * @openapi
 * /a/history_summary:
 *   get:
 *     tags:
 *      - "[ADMIN] Lịch sử thống kê"
 *     summary: Lịch sử thống kê theo ngày
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - in: "query"
 *        name: "page"
 *        type: "string"
 *      - in: "query"
 *        name: "pageSize"
 *        type: "string"
 *      - in: "query"
 *        name: "fromDate"
 *        type: "string"
 *      - in: "query"
 *        name: "toDate"
 *        type: "string"
 *     responses:
 *       200:
 *         description: "Done"
 *       500:
 *         description: "Internal error"
 *     security:
 *      - Bearer: []
 */
router.get('/', HistorySummaryController.getAll);

export default router;
