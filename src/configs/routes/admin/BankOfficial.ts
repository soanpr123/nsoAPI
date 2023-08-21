import BankOfficial from '@controllers/api/admin/BankController';
import { auth } from '@middlewares/auth';
import { hasRole } from '@middlewares/checkRoles';
import { Router } from 'express';

const router = Router();

/**
 * @openapi
 * /a/bank_official:
 *   get:
 *     tags:
 *      - "[GLOBAL] Danh sách Bank"
 *     summary: Danh bank
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - in: "query"
 *        name: "page"
 *        type: "string"
 *      - in: "query"
 *        name: "pageSize"
 *        type: "string"
 *      - in: "query"
 *        name: "status"
 *        type: "string"
 *        description: "Trạng thái hiển thị"
 *        enum:
 *          - active
 *          - inactive
 *     responses:
 *       200:
 *         description: "Done"
 *       500:
 *         description: "Internal error"
 */
router.get('/', BankOfficial.getAll);

/**
 * @openapi
 * /a/bank_official/{id}:
 *   get:
 *     tags:
 *      - "[GLOBAL] Danh sách Bank"
 *     summary: Chi tiết Bank
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - in: "path"
 *        name: "id"
 *        description: "ID tài khoản"
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
router.get('/:id', auth, hasRole('admin'), BankOfficial.show);

/**
 * @openapi
 * /a/bank_official/{id}:
 *   patch:
 *     tags:
 *      - "[GLOBAL] Danh sách Bank"
 *     summary: Cập nhật Bank
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - in: "path"
 *        name: "id"
 *        description: "ID tài khoản"
 *        type: "string"
 *        required: "true"
 *      - in: "body"
 *        name: "body"
 *        description: "Cập nhật bank"
 *        schema:
 *          type: "object"
 *          properties:
 *            statusShowWithdraw:
 *              type: "string"
 *              description: "Status hiển thị bank ở Client"
 *              enum:
 *                - active
 *                - inactive
 *     responses:
 *       200:
 *         description: "Done"
 *       500:
 *         description: "Internal error"
 *     security:
 *      - Bearer: []
 */
router.patch('/:id', auth, hasRole('admin'), BankOfficial.patch);

export default router;
