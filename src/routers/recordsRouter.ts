import { Router } from 'express';
import recordsController from '../controllers/recordsController.ts';

const router = Router();

router.get('/', recordsController.getSomeRecords);
router.post('/vary_emo', recordsController.getRecordsWithVaryEmo);


export default router;