import { Router } from 'express';
import SettingsGeneral from './settings-general/settings-general.route';
import PaymentList from './paymentList/paymentList.route';

const router = new Router();

router.use('/settings-general', [SettingsGeneral]);
router.use('/payment-list', [PaymentList]);

export default router;
