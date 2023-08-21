import { Router } from 'express';
import { apiKey } from '@middlewares/auth';
import AccountBankRouter from './AccountBank';
import RequestTopupRouter from './RequestTopup';
import RequestWithdrawRouter from './RequestWithdraw';
import BankOfficialRouter from './BankOfficial';

const router = Router();

router.use('/request_topup', apiKey, RequestTopupRouter);
router.use('/request_withdraw', apiKey, RequestWithdrawRouter);
router.use('/account_bank', apiKey, AccountBankRouter);
router.use('/bank_official', BankOfficialRouter);

export default router;
