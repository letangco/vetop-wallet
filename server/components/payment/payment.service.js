import dateFormat from 'dateformat';
import { error500, errorMessage } from '../../../external/util/error';
import { generateUrlPay, postBackTransaction } from '../../../internal/vnpay/helper';
import { sendDataToQueue } from '../../../internal/rabbitmq/publisher/publisher';
import { Rabbitmq } from '../../server';
import { QUEUE_NAME, SOCKET_EMIT } from '../../../external/constants/job_name';
import { paymentInsertOne, paymentFindOneByCondition } from './payment.dao';
import { transactionCreate } from '../transaction/transaction.service';
import { updateWalletPayment } from '../wallet/wallet.service';
import { PAYMENT_TYPE, WALLET_TYPE, CURRENCY_TYPE, USER_TYPE, PUBLIC_KEY_PAYME, PRIVATE_KEY_PAYME, CONNECTION_ID_PAYME, CONNECTION_KEY_PAYME, STATUS_PAYMENT_PAYME, ERROR_CODE, STATUS_ORDER } from '../../../external/constants/constants';
import { updateVeticFromOrder } from '../wallet/wallet.service';
import { getWallet } from '../wallet/wallet.dao';
import { body } from 'express-validator';
import { meAPI } from '../../util/payme';
import { createTransaction, findOneTransactionByCond, getTransactionById } from '../transaction/transaction.dao';
import { changeCodeUser } from '../../../internal/grpc/user/request';
import { getOrderInfo, updateStatusTypeOrderById } from '../../../internal/grpc/store/request';

/**
 * paymentVNPayGetUrl
 * @param {object} options
 * */
export async function paymentVNPayGetUrl(options, user) {
  try {
    const payment = await paymentInsertOne({
      paymentId: dateFormat(new Date(), 'yyyymmddHHmmss'),
      user: user?._id || '',
      store: user?.storeId || '',
      type: user?.storeId ? USER_TYPE.STORE : USER_TYPE.USER,
      amount: options.amount,
      detail: {},
      order: options?.orderId || ''
    });
    options.paymentId = payment.paymentId;
    return generateUrlPay(options);
  } catch (error) {
    return error500(error);
  }
}

export async function paymentVNPayGetUrlOrder(data) {
  try {
    const payment = await paymentInsertOne({
      paymentId: dateFormat(new Date(), 'yyyymmddHHmmss'),
      user: data?.userId || '',
      store: data?.store || '',
      type: data?.store ? USER_TYPE.STORE : USER_TYPE.USER,
      amount: data?.total || 0,
      detail: {},
      order: data?._id
    });
    data.paymentId = payment.paymentId;
    return generateUrlPay(data);
  } catch (error) {
    return error500(error);
  }
}

/**
 * paymentPostBack
 * */
// eslint-disable-next-line consistent-return
export async function paymentPostBack(options) {
  try {
    if (postBackTransaction(options)) {
      const payment = await paymentFindOneByCondition({ paymentId: options.vnp_TxnRef });
      if (payment && payment.status === 0) {
        if (options.vnp_ResponseCode === '00') {
          // update Status order
          if (payment?.order) {
            const payloadUpdate = await updateStatusTypeOrderById(payment.order, STATUS_ORDER.MAIN);
            if (payloadUpdate?.success.toString() === 'true') {
              const wallets = await Promise.all([
                getWallet({ type: WALLET_TYPE.TOTAL }),
                getWallet({
                  user: payment.type === USER_TYPE.STORE ? payment.store : payment.user,
                  type: payment.type
                })
              ]);
              const orderPayment = await getOrderInfo(payment.order);
              console.log('order update vetic vnpay: ', JSON.parse(orderPayment?.order));
              if (orderPayment?.order) {
                console.log('order update vetic vnpay: ', JSON.parse(orderPayment?.order));
                await updateVeticFromOrder(JSON.parse(orderPayment?.order));
              }
              await Promise.all([
                payment.update({
                  status: 1,
                  detail: options
                }),
                transactionCreate({
                  receivedId: wallets[1]?._id || '',
                  senderId: wallets[0]?._id || '',
                  value: payment.amount,
                  fee: 0,
                  data: {
                    paymentId: payment._id,
                    type: PAYMENT_TYPE.DEPOSIT,
                    currency: CURRENCY_TYPE.VND,
                    bankCode: options.vnp_BankCode,
                    userType: payment.type === USER_TYPE.STORE ? USER_TYPE.STORE : USER_TYPE.USER
                  },
                  timestamp: new Date().getTime(),
                  status: 1
                })
              ]);
            }
          } else {
            const wallets = await Promise.all([
              getWallet({ type: WALLET_TYPE.TOTAL }),
              updateWalletPayment({
                user: payment.type === USER_TYPE.STORE ? payment.store : payment.user,
                value: payment.amount,
                type: payment.type
              }),
            ]);
            await Promise.all([
              payment.update({
                status: 1,
                detail: options
              }),
              transactionCreate({
                receivedId: wallets[1]?._id || '',
                senderId: wallets[0]?._id || '',
                value: payment.amount,
                fee: 0,
                data: {
                  paymentId: payment._id,
                  type: PAYMENT_TYPE.DEPOSIT,
                  currency: CURRENCY_TYPE.VND,
                  bankCode: options.vnp_BankCode,
                  userType: payment.type === USER_TYPE.STORE ? USER_TYPE.STORE : USER_TYPE.USER
                },
                timestamp: new Date().getTime(),
                status: 1
              })
            ]);
          }
          // -------------------------
        } else {
          await payment.update({
            status: -1,
            detail: options
          });
        }
        sendDataToQueue(Rabbitmq.getChannel(), QUEUE_NAME.SOCKET_EMIT_TO_USER, {
          id: payment.type === USER_TYPE.STORE ? payment.store : payment.user,
          data: options,
          message: SOCKET_EMIT.RESULT_PAYMENT,
        });
      }
    }
  } catch (error) {
    return error500(error);
  }
}

