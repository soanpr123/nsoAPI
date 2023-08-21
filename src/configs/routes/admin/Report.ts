import ReportController from '@controllers/api/admin/ReportController';
import { Router } from 'express';

const router = Router();

/**
 * @openapi
 * /a/report/by_hour:
 *   get:
 *     tags:
 *      - "[ADMIN] Báo cáo"
 *     summary: Báo cáo
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
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
router.get('/by_hour', ReportController.byHour);

/**
 * @openapi
 * /a/report/by_top:
 *   get:
 *     tags:
 *      - "[ADMIN] Báo cáo"
 *     summary: Báo cáo Top
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
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
router.get('/by_top', ReportController.byTop);

export default router;
