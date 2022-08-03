import { Router } from 'express';
import * as PaymentListController from './paymentList.controller';

const router = new Router();

router.route('/')
  .get(
      PaymentListController.getPaymentList
  )
  .post(
      PaymentListController.createPaymentList
  );

router.route('/detail/:id')
  .get(
    PaymentListController.getPaymentListById
  );

export default router;
