import mongoose from 'mongoose';

/**
 * @swagger
 * definitions:
 *  Wallet User:
 *    type: object
 *    properties:
 *      user:
 *        type: ObjectId
 *      pin:
 *        type: number
 *      vetic:
 *        type: number
 *      stock:
 *        type: number
 *      money:
 *        type: number
 */
const WalletSchema = new mongoose.Schema({
  user: { type: 'string', index: 1 },
  type: { type: 'number', index: 1 },
  walletAddress: { type: 'string', default: '', index: 1 },
  pin: { type: 'number', default: 0, index: 1 },
  vetic: { type: 'number', default: 0, index: 1 },
  stock: { type: 'number', default: 0, index: 1 },
  tax: { type: 'number', default: 0, index: 1 },
  money: { type: 'number', default: 0, index: 1 },
  data: { type: 'object' },
  totalVetic: { type: 'number', default: 0 },
  totalPin: { type: 'number', default: 0 },
  veticTransferPin: { type: 'number', default: 0 },
  veticTransferStock: { type: 'number', default: 0 }
}, {
  timestamps: true
});

WalletSchema.pre('save', function (next) {
  if (this.data?.cos) {
    this.data.cos = Math.trunc(this.data.cos);
  }
  next();
});

WalletSchema.pre('update', function (next) {
  if (this.data?.cos) {
    this.data.cos = Math.trunc(this.data.cos);
  }
  next();
});

//
// WalletSchema.post('update', async function (doc, next) {
//   if (this.wasNew) {
//   }
// });
//
// WalletSchema.post('findOneAndUpdate', async function (created, next) {
//   console.log('WalletSchema findOneAndUpdate: ', created)
//   if (this.wasNew) {
//   }
// });

export default mongoose.model('Wallet', WalletSchema);
