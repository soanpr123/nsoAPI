import WithdrawController from '@controllers/api/admin/WithdrawController';
import { apiKey, auth } from '@middlewares/auth';
import { hasRole } from '@middlewares/checkRoles';
import { Router } from 'express';

const router = Router();

/**
 * @openapi
 * /a/request_withdraw/get_all:
 *   get:
 *     tags:
 *      - "[ADMIN] Yêu cầu rút tiền"
 *     summary: Danh sách Yêu cầu rút tiền
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
 *          - pendding
 *          - canceled
 *        schema:
 *          type: "string"
 *      - in: "query"
 *        name: "statusTransfer"
 *        enum:
 *          - success
 *          - pendding
 *          - processing
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
router.get('/get_all', auth, hasRole('mod'), WithdrawController.getAll);

/**
 * @openapi
 * /a/request_withdraw/callback:
 *   post:
 *     tags:
 *      - "[ADMIN] Yêu cầu rút tiền"
 *     summary: Request callback
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - in: "body"
 *        name: "body"
 *        schema:
 *          type: "object"
 *          properties:
 *            transferId:
 *              type: "string"
 *              required: "true"
 *            statusTransfer:
 *              type: "string"
 *              enum:
 *                - success
 *                - error
 *            note:
 *              type: "string"
 *              description: "Nội dung note"
 *     responses:
 *       200:
 *         description: "Done"
 *       500:
 *         description: "Internal error"
 *     security:
 *      - Bearer: []
 */
router.post('/callback', apiKey, WithdrawController.callback);

router.post('/retry_callback/:id', auth, hasRole('mod'), WithdrawController.retryCallback);

/**
 * @openapi
 * /a/request_withdraw/retry_withdraw/{id}:
 *   patch:
 *     tags:
 *      - "[ADMIN] Yêu cầu rút tiền"
 *     summary: Duyệt lại Yêu cầu rút tiền
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
router.patch('/retry_withdraw/:id', auth, hasRole('mod'), WithdrawController.retryWithdraw);

/**
 * @openapi
 * /a/request_withdraw/force_update/{id}:
 *   patch:
 *     tags:
 *      - "[ADMIN] Yêu cầu rút tiền"
 *     summary: Cập nhật Yêu cầu rút tiền
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
 *        description: "Cập nhật lệnh rút"
 *        schema:
 *          type: "object"
 *          properties:
 *            statusTransfer:
 *              type: "string"
 *              description: "Trạng thái tiền chuyển đến tài khoản"
 *              enum:
 *               - success
 *               - pendding
 *               - canceled
 *            status:
 *              type: "string"
 *              description: "Trạng thái duyệt"
 *              enum:
 *               - success
 *               - pendding
 *               - canceled
 *     responses:
 *       200:
 *         description: "Done"
 *       500:
 *         description: "Internal error"
 *     security:
 *      - Bearer: []
 */
router.patch('/force_update/:id', auth, hasRole('root'), WithdrawController.forceUpdate);

/**
 * @openapi
 * /a/request_withdraw/confirm/{id}:
 *   patch:
 *     tags:
 *      - "[ADMIN] Yêu cầu rút tiền"
 *     summary: Cập nhật Yêu cầu rút tiền
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
 *        description: "Cập nhật lệnh rút"
 *        schema:
 *          type: "object"
 *          properties:
 *            status:
 *              type: "string"
 *              description: "Trạng thái"
 *              enum:
 *               - success
 *               - pendding
 *               - canceled
 *     responses:
 *       200:
 *         description: "Done"
 *       500:
 *         description: "Internal error"
 *     security:
 *      - Bearer: []
 */
router.patch('/confirm/:id', auth, hasRole('mod'), WithdrawController.confirm);

/**
 * @openapi
 * /a/request_withdraw/{id}:
 *   patch:
 *     tags:
 *      - "[ADMIN] Yêu cầu rút tiền"
 *     summary: Cập nhật Yêu cầu rút tiền
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
 *        description: "Cập nhật lệnh rút"
 *        schema:
 *          type: "object"
 *          properties:
 *            requestId:
 *              type: "number"
 *              description: "Id lệnh rút"
 *            partnerReference:
 *              type: "string"
 *              description: "Tên liên kết"
 *            note:
 *              type: "string"
 *              description: "Nội dung note"
 *            napasID:
 *              type: "string"
 *              description: "Mã ngân hàng"
 *            bankAccNumber:
 *              type: "string"
 *              description: "Số tài khoản đích"
 *            bankAccName:
 *              type: "string"
 *              description: "Tên chủ tài khoản đích"
 *            transferAmount:
 *              type: "number"
 *              description: "Số tiền rút"
 *            transferMessage:
 *              type: "string"
 *              description: "Nội dung chuyển khoản"
 *            status:
 *              type: "string"
 *              description: "Trạng thái"
 *              enum:
 *               - success
 *               - pendding
 *               - canceled
 *     responses:
 *       200:
 *         description: "Done"
 *       500:
 *         description: "Internal error"
 *     security:
 *      - Bearer: []
 */
router.patch('/:id', auth, hasRole('mod'), WithdrawController.update);

/**
 * @openapi
 * /a/request_withdraw:
 *   post:
 *     tags:
 *      - "[ADMIN] Yêu cầu rút tiền"
 *     summary: Tạo Yêu cầu rút tiền
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Cập nhật lệnh rút"
 *        schema:
 *          type: "object"
 *          properties:
 *            requestId:
 *              type: "number"
 *              description: "Số tiền rút"
 *            partnerReference:
 *              type: "string"
 *              description: "Tên liên kết"
 *            note:
 *              type: "string"
 *              description: "Nội dung note"
 *            napasID:
 *              type: "string"
 *              description: "Mã ngân hàng"
 *            bankAccNumber:
 *              type: "string"
 *              description: "Số tài khoản đích"
 *            bankAccName:
 *              type: "string"
 *              description: "Tên chủ tài khoản đích"
 *            transferAmount:
 *              type: "number"
 *              description: "Số tiền rút"
 *            transferMessage:
 *              type: "string"
 *              description: "Nội dung chuyển khoản"
 *     responses:
 *       200:
 *         description: "Done"
 *       500:
 *         description: "Internal error"
 *     security:
 *      - Bearer: []
 */
router.post('/', auth, hasRole('mod'), WithdrawController.create);

export default router;
