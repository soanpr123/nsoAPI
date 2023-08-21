import { Router } from 'express';
import SystemLogsController from '@controllers/api/admin/SystemLogsController';

const router = Router();

/**
 * @openapi
 * /a/system_logs:
 *   get:
 *     tags:
 *      - "[ADMIN] System log"
 *     summary: Xem System log
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - in: "query"
 *        name: "targetId"
 *        type: "string"
 *      - in: "query"
 *        name: "type"
 *        type: "string"
 *        enum:
 *          - smsTopup
 *          - smsWithdraw
 *          - requestTopup
 *          - requestWithdraw
 *          - system
 *          - callbackTopup
 *          - callbackWithdraw
 *          - user
 *     responses:
 *       200:
 *         description: "Done"
 *       500:
 *         description: "Internal error"
 *     security:
 *      - Bearer: []
 */
router.get('/', SystemLogsController.show);

export default router;
