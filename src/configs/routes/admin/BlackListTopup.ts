import BlackListTopupController from '@controllers/api/admin/BlackListTopupController';
import { Router } from 'express';

const router = Router();

/**
 * @openapi
 * /a/blacklist_topup:
 *   get:
 *     tags:
 *      - "[ADMIN] Khóa tài khoản nạp"
 *     summary: Danh sách khóa tài khoản
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
 *        name: "searchKey"
 *        type: "string"
 *     responses:
 *       200:
 *         description: "Done"
 *       500:
 *         description: "Internal error"
 *     security:
 *      - Bearer: []
 */
router.get('/', BlackListTopupController.getAll);

/**
 * @openapi
 * /a/blacklist_topup:
 *   post:
 *     tags:
 *      - "[ADMIN] Khóa tài khoản nạp"
 *     summary: Tạo mới khóa tài khoản
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
 *            bankAccNumber:
 *              type: "string"
 *              description: "Số tài khoản"
 *     responses:
 *       200:
 *         description: "Done"
 *       500:
 *         description: "Internal error"
 *     security:
 *      - Bearer: []
 */
router.post('/', BlackListTopupController.create);

/**
 * @openapi
 * /a/blacklist_topup/{id}:
 *   delete:
 *     tags:
 *      - "[ADMIN] Khóa tài khoản nạp"
 *     summary: Xóa tài khoản khóa
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
router.delete('/:id', BlackListTopupController.delete);

export default router;
