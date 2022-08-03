import { ExpressValidation } from '@tggs/core-validation';
const Payment_Validation = new ExpressValidation();
Payment_Validation.init('vi');

export const PAYMENT_CREATE = Payment_Validation.validation({
  body: {
    // ipAddress: { type: 'String', required: true },
    ipAddress: { type: 'String' },
    bankCode: { type: 'String' },
  }
});
