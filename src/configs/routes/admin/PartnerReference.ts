import PartnerReferenceController from '@controllers/api/admin/PartnerReferenceController';
import { Router } from 'express';

const router = Router();

/**
 * @openapi
 * /a/partner_reference/get_one:
 *   get:
 *     tags:
 *      - "[ADMIN] Thống kê theo partner reference"
 *     summary: Thống kê theo partner reference
 *     consumes:
 *      - "application/json"
 *     produces:
 *      - "application/json"
 *     parameters:
 *      - in: "query"
 *        name: "partnerReference"
 *        type: "string"
 *      - in: "query"
 *        name: "fromDate"
 *        type: "string"
 *      - in: "query"
 *        name: "toDate"
 *        type: "string"
 *     responses:
 *       200:
 *         description: "Done"
 *       500:
 *         description: "Internal error"
 *     security:
 *      - Bearer: []
 */
router.get('/get_one', PartnerReferenceController.getOneByPartnerReference);

export default router;
