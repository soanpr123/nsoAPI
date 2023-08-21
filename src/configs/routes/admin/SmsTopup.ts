import { Router } from 'express';
import SmsController from '@controllers/api/admin/SmsTopupController';

const router = Router();

/**
 * @openapi
 * /a/sms_topup/get_all:
 *   get:
 *     tags:
 *      - "[ADMIN] SMS nạp tiền"
 *     summary: Lấy danh sách SMS nạp tiền
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
 *        name: "transferId"
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
 *      - in: "query"
 *        name: "download"
 *        enum:
 *          - true
 *          - false
 *        schema:
 *          type: "boolean"
 *      - in: "query"
 *        name: "status"
 *        enum:
 *          - success
 *          - error
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

/**
 * @openapi
 * /a/sms_topup/retry_mapping/{id}:
 *   patch:
 *     tags:
 *      - "[ADMIN] SMS nạp tiền"
 *     summary: Mapping lại SMS với yêu cầu nạp
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - in: "path"
 *        name: "id"
 *        required: "true"
 *        schema:
 *          type: "string"
 *      - in: "body"
 *        name: "body"
 *        description: "Nickname"
 *        schema:
 *          type: "object"
 *          properties:
 *            partnerReference:
 *              type: "string"
 *              description: "Nickname"
 *     responses:
 *       200:
 *         description: "Done"
 *       500:
 *         description: "Internal error"
 *     security:
 *      - Bearer: []
 */
router.patch('/retry_mapping/:id', SmsController.retryMapping);

/**
 * @openapi
 * /a/sms_topup/{id}:
 *   patch:
 *     tags:
 *      - "[ADMIN] SMS nạp tiền"
 *     summary: Cập nhật SMS nạp
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Cập nhật SMS nạp"
 *        schema:
 *          type: "object"
 *          properties:
 *            content:
 *              type: "string"
 *              description: "Nội dung tin nhắn"
 *      - in: "path"
 *        name: "id"
 *        required: "true"
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
router.patch('/:id', SmsController.update);

export default router;
