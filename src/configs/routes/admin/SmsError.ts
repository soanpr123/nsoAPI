import { Router } from 'express';
import SmsController from '@controllers/api/admin/SmsErrorController';

const router = Router();

/**
 * @openapi
 * /a/sms_error/get_all:
 *   get:
 *     tags:
 *      - "[ADMIN] SMS sai cú pháp"
 *     summary: Lấy danh sách SMS sai cú pháp
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - in: "query"
 *        name: "page"
 *        schema:
 *          type: "string"
 *      - in: "query"
 *        name: "pageSize"
 *        schema:
 *          type: "string"
 *      - in: "query"
 *        name: "searchContent"
 *        schema:
 *          type: "string"
 *      - in: "query"
 *        name: "fromDate"
 *        schema:
 *          type: "string"
 *      - in: "query"
 *        name: "toDate"
 *        schema:
 *          type: "string"
 *     responses:
 *       200:
 *         description: "Done"
 *       500:
 *         description: "Internal error"
 *     security:
 *      - Bearer: []
 */
router.get('/get_all', SmsController.getAll);

export default router;
