import { Router } from 'express';
import { auth } from '@middlewares/auth';
import { hasRole } from '@middlewares/checkRoles';
import UserRouter from './User';
import AuthRouter from './Auth';
import BlackListRouter from './BlackList';
import BlackListTopupRouter from './BlackListTopup';

import SmsTopupRouter from './SmsTopup';
import SmsWithdrawRouter from './SmsWithdraw';
import RequestTopupRouter from './RequestTopup';
import DashboardRouter from './Dashboard';
import HistorySummaryRouter from './HistorySummary';
import RequestWithdrawRouter from './RequestWithdraw';
import BankOfficialRouter from './BankOfficial';
import SessionRouter from './Session';
import PartnerReferenceRouter from './PartnerReference';
import ReportRouter from './Report';
import SmsErrorRouter from './SmsError';
import ConfigRouter from './Config';
import CallbackLogRouter from './CallbackLog';
import SystemLogsRouter from './SystemLogs';
import WhiteListIpRouter from './WhiteListIp';

const router = Router();

router.use('/auth', AuthRouter);
router.use('/session', auth, SessionRouter);
router.use('/user', auth, hasRole('admin'), UserRouter);
router.use('/user', UserRouter);
router.use('/white_list_ip', auth, hasRole('admin'), WhiteListIpRouter);
router.use('/blacklist', auth, hasRole('mod'), BlackListRouter);
router.use('/blacklist_topup', auth, hasRole('mod'), BlackListTopupRouter);

router.use('/sms_topup', auth, hasRole('mod'), SmsTopupRouter);
router.use('/sms_withdraw', auth, hasRole('mod'), SmsWithdrawRouter);
router.use('/sms_error', auth, hasRole('mod'), SmsErrorRouter);

router.use('/dashboard', auth, hasRole('report'), DashboardRouter);
router.use('/history_summary', auth, hasRole('report'), HistorySummaryRouter);
router.use('/report', auth, hasRole('report'), ReportRouter);
router.use('/system_logs', auth, hasRole('mod'), SystemLogsRouter);
router.use('/callbacklogs', auth, hasRole('mod'), CallbackLogRouter);

router.use('/request_topup', auth, hasRole('mod'), RequestTopupRouter);
// Check role inside
router.use('/request_withdraw', RequestWithdrawRouter);


// Check role inside
router.use('/bank_official', BankOfficialRouter);

router.use('/partner_reference', auth, hasRole('report'), PartnerReferenceRouter);

router.use('/config', auth, hasRole('admin'), ConfigRouter);

export default router;
