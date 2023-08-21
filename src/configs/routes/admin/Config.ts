import { Router } from 'express';
import ConfigController from '@controllers/api/admin/ConfigController';

const router = Router();

/**
 * @openapi
 * /a/config:
 *   patch:
 *     tags:
 *      - "[ADMIN] Cấu hình"
 *     summary: Cài đặt API
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Cài đặt API"
 *        schema:
 *          type: "object"
 *          properties:
 *            callBackUrlTopup:
 *              type: "string"
 *              description: "API callback khi nạp thành công"
 *            callBackUrlWithdraw:
 *              type: "string"
 *              description: "API callback khi duyệt rút thành công"
 *     responses:
 *       200:
 *         description: "Done"
 *       500:
 *         description: "Internal error"
 *     security:
 *      - Bearer: []
 */
router.patch('/', ConfigController.patch);

/**
 * @openapi
 * /a/config:
 *   get:
 *     tags:
 *      - "[ADMIN] Cấu hình"
 *     summary: Xem cài đặt API
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     responses:
 *       200:
 *         description: "Done"
 *       500:
 *         description: "Internal error"
 *     security:
 *      - Bearer: []
 */
router.get('/', ConfigController.show);

export default router;
