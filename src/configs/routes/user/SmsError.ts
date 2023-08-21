import { Router } from 'express';
import SmsController from '@controllers/api/user/SmsErrorController';
import { apiKey } from '@middlewares/auth';

const router = Router();

/**
 * @openapi
 * /u/sms_error/get_otp:
 *   get:
 *     tags:
 *      - "[CLIENT] Sms OTP"
 *     summary: Lấy OTP
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - in: "query"
 *        name: "transactionId"
 *        schema:
 *          type: "string"
 *      - in: "query"
 *        name: "phoneReceive"
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
router.get('/get_otp', apiKey, SmsController.getOTP);

export default router;
