import { Router } from 'express';
import WhiteListIpController from '@controllers/api/admin/WhiteListIpController';

const router = Router();

/**
 * @openapi
 * /a/white_list_ip:
 *   post:
 *     tags:
 *      - "[ADMIN] White List IP"
 *     summary: Cài đặt IP
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Cài đặt IP"
 *        schema:
 *          type: "object"
 *          properties:
 *            name:
 *              type: "string"
 *              description: "Tên ghi nhớ IP"
 *            ip:
 *              type: "string"
 *              description: "IP cho phép"
 *            note:
 *              type: "string"
 *              description: "Ghi chú"
 *     responses:
 *       200:
 *         description: "Done"
 *       500:
 *         description: "Internal error"
 *     security:
 *      - Bearer: []
 */
router.post('/', WhiteListIpController.create);

/**
 * @openapi
 * /a/white_list_ip/{id}:
 *   patch:
 *     tags:
 *      - "[ADMIN] White List IP"
 *     summary: Cài đặt IP
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Cài đặt IP"
 *        schema:
 *          type: "object"
 *          properties:
 *            name:
 *              type: "string"
 *              description: "Tên ghi nhớ IP"
 *            ip:
 *              type: "string"
 *              description: "IP cho phép"
 *            note:
 *              type: "string"
 *              description: "Ghi chú"
 *     responses:
 *       200:
 *         description: "Done"
 *       500:
 *         description: "Internal error"
 *     security:
 *      - Bearer: []
 */
router.patch('/:id', WhiteListIpController.patch);

/**
 * @openapi
 * /a/white_list_ip:
 *   get:
 *     tags:
 *      - "[ADMIN] White List IP"
 *     summary: Xem cài đặt IP
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
 *        name: "ip"
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
router.get('/get_all', WhiteListIpController.getAll);

/**
 * @openapi
 * /a/white_list_ip/{id}:
 *   get:
 *     tags:
 *      - "[ADMIN] White List IP"
 *     summary: Xem cài đặt IP
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
router.get('/:id', WhiteListIpController.show);

/**
 * @openapi
 * /a/white_list_ip/{id}:
 *   delete:
 *     tags:
 *      - "[ADMIN] White List IP"
 *     summary: Xem cài đặt IP
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
router.delete('/:id', WhiteListIpController.delete);

export default router;
