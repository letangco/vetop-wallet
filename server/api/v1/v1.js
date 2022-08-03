import { Router } from 'express';
import PaymentRouter from '../../components/payment/payment.route';
import WalletRouter from '../../components/wallet/wallet.route';
import TransactiontRouter from '../../components/transaction/transaction.route';
import IDFanRouter from '../../components/IDFan/IDFan.route';
import TransactionRouterAdmin from '../../components/admin/transaction/transaction.route';
import ReportRouterAdmin from '../../components/admin/report/report.route';
import AdminRouter from '../../components/admin/admin.route';

const router = new Router();

router.use('/payment', PaymentRouter);
router.use('/wallet', WalletRouter);
router.use('/transaction', TransactiontRouter);
router.use('/IDFan', IDFanRouter);
router.use('/admin/management-transaction/', [TransactionRouterAdmin]);
router.use('/admin/report-wallet', ReportRouterAdmin);
router.use('/admin', [AdminRouter]);

export default router;
