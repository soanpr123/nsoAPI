import BankOfficial from '@controllers/api/gate/BankController';
import { Router } from 'express';

const router = Router();

/**
 * @openapi
 * /g/bank_official:
 *   get:
 *     tags:
 *      - "[GATE] Danh sách Bank khách rút"
 *     summary: Danh sách bank
 *     description: "Lấy danh sách khách rút bank."
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
 */
router.get('/', BankOfficial.getAll);

export default router;
