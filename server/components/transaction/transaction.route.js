import { Router } from 'express';
import { isUser } from '../../../internal/auth/jwt';
import * as TransactionController from './transaction.controller';

const router = new Router();

router.route('')
  .get(
    isUser.auth(),
    TransactionController.getTransactions
  );

router.route('/income-tax')
  .get(
    isUser.auth(),
    TransactionController.getIncomeTax
  );

router.route('/:id')
  .get(
    isUser.auth(),
    TransactionController.getTransaction
  );

router.route('/stock/transaction')
  .get(
    isUser.auth(),
    TransactionController.getStockTransaction
  );

export default router;
