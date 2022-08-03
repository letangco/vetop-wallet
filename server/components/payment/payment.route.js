import { Router } from 'express';
import { isStore, isUser } from '../../../internal/auth/jwt';
import { PAYMENT_CREATE } from './payment.validation';
import * as PaymentController from './payment.controller';

const router = new Router();

router.route('/create')
  .post(
    isUser.auth(),
    PAYMENT_CREATE,
    PaymentController.paymentCreate
  );

router.route('/postback')
  .get(
    PaymentController.paymentPostBack
  );

router.route('/payme-create')
  .post(
    isUser.auth(),
    PaymentController.paymentPaymeCreate
  );

router.route('/payment-payme/change-code/success/:transactionId')
  .get(
    // isUser.auth(),
    PaymentController.getInfoTransactionPayme
  );

router.route('/create-payment/payme')
  .post(
    PaymentController.createPaymentPayme
  );

export default router;
