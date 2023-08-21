import { Router } from 'express';
import GateRouting from '@configs/routes/gate/index';
const router = Router();

router.use('/g', GateRouting);

export default router;
