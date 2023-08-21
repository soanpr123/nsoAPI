import AccountBank from '@controllers/api/gate/AccountBankController';
import { Router } from 'express';

const router = Router();

/**
 * @openapi
 * /g/account_bank:
 *   get:
 *     tags:
 *      - "[GATE] Danh sách tài khoản Bank nạp"
 *     summary: Danh sách tài khoản bank nạp
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
 *     responses:
 *       200:
 *         description: "Done"
 *       500:
 *         description: "Internal error"
 *     security:
 *      - Bearer: []
 */
router.get('/', AccountBank.getAll);

export default router;
