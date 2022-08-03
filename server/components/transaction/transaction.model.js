import mongoose, { Schema } from 'mongoose';

import slug from 'slug';
import {
  CURRENCY_TYPE, PAYMENT_TYPE, REPORT, TRANSACTION_CODE
} from '../../../external/constants/constants';
import {
  NOTIFICATION_TYPE, QUEUE_NAME, SOCKET_EMIT
} from '../../../external/constants/job_name';
// eslint-disable-next-line import/no-cycle
import { sendNotification } from '../notification/notification.service';
import { getWallet } from '../wallet/wallet.dao';
import { sendDataToQueue } from '../../../internal/rabbitmq/publisher/publisher';
import { Rabbitmq } from '../../server';
import StaticReport from '../wallet/staticReport';
import { getTransactionSetting } from './transactionSetting.dao';
import { updateSettingTransaction } from '../../../internal/grpc/store/request';
import { createTransaction, getTransactionTotal, updateOneTransactionByCond } from './transaction.dao';
import { transactionCreate } from './transaction.service';

/**
 * @swagger
 * definitions:
 *  Transaction:
 *    type: object
 *    properties:
 *      receivedId:
 *        type: ObjectId
 *      senderId:
 *        type: ObjectId
 *      value:
 *        type: number
 *      fee:
 *        type: number
 *      data:
 *        type: object
 *      timestamp:
 *        type: number
 *      status:
 *        type: number
 */
const TransactionSchema = new Schema({
  receivedId: { type: 'string', index: 1 },
  senderId: { type: 'string', index: 1 },
  total: { type: 'number', default: 0 },
  value: { type: 'number', default: 0 },
  fee: { type: 'number', default: 0 },
  tax: { type: 'number', default: 0 },
  data: { type: 'object' },
  timestamp: { type: 'number' },
  status: { type: 'number', default: 0 },
  code: { type: 'string', index: 1 },
  searchString: { type: String },
}, {
  timestamps: true
});

TransactionSchema.pre('save', async function (next) {
  const key = Object.keys(CURRENCY_TYPE).find(k => CURRENCY_TYPE[k] === this.data.currency);
  // const prevCode = await updateSettingTransaction(TRANSACTION_CODE[key]);
  const trans = await getTransactionTotal({});
  const str = `${trans}`;
  const pad = '0000000000';
  const numsString = `${TRANSACTION_CODE[key]}${(pad.substring(0, pad.length - str.length) + str)}`;
  this.code = numsString;
  this.wasNew = this.isNew;
  const searchString = slug(`${this.searchString} ${numsString}`, ' ');
  this.searchString = searchString;
  if (this?.data?.currency === CURRENCY_TYPE.VETIC && this?.data?.type !== PAYMENT_TYPE.FLUCTUATION_VETIC) {
    await transactionCreate({
      receivedId: this.receivedId || '',
      senderId: this.senderId || '',
      value: parseInt(this.value),
      total: this?.total || 0,
      tax: this?.tax || 0,
      fee: this?.fee || 0,
      data: {
        type: PAYMENT_TYPE.FLUCTUATION_VETIC,
        currency: CURRENCY_TYPE.VETIC,
        currentVetic: this.data.preVetic + this.value
      },
    });
  }
  next();
});

TransactionSchema.post('save', async function (created, next) {
  if (this.wasNew) {
    let type = '';
    switch (created.data.type) {
      case PAYMENT_TYPE.DEPOSIT:
        type = NOTIFICATION_TYPE.DEPOSIT;
        break;
      case PAYMENT_TYPE.WITHDRAWAL_PIN:
        created.total *= -1;
        created.value *= -1;
        type = NOTIFICATION_TYPE.WITHDRAWAL_PIN;
        await StaticReport.updateOne(
          { type: REPORT.PIN },
          { $inc: { data: -parseInt(created.value) } },
          { upsert: true }
        );
        break;
      case PAYMENT_TYPE.WITHDRAWAL_VND:
        created.total *= -1;
        created.value *= -1;
        type = NOTIFICATION_TYPE.WITHDRAWAL_VND;
        break;
      case PAYMENT_TYPE.TRANSFER_INTEREST_PIN:
        type = NOTIFICATION_TYPE.TRANSFER_INTEREST_PIN;
        break;
      case PAYMENT_TYPE.TRANSFER_VETIC_BUY:
        type = NOTIFICATION_TYPE.TRANSFER_VETIC_BUY;
        break;
      case PAYMENT_TYPE.TRANSFER_VETIC_SELL:
        type = NOTIFICATION_TYPE.TRANSFER_VETIC_SELL;
        break;
      case PAYMENT_TYPE.TRANSFER_VETIC_REF_BUY:
        type = NOTIFICATION_TYPE.TRANSFER_VETIC_REF_BUY;
        break;
      case PAYMENT_TYPE.TRANSFER_VETIC_REF_SELL:
        type = NOTIFICATION_TYPE.TRANSFER_VETIC_REF_SELL;
        break;
      case PAYMENT_TYPE.TRANSFER_MONEY_SYSTEM:
        type = NOTIFICATION_TYPE.TRANSFER_MONEY_SYSTEM;
        break;
      case PAYMENT_TYPE.TRANSFER_MONEY_ARCHIVE:
        type = NOTIFICATION_TYPE.TRANSFER_MONEY_ARCHIVE;
        break;
      case PAYMENT_TYPE.TOPUP:
        type = NOTIFICATION_TYPE.TOPUP;
        break;
      case PAYMENT_TYPE.STOCK_VND:
        type = NOTIFICATION_TYPE.STOCK_VND;
        break;
      case PAYMENT_TYPE.INCOME_TAX:
        type = NOTIFICATION_TYPE.INCOME_TAX;
        break;
      case PAYMENT_TYPE.TRANSFER_PIN:
        created.total *= -1;
        created.value *= -1;
        type = NOTIFICATION_TYPE.TRANSFER_PIN;
        await StaticReport.updateOne(
          { type: REPORT.PIN },
          { $inc: { data: -parseInt(created.value) } },
          { upsert: true }
        );
        break;
      default:
        break;
    }
    if (!type) {
      next();
    }
    if (created?.receivedId) {
      const wallet = await getWallet({
        _id: created.receivedId
      });
      wallet.stock = wallet.vetic / 500000;
      if (wallet && type) {
        sendDataToQueue(Rabbitmq.getChannel(), QUEUE_NAME.SOCKET_EMIT_TO_USER, {
          id: wallet.user,
          data: wallet,
          message: SOCKET_EMIT.UPDATE_WALLET,
        });
        await sendNotification({
          to: wallet.user,
          data: {
            receivedId: created.receivedId,
            total: created.total,
            value: created.value,
            fee: created.fee,
            tax: created.tax,
            targetId: created._id.toString(),
            transaction: created.data,
          },
          type: type
        });
      }
    }
  }
});

export default mongoose.model('Transaction', TransactionSchema);
