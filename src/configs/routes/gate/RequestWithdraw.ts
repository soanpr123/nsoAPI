import WithdrawController from '@controllers/api/gate/WithdrawController';
import { apiKey } from '@middlewares/auth';
import { Router } from 'express';

const router = Router();

/**
 * @openapi
 * /g/request_withdraw/get_all:
 *   get:
 *     tags:
 *      - "[GATE] Yêu cầu rút tiền"
 *     summary: Danh sách Yêu cầu rút tiền
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - in: "query"
 *        name: "page"
 *        type: "string"
 *        description: "Trang dữ liệu hiện tại"
 *      - in: "query"
 *        name: "pageSize"
 *        type: "string"
 *        description: "Số lượng dữ liệu trên 1 trang"
 *      - in: "query"
 *        name: "requestId"
 *        description: "Tìm kiếm theo requestId"
 *        schema:
 *          type: "string"
 *      - in: "query"
 *        name: "fromDate"
 *        description: "Tìm kiếm theo giới hạn ngày bắt đầu"
 *        schema:
 *          type: "string"
 *      - in: "query"
 *        name: "toDate"
 *        description: "Tìm kiếm theo giới hạn ngày kết thúc"
 *        schema:
 *          type: "string"
 *      - in: "query"
 *        name: "download"
 *        description: "Download file Excel theo bộ lọc, có 'true' hoặc không 'false' mặc định là 'false'"
 *        enum:
 *          - true
 *          - false
 *        schema:
 *          type: "boolean"
 *      - in: "query"
 *        name: "status"
 *        description: "Trạng thái của yêu cầu, Thành công 'success' hoặc Từ chối 'canceled' hoặc Đang chờ 'pendding'"
 *        enum:
 *          - success
 *          - pendding
 *          - canceled
 *        schema:
 *          type: "string"
 *      - in: "query"
 *        name: "statusTransfer"
 *        description: "Trạng thái của chuyển tiền, Thành công 'success' hoặc Lỗi 'canceled' hoặc Đang chờ 'pendding' hoặc Đang thực hiện 'processing' hoặc lỗi 'error'"
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
router.get('/get_all', WithdrawController.getAll);

/**
 * @openapi
 * /g/request_withdraw/{id}:
 *   get:
 *     tags:
 *      - "[GATE] Yêu cầu rút tiền"
 *     summary: Request callback
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - in: "path"
 *        name: "id"
 *        description: "ID giao dịch"
 *        type: "string"
 *        required: "true"
 *     responses:
 *       200:
 *         description: "Done"
 *       500:
 *         description: "Internal error"
 *     security:
 *      - Bearer: []
 */
router.get('/:id', apiKey, WithdrawController.show);

/**
 * @openapi
 * /g/request_withdraw:
 *   post:
 *     tags:
 *      - "[GATE] Yêu cầu rút tiền"
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
 *            note:
 *              type: "string"
 *              description: "Nội dung note"
 *            transferMessage:
 *              type: "string"
 *              description: "Nội dung chuyển khoản"
 *            transferAmount:
 *              type: "number"
 *              description: "Số tiền cần rút"
 *            requestId:
 *              type: "string"
 *              description: "ID yêu cầu rút"
 *            partnerReference:
 *              type: "string"
 *              description: "Tên nhân vật (Nickname)"
 *            bankAccNumber:
 *              type: "string"
 *              description: "Số tài khoản nhận"
 *            bankAccName:
 *              type: "string"
 *              description: "Tên tài khoản nhận"
 *            napasID:
 *              type: "string"
 *              description: "Mã ngân hàng"
 *     responses:
 *       200:
 *         description: "Done"
 *       500:
 *         description: "Internal error"
 *     security:
 *      - Bearer: []
 */
router.post('/', WithdrawController.create);

/**
 * @openapi
 * /g/request_withdraw/callback:
 *   post:
 *     tags:
 *      - "[GATE] Yêu cầu rút tiền"
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
 *            requestId:
 *              type: "string"
 *              required: "true"
 *            statusRequest:
 *              type: "string"
 *              enum:
 *                - canceled
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
router.post('/callback', apiKey, WithdrawController.callbackGate);

export default router;
