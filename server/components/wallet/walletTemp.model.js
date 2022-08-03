import mongoose, { Schema } from 'mongoose';

/**
 * @swagger
 * definitions:
 *  Wallet User:
 *    type: object
 *    properties:
 *      user:
 *        type: String
 *      vetic:
 *        type: number
 */
const WalletTempSchema = new Schema({
  user: { type: 'string', index: 1 },
  type: { type: 'number', index: 1 },
  vetic: { type: 'number', default: 0 },
  totalVetic: { type: 'number', default: 0 },
  totalPin: { type: 'number', default: 0 }
});

export default mongoose.model('WalletTemp', WalletTempSchema);
