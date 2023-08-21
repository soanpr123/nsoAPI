import TopupController from '@controllers/api/admin/TopupController';
import { Router } from 'express';

const router = Router();

/**
 * @openapi
 * /g/request_topup/get_all:
 *   get:
 *     tags:
 *      - "[GATE] Yêu cầu nạp tiền"
 *     summary: Lấy danh sách yêu cầu nạp tiền
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
 *        description: "Trạng thái của yêu cầu, Thành công 'success' hoặc Lỗi 'error' hoặc Đang chờ 'pendding'"
 *        enum:
 *          - success
 *          - error
 *          - pendding
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
 * /g/request_topup:
 *   post:
 *     tags:
 *      - "[GATE] Yêu cầu nạp tiền"
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
 *            type:
 *              type: "string"
 *              description: "Phương thức yêu cầu nạp"
 *              enum:
 *                - bank
 *                - momo
 *                - telco
 *            requestId:
 *              type: "string"
 *              description: "ID yêu cầu nạp"
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
router.post('/', TopupController.create);

export default router;
