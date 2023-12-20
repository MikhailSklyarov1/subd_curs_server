import { Router } from 'express';
import recordsRouter from './recordsRouter.ts';

const router = Router();

router.use('/records', recordsRouter);

export default router;