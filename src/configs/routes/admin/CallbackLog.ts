import { Router } from 'express';
import CallbackController from '@controllers/api/admin/CallbackController';

const router = Router();

/**
 * @openapi
 * /a/callbacklogs:
 *   get:
 *     tags:
 *      - "[ADMIN] Callbacklog"
 *     summary: Xem Log callback
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - in: "query"
 *        name: "transferId"
 *        type: "string"
 *     responses:
 *       200:
 *         description: "Done"
 *       500:
 *         description: "Internal error"
 *     security:
 *      - Bearer: []
 */
router.get('/', CallbackController.show);

export default router;
