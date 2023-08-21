import { Router } from 'express';
import DashboardController from '@controllers/api/admin/DashboardController';

const router = Router();

/**
 * @openapi
 * /a/dashboard/run:
 *   patch:
 *     tags:
 *      - "[ADMIN] Dashboard"
 *     summary: Cộng lại về báo cáo theo ngày
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Khoảng ngày"
 *        schema:
 *          type: "object"
 *          properties:
 *            fromDate:
 *              type: "string"
 *              description: "Ngày bắt đầu"
 *            toDate:
 *              type: "string"
 *              description: "Ngày kết thúc"
 *     responses:
 *       200:
 *         description: "Done"
 *       500:
 *         description: "Internal error"
 *     security:
 *      - Bearer: []
 */
router.patch('/run', DashboardController.run);

router.get('/topup', DashboardController.topup);

router.get('/bankCount', DashboardController.bankCount);

router.get('/total', DashboardController.total);

export default router;
