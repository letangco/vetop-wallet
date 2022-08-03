import { Router } from 'express';
import { get } from 'request';
import { isAdmin } from '../../../../internal/auth/jwt';
import * as TransactionController from './transaction.controller';

const router = new Router();

router.route('/')
  .get(
      isAdmin.auth(),
      TransactionController.adminGetTransactions
  )

router.route('/top-up/')
  .post(
    isAdmin.auth(),
    TransactionController.adminTopupVndToUser
  )

router.route('/:id')
  .get(
    isAdmin.auth(),
    TransactionController.adminGetTransactionById
  )

router.route('/withdrawal/list')
  .get(
    isAdmin.auth(),
    TransactionController.adminGetWithdrawal
  )

router.route('/withdrawal/handle')
  .put(
    isAdmin.auth(),
    TransactionController.adminHandleWithdrawal
  )

router.route('/withdrawal/detail/:id')
  .get(
    isAdmin.auth(),
    TransactionController.adminGetWithdrawalById
  )

router.route('/export/excel')
  .get(
    // isAdmin.auth(),
    TransactionController.adminExportTransaction
  )
export default router;
