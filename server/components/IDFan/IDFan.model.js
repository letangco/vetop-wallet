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
const IDFanSchema = new mongoose.Schema({
  user: { type: Schema.ObjectId, index: 1 },
  refer: { type: Schema.ObjectId, index: 1 },
  total: { type: 'number', index: 1, default: 0 },
  commission: { type: 'number', index: 1, default: 0 },
}, {
  timestamps: true
});

export default mongoose.model('IDFan', IDFanSchema);
