import slug from 'slug';
import * as TransactionDao from '../../transaction/transaction.dao';
import * as PaymentDao from '../../payment/payment.dao';
import {
  CURRENCY_TYPE, ERROR_CODE, PAYMENT_TYPE, REPORT, SHARE_HOST, STATUS_WITHDRAWL, TRANS_STATUS_WITHDRAWAL, TYPE_LOGIN, USER_TYPE, WALLET_TYPE, WITHDRAWAL_TYPE
} from '../../../../external/constants/constants';
import { error500, errorMessage } from '../../../../external/util/error';
import { getBankInfo, getStoreInfo, getUserInfo, getUserInfoByCode } from '../../../../internal/grpc/user/request';
import { getTransaction, transactionCreate } from '../../transaction/transaction.service';
import { updateWalletPayment } from '../../wallet/wallet.service';
import { getWallet } from '../../wallet/wallet.dao';
import { getSort } from '../../../../external/middleware/query';
import { sendNotification } from '../../notification/notification.service';
import StaticReport from '../../wallet/staticReport';
import { GetFileData } from '../../../helpers/file.helper';
import { BODY_FCM, EXCEL_CONTENT, NOTIFICATION_TYPE } from '../../../../external/constants/job_name';
import xlsx from 'node-xlsx';
import { getStoreInfoByCode } from '../../../../internal/grpc/user/request';

