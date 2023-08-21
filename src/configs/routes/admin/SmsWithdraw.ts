import { Router } from 'express';
import SmsWithdrawController from '@controllers/api/admin/SmsWithdrawController';

const router = Router();

/**
 * @openapi
 * /a/sms_withdraw/get_all:
 *   get:
 *     tags:
 *      - "[ADMIN] SMS rút tiền"
 *     summary: Lấy danh sách SMS rút tiền
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
router.get('/get_all', SmsWithdrawController.getAll);

/**
 * @openapi
 * /a/sms_withdraw/retry_mapping/{id}:
 *   patch:
 *     tags:
 *      - "[ADMIN] SMS rút tiền"
 *     summary: Mapping lại SMS với yêu cầu rút
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
 *     responses:
 *       200:
 *         description: "Done"
 *       500:
 *         description: "Internal error"
 *     security:
 *      - Bearer: []
 */
router.patch('/retry_mapping/:id', SmsWithdrawController.retryMapping);

/**
 * @openapi
 * /a/sms_withdraw/{id}:
 *   patch:
 *     tags:
 *      - "[ADMIN] SMS rút tiền"
 *     summary: Cập nhật SMS rút
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Cập nhật SMS rút"
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
router.patch('/:id', SmsWithdrawController.update);

export default router;
