import { Router } from 'express';
import TopupController from '@controllers/api/admin/TopupController';

const router = Router();

/**
 * @openapi
 * /a/request_topup/get_all:
 *   get:
 *     tags:
 *      - "[ADMIN] Yêu cầu nạp tiền"
 *     summary: Lấy danh sách yêu cầu nạp tiền
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
 *        name: "transferId"
 *        schema:
 *          type: "string"
 *      - in: "query"
 *        name: "requestId"
 *        schema:
 *          type: "string"
 *      - in: "query"
 *        name: "transferMessage"
 *        schema:
 *          type: "string"
 *      - in: "query"
 *        name: "partnerReference"
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
 *        name: "orderBy"
 *        schema:
 *          type: "string"
 *      - in: "query"
 *        name: "sort"
 *        schema:
 *          type: "string"
 *        enum:
 *          - DESC
 *          - ASC
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
router.get('/get_all', TopupController.getAll);

/**
 * @openapi
 * /a/request_topup/retry_callback/{id}:
 *   patch:
 *     tags:
 *      - "[ADMIN] Yêu cầu nạp tiền"
 *     summary: Callback lại về cổng nạp
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
router.patch('/retry_callback/:id', TopupController.retryCallback);

/**
 * @openapi
 * /a/request_topup:
 *   post:
 *     tags:
 *      - "[ADMIN] Yêu cầu nạp tiền"
 *     summary: Tạo mới yêu cầu nạp
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Tạo mới yêu cầu nạp"
 *        schema:
 *          type: "object"
 *          properties:
 *            requestId:
 *              type: "string"
 *              description: "Id yêu cầu nạp"
 *            partnerReference:
 *              type: "string"
 *              description: "Tên nhân vật (Nickname)"
 *            requestAmount:
 *              type: "string"
 *              description: "Số tiền yêu cầu nạp"
 *            transferMessage:
 *              type: "string"
 *              description: "Nội dung tin nhắn chuyển khoản"
 *            accBankID:
 *              type: "string"
 *              description: "ID tài khoản nạp tiền"
 *     responses:
 *       200:
 *         description: "Done"
 *       500:
 *         description: "Internal error"
 *     security:
 *      - Bearer: []
 */
router.post('', TopupController.create);

/**
 * @openapi
 * /a/request_topup/manual:
 *   post:
 *     tags:
 *      - "[ADMIN] Yêu cầu nạp tiền"
 *     summary: Tạo mới yêu cầu nạp thủ công
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Tạo mới yêu cầu nạp"
 *        schema:
 *          type: "object"
 *          properties:
 *            partnerReference:
 *              type: "string"
 *              description: "Tên nhân vật (Nickname)"
 *            requestAmount:
 *              type: "string"
 *              description: "Số tiền yêu cầu nạp"
 *            accBankID:
 *              type: "string"
 *              description: "ID tài khoản nạp tiền"
 *     responses:
 *       200:
 *         description: "Done"
 *       500:
 *         description: "Internal error"
 *     security:
 *      - Bearer: []
 */
router.post('/manual', TopupController.createManual);

/**
 * @openapi
 * /a/request_topup/{id}:
 *   patch:
 *     tags:
 *      - "[ADMIN] Yêu cầu nạp tiền"
 *     summary: Cập nhật yêu cầu nạp
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
 *        description: "Cập nhật yêu cầu nạp"
 *        schema:
 *          type: "object"
 *          properties:
 *            requestId:
 *              type: "string"
 *              description: "Id yêu cầu nạp"
 *            partnerReference:
 *              type: "string"
 *              description: "Tên nhân vật (Nickname)"
 *            requestAmount:
 *              type: "string"
 *              description: "Số tiền yêu cầu nạp"
 *            transferMessage:
 *              type: "string"
 *              description: "Nội dung tin nhắn chuyển khoản"
 *            accBankID:
 *              type: "number"
 *              description: "ID tài khoản nạp tiền"
 *     responses:
 *       200:
 *         description: "Done"
 *       500:
 *         description: "Internal error"
 *     security:
 *      - Bearer: []
 */
router.patch('/:id', TopupController.update);

/**
 * @openapi
 * /a/request_topup/{id}:
 *   delete:
 *     tags:
 *      - "[ADMIN] Yêu cầu nạp tiền"
 *     summary: Xóa yêu cầu nạp thủ công
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
router.delete('/:id', TopupController.delete);

export default router;