export async function adminGetTransactions(options, sort = { createdAt: -1 }) {
  try {
    const conditions = {
    };
    const arrError = [];
    const paymentType = [];
    if (options?.userId) {
      const wallet = await getWallet({ user: options.userId });
      if (wallet) {
        conditions.receivedId = wallet._id;
      } else {
        return [0, []];
      }
    }
    if (options.paymentType) {
      options.paymentType = options.paymentType.split(',');
      options.paymentType.forEach((item, i) => {
        if (!Object.values(PAYMENT_TYPE).includes((Number(options.paymentType[i])))) {
          arrError.push(options.paymentType);
        }
        paymentType.push(Number(options.paymentType[i]));
      });
      if (arrError.length) return errorMessage(404, ERROR_CODE.PAYMENT_TYPE_INVAILID);
      conditions['data.type'] = { $in: paymentType };
    } else {
      if (options.withdrawal) {
        conditions['data.type'] = { $in: [PAYMENT_TYPE.DEPOSIT] };
      } else {
        conditions['data.type'] = { $in: [PAYMENT_TYPE.WITHDRAWAL_PIN, PAYMENT_TYPE.WITHDRAWAL_VND, PAYMENT_TYPE.TRANSFER_PIN] };
      }
    }
    if (options.type) {
      conditions['data.currency'] = CURRENCY_TYPE[options.type];
    }
    if (options.userType) {
      conditions['data.userType'] = Number(options.userType);
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
    let keyword;
    if (options?.keyword) {
      keyword = slug(options?.keyword, ' ');
    } else keyword = '';
    const conditionSearchs = [];
    if (keyword) {
      conditionSearchs.push(
        { code: { $regex: keyword, $options: 'i' } },
        { searchString: { $regex: keyword, $options: 'i' } },
      );
      conditions.['$or'] = conditionSearchs;
    }
    const results = await Promise.all([
      TransactionDao.getTransactionTotal(conditions),
      TransactionDao.getTransactions(conditions, options, sort)
    ]);
    const total = results[0];
    const data = await getMetaDataTransaction(results[1]);
    return [total, data];
  } catch (error) {
    return error500(error);
  }
}

/**
 * getTransactions
 * @param {object} options
 * */
export async function adminGetTransactionById(id) {
  try {
    const transaction = await TransactionDao.getTransactionById(id);
    if (!transaction) {
      return errorMessage(400, ERROR_CODE.TRANSACTION_NOT_FOUND);
    }
    if (transaction?.data?.paymentId) {
      const paymentInfo = await PaymentDao.getPayment({ _id: transaction.paymentId });
      if (paymentInfo?.user) {
        paymentInfo.user = await getUserInfo(paymentInfo.user);
      }
      return paymentInfo;
    }
    return transaction;
  } catch (error) {
    return error500(error);
  }
}

export async function adminTopupVndToUser(options) {
  try {
    if (!Object.values(USER_TYPE).includes(options.type)) {
      return errorMessage(404, ERROR_CODE.TYPE_USER_INVAILID);
    }
    let user;
    if (options.type === USER_TYPE.USER) {
      user = await getUserInfoByCode(options.code);
    } else {
      user = await getStoreInfoByCode(options.code);
    }
    if (!user?._id) return errorMessage(404, ERROR_CODE.USER_NOT_FOUND);
    if (!options?.amount || Number(options?.amount) < 100000 || !Number.isInteger(Number(options?.amount))) {
      return errorMessage(400, ERROR_CODE.AMOUNT_TRANSACTION_INVALID);
    }
    const wallets = await Promise.all([
      getWallet({ type: WALLET_TYPE.TOTAL }),
      updateWalletPayment({
        user: user._id,
        value: parseInt(options.amount),
        type: parseInt(options.type)
      }),
    ]);
    const searchString = slug(`${user.code}`, ' ');
    await transactionCreate({
      receivedId: wallets[1]?._id || '',
      senderId: wallets[0]?._id || '',
      value: parseInt(options.amount),
      fee: 0,
      data: {
        adminId: options._id,
        type: PAYMENT_TYPE.TOPUP,
        currency: CURRENCY_TYPE.VND,
        userType: options.type === USER_TYPE.USER ? USER_TYPE.USER : USER_TYPE.STORE
      },
      timestamp: new Date().getTime(),
      status: STATUS_WITHDRAWL.APPROVE,
      searchString
    });
    return true;
  } catch (error) {
    return error500(error);
  }
}

export async function adminGetWithdrawal(query) {
  try {
    let cond;
    const sort = getSort(query);
    if (query?.type) {
      cond = {
        'data.type': Number(query.type),
      };
    }
    if (query?.status) {
      cond.status = Number(query.status);
    }
    const promise = await Promise.all([TransactionDao.countTransactionByCond(cond), TransactionDao.getTransactions(cond, query, sort)]);
    return [promise[0], await getMetaDataTransaction(promise[1])];
  } catch (error) {
    return error500(error);
  }
}

export async function getMetaDataTransaction(data) {
  try {
    const isArray = Array.isArray(data);
    if (!isArray) {
      data = [data];
    }
    const promise = data.map(async (item) => {
      // console.log(item)
      item = item.toObject();
      const wallet = await getWallet({ _id: item.receivedId });
      switch (wallet?.type) {
        case WALLET_TYPE.USER:
          const user = await getUserInfo(wallet.user);
          if (user?.avatar) {
            user.avatar = GetFileData(SHARE_HOST, JSON.parse(user?.avatar));
          }
          item.receivedId = user;
          break;
        case WALLET_TYPE.STORE:
          item.receivedId = await getStoreInfo(wallet?.user) || {};
          break;
        case WALLET_TYPE.SIM:
          const promise = await Promise.all([getStoreInfo(wallet?.user), getUserInfo(wallet?.user)]);
          item.receivedId = (promise[0] ? promise[0] : promise[1]) || {};
          break;
        default:
          break;
      }
      return item;
    });
    const result = await Promise.all(promise);
    return isArray ? result : result[0];
  } catch (error) {
    return error500(error);
  }
}

export async function adminHandleWithdrawal(options) {
  try {
    options.status = Number(options.status);
    const transaction = await TransactionDao.findOneTransactionByCond({ _id: options.transactionId });
    if (!transaction) return await errorMessage(404, ERROR_CODE.TRANSACTION_NOT_FOUND);
    const wallet = await getWallet({ _id: transaction.receivedId });
    if (!wallet) return errorMessage(404, ERROR_CODE.WALLET_NOT_FOUND);
    switch (transaction.status) {
      case STATUS_WITHDRAWL.REJECT:
        return errorMessage(400, ERROR_CODE.TRANSACTION_WAS_REJECTED);
      case STATUS_WITHDRAWL.APPROVE:
      case STATUS_WITHDRAWL.PENDING:
      case STATUS_WITHDRAWL.DOING:
        if (options?.status === STATUS_WITHDRAWL.APPROVE) {
          transaction.status = STATUS_WITHDRAWL.APPROVE;
          await transaction.save();
        } else if (options?.status === STATUS_WITHDRAWL.REJECT) {
          transaction.status = STATUS_WITHDRAWL.REJECT;
          await transaction.save();
          switch (transaction?.data?.type) {
            case PAYMENT_TYPE.WITHDRAWAL_VND:
              transaction.data.type = PAYMENT_TYPE.REFUND_WITHDRAWAL_VND;
              transaction.data.currency = CURRENCY_TYPE.VND;
              await Promise.all([
                wallet.update({
                  $inc: { money: (parseInt(transaction.value) + parseInt(transaction.fee)) * -1 }
                }),
                transactionCreate({
                  receivedId: transaction.receivedId || '',
                  senderId: transaction.senderId || '',
                  value: parseInt(transaction.value) * -1,
                  fee: parseInt(transaction.fee),
                  total: parseInt(parseInt(transaction.value) + parseInt(transaction.fee)) * -1,
                  data: transaction.data,
                  timestamp: new Date().getTime(),
                  status: STATUS_WITHDRAWL.APPROVE
                })
              ]);
              break;
            case PAYMENT_TYPE.WITHDRAWAL_PIN:
              transaction.data.type = PAYMENT_TYPE.REFUND_WITHDRAWAL_PIN;
              transaction.data.currency = CURRENCY_TYPE.PIN;
              await Promise.all([
                wallet.update({
                  $inc: { pin: (parseInt(transaction.value) + parseInt(transaction.fee)) * -1 }
                }),
                StaticReport.updateOne(
                  { type: REPORT.PIN },
                  { $inc: { data: parseInt(transaction.value) } },
                  { upsert: true }
                ),
                transactionCreate({
                  receivedId: transaction.receivedId || '',
                  senderId: transaction.senderId || '',
                  value: parseInt(transaction.value) * -1,
                  fee: parseInt(transaction.fee),
                  total: parseInt(parseInt(transaction.value) + parseInt(transaction.fee)) * -1,
                  data: transaction.data,
                  timestamp: new Date().getTime(),
                  status: STATUS_WITHDRAWL.APPROVE
                })
              ]);
              break;
            default:
              break;
          }
        } else if (options?.status === STATUS_WITHDRAWL.DOING) {
          transaction.status = STATUS_WITHDRAWL.DOING;
          await transaction.save();
        } else {
          return true;
        }
        break;
      default:
        break;
    }
    const type = [];
    switch (transaction.status) {
      case STATUS_WITHDRAWL.REJECT:
        transaction.data.type === PAYMENT_TYPE.WITHDRAWAL_PIN ? type.push(NOTIFICATION_TYPE.ADMIN_REJECT_WITHDRAWAL_PIN) : type.push(NOTIFICATION_TYPE.ADMIN_REJECT_WITHDRAWAL_VND);
        transaction.data.type === PAYMENT_TYPE.WITHDRAWAL_PIN ? type.push(NOTIFICATION_TYPE.REFUND_WITHDRAWAL_PIN) : type.push(NOTIFICATION_TYPE.REFUND_WITHDRAWAL_VND);
        break;
      case STATUS_WITHDRAWL.APPROVE:
        transaction.data.type === PAYMENT_TYPE.WITHDRAWAL_PIN ? type.push(NOTIFICATION_TYPE.ADMIN_APPROVE_WITHDRAWAL_PIN) : type.push(NOTIFICATION_TYPE.ADMIN_APPROVE_WITHDRAWAL_VND);
        break;
      case STATUS_WITHDRAWL.DOING:
        transaction.data.type === PAYMENT_TYPE.WITHDRAWAL_PIN ? type.push(NOTIFICATION_TYPE.ADMIN_IS_CONSIDERING_PIN) : type.push(NOTIFICATION_TYPE.ADMIN_IS_CONSIDERING_VND);
        break;
      default:
        break;
    }
    const promise = type.map(async (item, index) => {
      await sendNotification({
        type: type[index],
        to: wallet.user,
        data: {
          targetId: transaction._id,
          value: transaction.value * -1,
        }
      });
    });
    await Promise.all(promise);
    return true;
  } catch (error) {
    return error500(error);
  }
}

export async function adminGetWithdrawalById(id) {
  try {
    let transaction = await TransactionDao.findOneTransactionByCond({ _id: id });
    transaction = await getMetaDataTransaction(transaction);
    return transaction;
  } catch (error) {
    return error500(error);
  }
}

export async function adminExportTransaction(options) {
  try {
    let temp = [];
    const columnNameVi = ['Mã người dùng', 'Tên', 'Thời gian nạp', 'Số tiền', 'Hình thức', 'Trạng thái'];
    const columnName = ['code', 'name', 'createdAt', 'value', 'bankCode', 'status'];
    const sort = getSort(options);
    const dataExcel = [columnNameVi];
    const conditions = {};
    if (options.userType) {
      conditions['data.userType'] = Number(options.userType);
    }
    if (options.userId) {
      const wallet = await getWallet({ user: options.userId });
      if (wallet) {
        conditions.receivedId = wallet._id;
      } else {
        return [0, []];
      }
    }
    if (options.paymentType) {
      if (!Object.values(PAYMENT_TYPE).includes(parseInt(options.paymentType))) return errorMessage(404, ERROR_CODE.PAYMENT_TYPE_INVAILID);
      conditions['data.type'] = { $in: [Number(options.paymentType)] };
    } else {
      if (options.withdrawal) {
        conditions['data.type'] = { $in: [PAYMENT_TYPE.DEPOSIT] };
      } else {
        conditions['data.type'] = { $in: [PAYMENT_TYPE.WITHDRAWAL_PIN, PAYMENT_TYPE.WITHDRAWAL_VND, PAYMENT_TYPE.TRANSFER_PIN] };
      }
    }
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
    if (options.status) {
      conditions.status = parseInt(options.status);
    }
    const result = await TransactionDao.getTransactions(conditions, options, sort);
    const promise = result.map(async (item) => {
      item = item.toObject();
      item.createdAt = item.createdAt.toString();
      switch (item.data.type) {
        case PAYMENT_TYPE.WITHDRAWAL_PIN:
          item.bankCode = EXCEL_CONTENT.WITHDRAWAL_PIN;
          break;
        case PAYMENT_TYPE.WITHDRAWAL_VND:
          item.bankCode = EXCEL_CONTENT.WITHDRAWAL_VND;
          break;
        case PAYMENT_TYPE.TRANSFER_PIN:
          item.bankCode = EXCEL_CONTENT.TRANSFER_PIN;
          break;
        case PAYMENT_TYPE.DEPOSIT:
          item.bankCode = EXCEL_CONTENT.DEPOSIT;
          break;
        default:
          break;
      }
      const wallet = await getWallet({ _id: item.receivedId });
      if (item?.data?.userType === WALLET_TYPE.USER) {
        const user = await getUserInfo(wallet.user);
        item.code = user?.code || '';
        item.name = user?.fullName || '';
      } else {
        const store = await getStoreInfo(wallet.user);
        item.code = store.code || '';
        item.name = store.name || '';
      }
      item.status = TRANS_STATUS_WITHDRAWAL[Object.keys(STATUS_WITHDRAWL).find(key => STATUS_WITHDRAWL[key] === item.status)];
      return item;
    });
    const payload = await Promise.all(promise);
    for (let j = 0; j < payload.length; j++) {
      for (let i = 0; i < columnName.length; i++) {
        temp.push(payload[j][columnName[i]]);
        if (i === (columnName.length - 1)) {
          dataExcel.push(temp);
          temp = [];
        }
      }
    }
    const excelFile = xlsx.build([{ name: 'sheet1', data: dataExcel }]);
    return ['transaction.xlsx', excelFile];
  } catch (error) {
    return error500(error);
  }
}