export async function createPaymentLater(transId) {
  try {
    const trans = await findOneTransactionByCond({ _id: transId });
    if (!trans) return errorMessage(404, ERROR_CODE.NOT_FOUND_ERR);
    if (trans.status !== STATUS_PAYMENT_PAYME.PENDING) {
      return false;
    }
    const result = await paymentPaymeCreate(trans.data.user, trans.value, trans.data.code);
    return result;
  } catch (error) {
    return error500(error);
  }
}

export async function paymentPaymeCreate(user, amount, code) {
  try {
    const walletUser = await getWallet({ user });
    const changeCodeTransaction = await transactionCreate({
      receivedId: walletUser._id || '',
      senderId: walletUser._id || '',
      value: parseInt(amount),
      fee: 0,
      data: {
        transactionIdPayme: '',
        type: PAYMENT_TYPE.CHANGE_CODE_USER,
        currency: CURRENCY_TYPE.VND,
        code: code,
        user: user
      },
      timestamp: new Date().getTime(),
      status: STATUS_PAYMENT_PAYME.PENDING
    });
    const path = '/v1/Payment/Generate';
    const accessToken = CONNECTION_KEY_PAYME;
    const payload = {
      amount: amount,
      partnerTransaction: changeCodeTransaction._id,
      desc: 'Thanh toán thay đổi mã số',
      extraData: {},
      redirectUrl: `https://vetop-wallet-dev.tesse.io/v1/payment/payment-payme/change-code/success/${changeCodeTransaction._id}`,
      failedUrl: 'https://vetop-wallet-dev.tesse.io/'
    };
    const response = await meAPI.Post(path, payload, accessToken);
    const resData = JSON.parse(response.data).data.transaction;
    const trans = await findOneTransactionByCond({ _id: changeCodeTransaction._id });
    trans.data = {
      transactionIdPayme: resData,
      type: PAYMENT_TYPE.CHANGE_CODE_USER,
      currency: CURRENCY_TYPE.VND,
      user: user,
      code: code
    }
    await trans.save();
    return JSON.parse(response.data).data.url;
  } catch (error) {
    return error500(error);
  }
}

export async function getInfoTransactionPayme(id) {
  try {
    const transaction = await findOneTransactionByCond({ _id: id });
    const path = `/v1/Payment/Information/${transaction.data.transactionIdPayme}`;
    const accessToken = CONNECTION_KEY_PAYME;
    const data = await meAPI.Get(path, accessToken);
    const options = transaction.data;
    options.status = STATUS_PAYMENT_PAYME.APPROVE;
    const result = JSON.parse(data.data);
    if (result.data.state === 'SUCCEEDED') {
      transaction.data = options;
      await Promise.all([transaction.save(), changeCodeUser(transaction.data.user, transaction.data.code)]);
      return true;
    }
    return false;
  } catch (error) {
    return error500(error);
  }
}

export async function cancelPaymentPayme(id) {
  try {
    const transaction = await findOneTransactionByCond({ _id: id });
    const path = `/v1/Payment/${transaction.data.transactionIdPayme}`;
    const accessToken = CONNECTION_KEY_PAYME;
    const data = await meAPI.Delete(path, accessToken);
    const options = transaction.data;
    options.status = STATUS_PAYMENT_PAYME.APPROVE;
    const result = JSON.parse(data.data);
    if (result.data?.transaction) {
      // transaction.data = options;
      // await Promise.all([transaction.save(), changeCodeUser(transaction.data.user, transaction.data.code)]);
      return true;
    }
    return false;
  } catch (error) {
    return error500(error);
  }
}
