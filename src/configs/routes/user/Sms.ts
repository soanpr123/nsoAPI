import { Router } from 'express';
import SmsController from '@controllers/api/user/SmsController';
import { apiKey } from '@middlewares/auth';

const router = Router();

/**
 * @openapi
 * /u/sms/single:
 *   post:
 *     tags:
 *      - "[CLIENT] Sms"
 *     summary: Sms single
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Yêu cầu Callback"
 *        require: true
 *        schema:
 *          type: "object"
 *          properties:
 *            content:
 *              type: "string"
 *     responses:
 *       200:
 *         description: "Done"
 *       500:
 *         description: "Internal error"
 *     security:
 *      - Bearer: []
 */

router.post('/single', apiKey, SmsController.single);

/**
 * @openapi
 * /u/sms/multiple:
 *   post:
 *     tags:
 *      - "[CLIENT] Sms"
 *     summary: Sms multiple
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Yêu cầu Callback"
 *        require: true
 *        schema:
 *          type: "array"
 *          items:
 *            type: "string"
 *     responses:
 *       200:
 *         description: "Done"
 *       500:
 *         description: "Internal error"
 *     security:
 *      - Bearer: []
 */

router.post('/multiple', apiKey, SmsController.multiple);

export default router;
