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
const WalletArchiveSchema = new Schema({
  money: { type: 'number', default: 0, index: 1 },
  data: { type: Object },
  moneyResponse: { type: 'number', default: 0 }
}, {
  timestamps: true
});

export default mongoose.model('WalletArchive', WalletArchiveSchema);
