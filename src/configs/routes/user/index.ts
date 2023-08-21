import { Router } from 'express';
import SmsRouter from './Sms';
import SmsErrorRouter from './SmsError';

const router = Router();

router.use('/sms', SmsRouter);
router.use('/sms_error', SmsErrorRouter);

export default router;
