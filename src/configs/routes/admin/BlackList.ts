import BlackListController from '@controllers/api/admin/BlackListController';
import { Router } from 'express';

const router = Router();

/**
 * @openapi
 * /a/blacklist:
 *   get:
 *     tags:
 *      - "[ADMIN] Khóa tài khoản"
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
router.get('/', BlackListController.getAll);

/**
 * @openapi
 * /a/blacklist:
 *   post:
 *     tags:
 *      - "[ADMIN] Khóa tài khoản"
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
router.post('/', BlackListController.create);

/**
 * @openapi
 * /a/blacklist/{id}:
 *   delete:
 *     tags:
 *      - "[ADMIN] Khóa tài khoản"
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
router.delete('/:id', BlackListController.delete);

export default router;
