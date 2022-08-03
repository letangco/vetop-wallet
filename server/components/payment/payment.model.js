import mongoose, { Schema } from 'mongoose';

/**
 * @swagger
 * definitions:
 *  Transaction pin:
 *    type: object
 *    properties:
 *      user:
 *        type: ObjectId
 *      paymentId:
 *        type: number
 *      amount:
 *        type: number
 *      detail:
 *        type: number
 *      status:
 *        type: number
 */
const PaymentSchema = new mongoose.Schema({
  user: { type: 'String', index: 1 },
  store: { type: 'String', index: 1 },
  type: { type: 'number', index: 1 },
  paymentId: { type: 'String' },
  amount: {
    type: 'Number',
    default: 0
  },
  status: {
    type: 'Number',
    default: 0
  },
  detail: { type: Object },
  order: { type: 'String' }
}, {
  timestamps: true
});

export default mongoose.model('Payment', PaymentSchema);
