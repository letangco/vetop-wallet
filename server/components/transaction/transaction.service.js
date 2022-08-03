import { error500, errorMessage } from '../../../external/util/error';
import * as TransactionDao from './transaction.dao';
import * as PaymentDao from '../payment/payment.dao';
import { PAYMENT_TYPE, CURRENCY_TYPE, ERROR_CODE, USER_TYPE } from '../../../external/constants/constants';
/**
 * transactionCreate
 * @param {object} options
 * */
export async function transactionCreate(options) {
  try {
    return await TransactionDao.createTransaction(options);
  } catch (error) {
    return error500(error);
  }
}

/**
 * getTransactions
 * @param {object} options
 * */
export async function getTransactions(options, sort = {createdAt: -1}) {
  try {
    const conditions = {
      'data.type': {
        $nin: [
          PAYMENT_TYPE.TRANSFER_MONEY_ARCHIVE,
          PAYMENT_TYPE.TRANSFER_MONEY_SYSTEM,
          PAYMENT_TYPE.INCOME_TAX,
          PAYMENT_TYPE.TRANSFER_VETIC_TO_SIM,
          PAYMENT_TYPE.TRANSFER_VETIC_TO_STOCK,
          PAYMENT_TYPE.FLUCTUATION_VETIC,
          PAYMENT_TYPE.TRANSFER_VETIC_TOTAL
        ]
      }
    };
    if (options.type) {
      conditions['data.currency'] = CURRENCY_TYPE[options.type];
    }
    if (options.wallet) {
      conditions.receivedId = options.wallet;
    }
    if (options.fromDay && options.toDay) {
      conditions.createdAt = {
        $gte: new Date(options.fromDay),
        $lt: new Date(options.toDay)
      };
    } else if (options.toDay) {
      conditions.createdAt = { $lt: new Date(options.toDay) };
    } else if (options.fromDay) {
      conditions.createdAt = { $gte: new Date(options.fromDay) };
    }
    if (options.wallet) {
      conditions.receivedId = options.wallet;
    }
    const results = await Promise.all([
      TransactionDao.getTransactionTotal(conditions),
      TransactionDao.getTransactions(conditions, options, sort)
    ]);
    const total = results[0];
    let data = results[1];
    data = data.map( async e => {
      e = e.toJSON()
      if (e?.data?.paymentId) {
        const paymentInfo = await PaymentDao.getPayment({ _id: e?.data?.paymentId })
        return {
          _id: e._id,
          value: e.value,
          total: e.total,
          tax: e.tax,
          fee: e.fee,
          type: e.data.type,
          currency: e.data.currency,
          paymentInfo,
          timestamp: e.timestamp,
          status: e.status,
          code: e.code,
          createdAt: e.createdAt,
        };
      }
      if (e?.data?.orderId) {
        return {
          _id: e._id,
          value: e.value,
          total: e.total,
          tax: e.tax,
          fee: e.fee,
          type: e.data.type,
          currency: e.data.currency,
          orderId: e?.data?.orderId,
          timestamp: e.timestamp,
          status: e.status,
          code: e.code,
          createdAt: e.createdAt,
        };
      }
      return {
        _id: e._id,
        value: e.value,
        total: e.total,
        tax: e.tax,
        fee: e.fee,
        type: e.data.type,
        currency: e.data.currency,
        timestamp: e.timestamp,
        status: e.status,
        code: e.code,
        createdAt: e.createdAt,
      };
    });
    return [total, await Promise.all(data)];
  } catch (error) {
    return error500(error);
  }
}

/**
 * getIncomeTax
 * @param {object} options
 * */
export async function getIncomeTax(options, sort = {createdAt: -1}) {
  try {
    let conditions = {};
    if (parseInt(options.paymentType) === PAYMENT_TYPE.TRANSFER_INTEREST_PIN) {
      conditions = {
        'data.type': PAYMENT_TYPE.TRANSFER_INTEREST_PIN,
        'data.userType': USER_TYPE.USER,
        tax: { $gt: 0 }
      };
    } else {
      conditions = {
        'data.type': PAYMENT_TYPE.INCOME_TAX,
      };
    }
    if (options.wallet) {
      conditions.receivedId = options.wallet;
    }
    if (options.fromDay && options.toDay) {
      conditions.createdAt = {
        $gte: new Date(options.fromDay),
        $lt: new Date(options.toDay)
      };
    } else if (options.toDay) {
      conditions.createdAt = { $lt: new Date(options.toDay) };
    } else if (options.fromDay) {
      conditions.createdAt = { $gte: new Date(options.fromDay) };
    }
    if (options.wallet) {
      conditions.receivedId = options.wallet;
    }
    if (options.status) {
      conditions.status = parseInt(options.status);
    }
    const results = await Promise.all([
      TransactionDao.getTransactionTotal(conditions),
      TransactionDao.getTransactions(conditions, options, sort)
    ]);
    const total = results[0];
    let data = results[1];
    data = data.map( async e => {
      e = e.toJSON()
      return {
        _id: e._id,
        value: e.value,
        tax: e.tax,
        fee: e.fee,
        type: e.data.type,
        currency: e.data.currency,
        timestamp: e.timestamp,
        status: e.status,
        code: e.code,
        preTax: e.data?.preTax,
        createdAt: e.createdAt,
      };
    });
    return [total, await Promise.all(data)];
  } catch (error) {
    return error500(error);
  }
}

/**
 * getTransactions
 * @param {object} options
 * */
export async function getTransaction(id, user) {
  try {
    const transaction = await TransactionDao.getTransactionById(id);
    if (!transaction) {
      return errorMessage(400, ERROR_CODE.TRANSACTION_NOT_FOUND);
    }
    if (user.toString() !== transaction.receivedId.toString()) {
      return errorMessage(404, ERROR_CODE.UNAUTHORIZED);
    }
    return transaction;
  } catch (error) {
    return error500(error);
  }
}

export async function getStockTransaction(options, sort = {createdAt: -1}) {
  try {
    const conditions = {
      'data.type': {
        $in: [
          PAYMENT_TYPE.TRANSFER_VETIC_TO_STOCK,
          PAYMENT_TYPE.FLUCTUATION_VETIC
        ]
      }
    };
    if (options.type) {
      conditions['data.currency'] = CURRENCY_TYPE[options.type];
    }
    if (options.wallet) {
      conditions.receivedId = options.wallet;
    }
    if (options.fromDay && options.toDay) {
      conditions.createdAt = {
        $gte: new Date(options.fromDay),
        $lt: new Date(options.toDay)
      };
    } else if (options.toDay) {
      conditions.createdAt = { $lt: new Date(options.toDay) };
    } else if (options.fromDay) {
      conditions.createdAt = { $gte: new Date(options.fromDay) };
    }
    if (options.wallet) {
      conditions.receivedId = options.wallet;
    }
    const results = await Promise.all([
      TransactionDao.getTransactionTotal(conditions),
      TransactionDao.getTransactions(conditions, options, sort)
    ]);
    return [results[0], results[1]];
  } catch (error) {
    return error500(error);
  }
}
