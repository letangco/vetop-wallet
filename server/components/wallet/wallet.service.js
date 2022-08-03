/* eslint-disable no-plusplus */
import { error500, errorMessage } from '../../../external/util/error';
import {
  CURRENCY_TYPE,
  PAYMENT_TYPE,
  WALLET_TYPE,
  USER_TYPE,
  WALLET_ARCHIVE_STATUS,
  WITHDRAWAL_TYPE,
  ERROR_CODE,
  TAX_VALUE,
  REPORT,
  STATUS_WITHDRAWL,
  TYPE_SETTING
  , TYPE_ORDER_SIM_PRODUCT,
  TYPE_LOGIN,
  REDIS_SIM,
  EXPIRE_SIM_OTP,
  SHARE_HOST
} from '../../../external/constants/constants';
import {
  createWallet, getTotalStockDAO, getTotalVeticDAO, getAllWalletDAO, getTotalWalletDAO, getTotalWalletsDAO, getWallet, getWalletDAO, getWalletsDAO, getRankingDAO
} from './wallet.dao';
import { transactionCreate } from '../transaction/transaction.service';
import { createIDFan, updateIDFan } from '../IDFan/IDFan.service';
import Wallet from './wallet.model';
import WalletTemp from './walletTemp.model';
import walletArchiveHistory from './walletArchive.model';
import ArchiveTracking from './archiveTracking.model';
import { sendDataToQueue } from '../../../internal/rabbitmq/publisher/publisher';
import { Rabbitmq } from '../../server';
import { QUEUE_NAME, SOCKET_EMIT } from '../../../external/constants/job_name';
import { declareQueue } from '../../../internal/rabbitmq/subscriber/subscriber';
import {
  redisGet, redisSet, redisExpire, redisDel
} from '../../util/Redis';

import StaticReport from './staticReport';
import { getBankInfo, getStoreInfo, getUserInfo } from '../../../internal/grpc/user/request';
import { getSetting } from '../admin/settings-general/settings-general.dao';

import { getSimInfo, updateTimeFirework } from '../../../internal/grpc/store/request';
import { generateRandom6Digits } from '../../helpers/string.helper';
import { getSort } from '../../../external/middleware/query';
import { GetFileData } from '../../helpers/file.helper';
import ReportModel from './staticReport';

export async function updateVeticFromOrder(data) {
  try {
    console.log('run grpc update vetic', data);
    // TODO: need to get config from database for commission vetic
    const results = await Promise.all([
      getWallet({ type: WALLET_TYPE.TOTAL }),
      getWallet({ type: WALLET_TYPE.ARCHIVE }),
      getWallet({ type: WALLET_TYPE.USER, user: data.userId }),
      getWallet({ type: WALLET_TYPE.USER, user: data.buyId }),
      getWallet({ type: WALLET_TYPE.USER, user: data.sellId }),
      getWallet({ type: data.typeOwner === TYPE_LOGIN.STORE ? WALLET_TYPE.STORE : WALLET_TYPE.USER, user: data.storeId }),
      getSetting({ type: TYPE_SETTING.MAX_VETIC }), // max vetic: ex: 300% - results[6]
      getSetting({ type: TYPE_SETTING.MULTIPLE_NUMBER_VETIC }), // multiple number vetic ex: 10 results[7]
      getSetting({ type: TYPE_SETTING.VETIC_REF_BUYER_RECEIVE }), // percent vetic ref buyer receive results[8]
      getSetting({ type: TYPE_SETTING.VETIC_REF_SELLER_RECEIVE }) // percent vetic ref seller receive results[9]
    ]);
    const walletTotal = results[0] || await createWallet({
      user: '',
      type: WALLET_TYPE.TOTAL,
    });
    const walletArchive = results[1] || await createWallet({
      user: '',
      type: WALLET_TYPE.ARCHIVE,
    });
    const walletUser = results[2] || await createWallet({
      type: WALLET_TYPE.USER, user: data.userId
    });
    const walletBuy = results[3] || await createWallet({
      type: WALLET_TYPE.USER, user: data.buyId
    });
    const walletSell = results[4] || await createWallet({
      type: WALLET_TYPE.USER, user: data.sellId
    });
    const walletStore = results[5] || await createWallet({
      type: WALLET_TYPE.STORE, user: data.storeId
    });
    let veticUser = parseInt(data.total) * parseInt(data.special) * results[7].value / 100; // multiple number vetic ex: 10
    // Buyer receive vetic max 300%
    if (parseInt(veticUser) > (parseInt(data.total) * results[6].value / 100)) { // max vetic: ex: 300%
      veticUser = parseInt(data.total) * results[6].value / 100;
    }
    const veticBuy = parseInt(veticUser) * results[8].value / 100; // percent vetic ref buyer receive
    const veticSell = parseInt(veticUser) * results[9].value / 100; // percent vetic ref seller receive
    const veticStore = parseInt(data.vetic);
    const totalVetic = parseInt(veticUser) + parseInt(veticBuy) + parseInt(veticSell) + parseInt(veticStore);

    // preVetic
    const preVeticStore = parseInt(walletStore.vetic);
    const preVeticUser = parseInt(walletUser.vetic);
    const preVeticSell = parseInt(walletSell.vetic);
    const preVeticBuy = parseInt(walletBuy.vetic);

    if (data.typeOrder !== TYPE_ORDER_SIM_PRODUCT.SIM) {
      // Add vetic to user buy
      await Promise.all([
        walletUser.update({ $inc: { vetic: parseInt(veticUser), totalVetic: parseInt(veticUser) } }),
        walletTotal.update({ $inc: { vetic: -parseInt(veticUser) } }),
        transactionCreate({
          receivedId: walletUser?._id || '',
          senderId: walletTotal?._id || '',
          value: parseInt(veticUser),
          fee: 0,
          data: {
            orderId: data.orderId,
            invoice: data.invoice,
            type: PAYMENT_TYPE.TRANSFER_VETIC_BUY,
            userType: USER_TYPE.USER,
            currency: CURRENCY_TYPE.VETIC,
            preVetic: preVeticUser
          },
          timestamp: new Date().getTime(),
          status: STATUS_WITHDRAWL.APPROVE
        })
      ]);
      // Add vetic to user refer buy
      await Promise.all([
        walletBuy.update({ $inc: { vetic: parseInt(veticBuy), totalVetic: parseInt(veticBuy) } }),
        walletTotal.update({ $inc: { vetic: parseInt(-veticBuy) } }),
        transactionCreate({
          receivedId: walletBuy?._id || '',
          senderId: walletTotal?._id || '',
          value: parseInt(veticBuy),
          fee: 0,
          data: {
            orderId: data.orderId,
            invoice: data.invoice,
            type: PAYMENT_TYPE.TRANSFER_VETIC_REF_BUY,
            userType: USER_TYPE.BUY,
            currency: CURRENCY_TYPE.VETIC,
            preVetic: preVeticBuy
          },
          timestamp: new Date().getTime(),
          status: STATUS_WITHDRAWL.APPROVE
        })
      ]);
    }
    // Add vetic to user refer sell
    await Promise.all([
      walletSell.update({ $inc: { vetic: parseInt(veticSell), totalVetic: parseInt(veticSell) } }),
      walletTotal.update({ $inc: { vetic: parseInt(-veticSell) } }),
      transactionCreate({
        receivedId: walletSell?._id || '',
        senderId: walletTotal?._id || '',
        value: parseInt(veticSell),
        fee: 0,
        data: {
          orderId: data.orderId,
          invoice: data.invoice,
          type: PAYMENT_TYPE.TRANSFER_VETIC_REF_SELL,
          userType: USER_TYPE.SELL,
          currency: CURRENCY_TYPE.VETIC,
          preVetic: preVeticSell
        },
        timestamp: new Date().getTime(),
        status: STATUS_WITHDRAWL.APPROVE
      })
    ]);
    // Add money to user sell
    await Promise.all([
      walletStore.update({ $inc: { vetic: parseInt(veticStore), totalVetic: parseInt(veticStore) } }),
      walletTotal.update({ $inc: { vetic: parseInt(-veticStore) } }),
      transactionCreate({
        receivedId: walletStore?._id || '',
        senderId: walletTotal?._id || '',
        value: parseInt(veticStore),
        fee: 0,
        data: {
          orderId: data.orderId,
          invoice: data.invoice,
          type: PAYMENT_TYPE.TRANSFER_VETIC_SELL,
          userType: USER_TYPE.STORE,
          currency: CURRENCY_TYPE.VETIC,
          preVetic: preVeticStore
        },
        timestamp: new Date().getTime(),
        status: STATUS_WITHDRAWL.APPROVE
      }),
      transactionCreate({
        receivedId: walletStore?._id || '',
        senderId: walletTotal?._id || '',
        value: -parseInt(veticStore),
        fee: 0,
        data: {
          orderId: data.orderId,
          invoice: data.invoice,
          type: PAYMENT_TYPE.TRANSFER_VETIC_TOTAL,
          userType: USER_TYPE.STORE,
          currency: CURRENCY_TYPE.VND
        },
        timestamp: new Date().getTime(),
        status: STATUS_WITHDRAWL.APPROVE
      })
    ]);
    // Transfer VND from store Wallet to Archive wallet
    await Promise.all([
      walletStore.update({ $inc: { money: -parseInt(veticStore) } }),
      walletArchive.update({ $inc: { money: parseInt(veticStore) } }),
      transactionCreate({
        receivedId: walletArchive?._id || '',
        senderId: walletStore?._id || '',
        value: parseInt(veticStore),
        fee: 0,
        data: {
          orderId: data.orderId,
          invoice: data.invoice,
          type: PAYMENT_TYPE.TRANSFER_MONEY_ARCHIVE,
          currency: CURRENCY_TYPE.VND
        },
        timestamp: new Date().getTime(),
        status: STATUS_WITHDRAWL.APPROVE
      }),
      transactionCreate({
        receivedId: walletStore?._id || '',
        senderId: walletStore?._id || '',
        value: -parseInt(veticStore),
        fee: 0,
        data: {
          orderId: data.orderId,
          invoice: data.invoice,
          type: PAYMENT_TYPE.STOCK_VND,
          userType: USER_TYPE.STORE,
          currency: CURRENCY_TYPE.VND
        },
        timestamp: new Date().getTime(),
        status: STATUS_WITHDRAWL.APPROVE
      }),
      StaticReport.updateOne(
        { type: REPORT.VETIC },
        { $inc: { data: totalVetic } },
        { upsert: true }
      )
    ]);
    await updateStatusWalletArchive(false);
    const archive = await getWallet({ type: WALLET_TYPE.ARCHIVE });
    sendDataToQueue(Rabbitmq.getChannel(), QUEUE_NAME.SOCKET_EMIT_TO_USER, {
      id: null,
      data: archive,
      message: SOCKET_EMIT.ARCHIVE_CHANGE,
    });
    await updateIDFan(data, parseInt(veticUser), parseInt(veticStore), parseInt(veticBuy), parseInt(veticSell));
    return { success: 'success' };
  } catch (error) {
    return error500(error);
  }
}
export async function checkUpdateWallet() {
  const walletArchive = await getWallet({ type: WALLET_TYPE.ARCHIVE });
  await walletArchive.update({ $inc: { money: parseInt(5000000) } });
  await updateStatusWalletArchive(false);
}
/**
 * updateWallet
 * @param {object} options
 * */
export async function updateWalletPayment(options) {
  try {
    const wallet = await getWallet({
      user: options.user,
      type: parseInt(options.type)
    });
    if (wallet) {
      await wallet.update({
        $inc: { money: parseInt(options.value) }
      });
      return wallet;
    }
    return await createWallet({
      user: options.user,
      type: options.type,
      money: parseInt(options.value)
    });
  } catch (error) {
    return error500(error);
  }
}

/**
 * createWalletService
 * @param {object} options
 * */
export async function createWalletService(options) {
  try {
    return await createWallet(options);
  } catch (error) {
    return error500(error);
  }
}

/**
 * getWalletService
 * @param {object} options
 * */
export async function getWalletService(options) {
  try {
    const promise = await Promise.all([getWallet(options), getWallet({ type: WALLET_TYPE.ARCHIVE })]);
    if (!promise[0]) return null;
    const stock = (promise[0].vetic / 500000);
    return {
      _id: promise[0]._id,
      money: promise[0].money,
      pin: promise[0].pin,
      vetic: promise[0].vetic,
      tax: promise[0].tax,
      data: promise[0].data,
      matchingStock: stock,
      matchedStock: promise[0].stock,
      stockCompareSystem: (stock + promise[0].stock) / 50000000 * 100
    };
  } catch (error) {
    return error500(error);
  }
}

/**
 * createWalletGRPC
 * @param {object} options
 * */
export async function createWalletGRPC(options) {
  try {
    let wallet = await getWallet({
      user: options._id,
      type: WALLET_TYPE[options.type]
    });
    if (wallet) {
      return JSON.stringify(wallet);
    }
    wallet = await createWallet({
      user: options._id,
      type: WALLET_TYPE[options.type]
    });
    if (options.refer && options.type === 'USER') {
      await createIDFan({
        user: options._id,
        refer: options.refer
      });
    }
    return JSON.stringify(wallet);
  } catch (error) {
    console.log('createWalletGRPC error: ', error);
    return error500(error);
  }
}

/**
 * walletCreateGRPC
 * @param {object} options
 * */
export async function getWalletGRPC(options) {
  try {
    let wallet = await getWallet({ user: options._id, type: WALLET_TYPE[options.type] });
    if (wallet) {
      return {
        walletAddress: wallet.walletAddress,
        pin: wallet.pin,
        vetic: wallet.vetic,
        stock: wallet.stock,
        money: wallet.money,
        _id: wallet._id
      };
    }
    wallet = await createWallet({
      user: options._id,
      type: WALLET_TYPE[options.type]
    });
    return {
      walletAddress: wallet.walletAddress,
      pin: wallet.pin,
      vetic: wallet.vetic,
      stock: wallet.stock,
      money: wallet.money,
      _id: wallet._id
    };
  } catch (error) {
    return error500(error);
  }
}

/**
 * cloneWalletTemp
 * @description clone data off wallet user before Interest Vetic for user
 * */
export async function cloneWalletTemp() {
  try {
    const total = await Wallet.countDocuments({
      type: { $in: [WALLET_TYPE.USER, WALLET_TYPE.STORE] },
      vetic: { $ne: 0 }
    });
    const promies = [];
    const page = Math.ceil(total / 100);
    for (let i = 0; i < page; i++) {
      // eslint-disable-next-line no-await-in-loop
      const results = await Wallet.find({
        type: { $in: [WALLET_TYPE.USER, WALLET_TYPE.STORE] },
        vetic: { $ne: 0 }
      }).skip(i * 100).limit(100).select({
        walletAddress: 0,
        pin: 0,
        stock: 0,
        money: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
      })
        .lean();
      const promise1 = results.map(async (item) => {
        const dataTemp = await WalletTemp.create(item);
        return dataTemp;
      });
      promies.push(promise1);
    }
    await Promise.all(promies);
  } catch (error) {
    return error500(error);
  }
}

/**
 * walletInterest
 * */
export async function walletInterest() {
  try {
    const checkStatusWallet = await updateStatusWalletArchive(true);
    if (!checkStatusWallet) {
      return false;
    }
    const wallet = await Wallet.findOne({
      type: WALLET_TYPE.ARCHIVE
    });
    if (wallet?.data?.status === WALLET_ARCHIVE_STATUS.STATUS3) {
      return;
    }
    sendDataToQueue(Rabbitmq.getChannel(), QUEUE_NAME.SOCKET_EMIT_TO_USER, {
      id: null,
      data: {},
      message: SOCKET_EMIT.ARCHIVE_INTEREST,
    });
    await updateTimeFirework(new Date(new Date().toISOString()).getTime().toString(), new Date().getUTCHours(), new Date().getUTCMinutes() + 1);
    await cloneWalletTemp();
    await interestMoney(wallet?.data?.status);
  } catch (error) {
    console.log(error);
  }
}

export async function transferVeticToToken() {
  try {
    const wallet = await Wallet.findOne({
      type: WALLET_TYPE.ARCHIVE
    });
    if (wallet?.data?.status !== WALLET_ARCHIVE_STATUS.STATUS3) {
      return;
    }
    const archive = await walletArchiveHistory.find({}).sort({ _id: -1 }).limit(30).lean();
    if (archive.length < 30) return false;
    for (let i = 0; i < archive.length; i++) {
      if (archive[i].data.status !== WALLET_ARCHIVE_STATUS.STATUS3) {
        return false;
      }
    }
    const countDocs = await getTotalWalletsDAO({ type: { $nin: [WALLET_TYPE.ARCHIVE, WALLET_TYPE.TOTAL] } });
    const page = Math.ceil(countDocs / 100);
    const promise = [];
    // eslint-disable-next-line no-await-in-loop
    for (let i = 0; i < page; i++) {
      // eslint-disable-next-line no-await-in-loop
      const results = await Wallet.find({ type: { $nin: [WALLET_TYPE.ARCHIVE, WALLET_TYPE.TOTAL] } }).skip(i * 100).limit(100).select({
        walletAddress: 0,
        pin: 0,
        stock: 0,
        money: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
      })
        .lean();
      promise.push(WalletTemp.insertMany(results));
    }
    await Promise.all(promise);
    await Promise.all([
      wallet.update({
        'data.status': WALLET_ARCHIVE_STATUS.STATUS1,
        'data.date': 0,
        'data.cos': 0
      }),
      StaticReport.updateOne(
        { type: REPORT.VETIC },
        { data: 0 },
        { upsert: true }
      ),
      StaticReport.updateOne(
        { type: REPORT.REFRESH_SYSTEM },
        { $inc: { data: 1 } },
        { upsert: true }
      ),
      StaticReport.updateOne(
        { type: REPORT.SYSTEM_CLOSE_REFUND },
        { $inc: { data: 1 } },
        { upsert: true }
      )
    ]);
    await transferVeticTokenHandle(page, 100);
    return true;
  } catch (error) {
    console.log(error);
  }
}

export async function checkPinGreaterThanVetic() {
  try {
    const archive = await walletArchiveHistory.countDocuments({ 'data.status': WALLET_ARCHIVE_STATUS.STATUS3 });
    if (archive < 5) return false;
    const countDocs = await getTotalWalletsDAO({ type: { $nin: [WALLET_TYPE.ARCHIVE, WALLET_TYPE.TOTAL] } });
    const page = Math.ceil(countDocs / 100);
    const promise = [];
    // eslint-disable-next-line no-await-in-loop
    for (let i = 0; i < page; i++) {
      // eslint-disable-next-line no-await-in-loop
      const results = await Wallet.find({ type: { $nin: [WALLET_TYPE.ARCHIVE, WALLET_TYPE.TOTAL] } }).skip(i * 100).limit(100).select({
        walletAddress: 0,
        pin: 0,
        stock: 0,
        money: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
      })
        .lean();
      promise.push(WalletTemp.insertMany(results));
    }
    await Promise.all(promise);
    await checkPinGreaterThanVeticHandle(page, 100);
    return true;
  } catch (error) {
    console.log(error);
  }
}

export async function checkPinGreaterThanVeticHandle(page, limit) {
  try {
    const promise = [];
    // eslint-disable-next-line no-await-in-loop
    for (let i = 0; i < page; i++) {
      // eslint-disable-next-line no-await-in-loop
      const temp = await WalletTemp.find().skip(i * limit).limit(limit);
      temp.map((item) => {
        sendDataToQueue(Rabbitmq.getChannel(), QUEUE_NAME.CHECK_PIN_GT_VETIC, {
          _id: item._id,
          totalVetic: item.totalVetic,
          totalPin: item.totalVetic,
          type: item.type
        });
      });
    }
    await WalletTemp.deleteMany();
  } catch (error) {
    console.log(error);
  }
}

export async function transferVeticTokenHandle(page, limit) {
  try {
    const promise = [];
    // eslint-disable-next-line no-await-in-loop
    for (let i = 0; i < page; i++) {
      // eslint-disable-next-line no-await-in-loop
      const temp = await WalletTemp.find().skip(i * limit).limit(limit);
      temp.map((item) => {
        sendDataToQueue(Rabbitmq.getChannel(), QUEUE_NAME.TRANSFER_VETIC_TOKEN, {
          _id: item._id,
          vetic: item.vetic,
          type: item.type
        });
      });
    }
    await WalletTemp.deleteMany();
  } catch (error) {
    console.log(error);
  }
}

/**
 * walletInterest
 * */
export async function incomeTax() {
  try {
    const total = await Wallet.countDocuments({
      tax: { $gt: 0 },
      type: WALLET_TYPE.USER
    });
    const page = Math.ceil(total / 100);
    for (let i = 0; i < page; i++) {
      // eslint-disable-next-line no-await-in-loop
      const results = await Wallet.find({
        tax: { $gt: 0 },
        type: WALLET_TYPE.USER
      }).skip(i * 100).limit(100).lean();
      results.map((item) => {
        sendDataToQueue(Rabbitmq.getChannel(), QUEUE_NAME.INCOME_TAX, {
          _id: item._id
        });
      });
    }
  } catch (error) {
    console.log(error);
  }
}

/**
 * walletInterest
 * */
export async function resetIncomeTax() {
  try {
    const wallet = await Wallet.findOne({ type: WALLET_TYPE.ARCHIVE });
    wallet.tax = 0;
    await wallet.save();
  } catch (error) {
    console.log(error);
  }
}

/**
 * walletArchiveTrackingHour
 * */
export async function walletArchiveTrackingMinute() {
  try {
    const walletArchive = await Wallet.findOne({
      type: WALLET_TYPE.ARCHIVE
    });
    await ArchiveTracking.create({
      money: walletArchive.money
    });
  } catch (error) {
    console.log(error);
  }
}

/**
 * interrestMoney
 * @description clone data off wallet user before Interest Vetic for user
 * */
export async function interestMoney(status) {
  try {
    const walletArchive = await Wallet.findOne({
      type: WALLET_TYPE.ARCHIVE
    });
    const commission = status === WALLET_ARCHIVE_STATUS.STATUS1 ? 0.001 : 0.0005;
    if (!walletArchive || !walletArchive.money) return false;
    const total = await WalletTemp.countDocuments({});
    const page = Math.ceil(total / 100);
    for (let i = 0; i < page; i++) {
      // eslint-disable-next-line no-await-in-loop
      const results = await WalletTemp.find({}).skip(i * 100).limit(100).lean();
      results.map((item) => {
        sendDataToQueue(Rabbitmq.getChannel(), QUEUE_NAME.CREATE_INTEREST_MONEY, {
          _id: item._id,
          vetic: item.vetic,
          type: item.type,
          commission
        });
      });
    }
    await WalletTemp.remove({});
    return true;
  } catch (error) {
    return error500(error);
  }
}

export async function checkStatusWalletArchive(wallet, total) {
  try {
    const cos = Math.floor(wallet.money / (total * 0.001));
    const down7Day = await checkStatusWalletArchiveDown7Dates();
    const down30Day = await checkStatusWalletArchiveDown30Dates();
    const status = wallet?.data?.status || WALLET_ARCHIVE_STATUS.STATUS3;
    if (cos <= 5 || down30Day) {
      await Promise.all([wallet.update({ 'data.status': WALLET_ARCHIVE_STATUS.STATUS3 }),
      await StaticReport.update(
        { type: REPORT.SYSTEM_CLOSE_REFUND },
        { $inc: { data: 1 } },
        { upsert: true }
      )]);
      return WALLET_ARCHIVE_STATUS.STATUS3;
    }
    if (!down30Day && cos >= 10 && status === WALLET_ARCHIVE_STATUS.STATUS3) {
      await wallet.update({ 'data.status': WALLET_ARCHIVE_STATUS.STATUS1 });
      return WALLET_ARCHIVE_STATUS.STATUS1;
    }
    if (down7Day && cos > 5 && status === WALLET_ARCHIVE_STATUS.STATUS1) {
      await wallet.update({ 'data.status': WALLET_ARCHIVE_STATUS.STATUS2 });
      return WALLET_ARCHIVE_STATUS.STATUS2;
    }
    if (!down7Day && cos > 5 && status === WALLET_ARCHIVE_STATUS.STATUS2) {
      await wallet.update({ 'data.status': WALLET_ARCHIVE_STATUS.STATUS1 });
      return WALLET_ARCHIVE_STATUS.STATUS1;
    }
    return status;
  } catch (error) {
    return error500(error);
  }
}
export async function updateStatusWalletArchive(update = false) {
  try {
    const wallet = await Wallet.findOne({
      type: WALLET_TYPE.ARCHIVE
    });
    if (update) {
      const Vetic = await Wallet.aggregate([
        { $match: { $or: [{ type: 1 }, { type: 2 }, { type: 5 }] } },
        { $group: { _id: null, totalVetic: { $sum: '$vetic' }, count: { $sum: 1 } } }
      ]);
      // Total vetic of system
      const totalVeticSys = Vetic[0].totalVetic;
      const statusVAN = wallet?.data?.status === 1 ? 0.001 : (wallet.data.status === 2 ? 0.0005 : 0);
      await walletArchiveHistory.create({
        money: wallet.money,
        data: wallet.data,
        // Hệ số hoàn tiền hệ thống
        moneyResponse: Number(totalVeticSys) * statusVAN
      });
    }
    const totalVetic = await Wallet.aggregate([
      {
        $match: {
          type: { $in: [WALLET_TYPE.USER, WALLET_TYPE.STORE] },
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$vetic' }
        }
      }
    ]);
    const total = totalVetic ? totalVetic[0]?.total : 0;
    if (total === 0) {
      return false;
    }
    const cos = Math.floor(wallet.money / (total * 0.001));
    const promises = await Promise.all([
      getFirstWalletArchive(),
      checkStatusWalletArchiveDown7Dates(),
      checkStatusWalletArchiveDown30Dates()
    ]);
    const walletArchive = promises[0];
    const down7Day = promises[1];
    const down30Day = promises[2];
    const date = wallet?.data?.date || 1;
    if (cos <= 5) {
      if (update) {
        await wallet.updateOne({
          'data.status': WALLET_ARCHIVE_STATUS.STATUS3,
          'data.cos': cos,
          'data.date': wallet?.data?.status === WALLET_ARCHIVE_STATUS.STATUS3 ? date + 1 : date
        });
      } else {
        await wallet.updateOne({
          'data.status': WALLET_ARCHIVE_STATUS.STATUS3,
          'data.cos': cos
        });
      }
      return true;
    }

    if (cos > 10
      && walletArchive?.money < wallet.money) {
      await wallet.updateOne({
        'data.status': WALLET_ARCHIVE_STATUS.STATUS1,
        'data.cos': cos,
        'data.date': 0
      });
      return true;
    }
    if (down30Day) {
      if (update) {
        await wallet.updateOne({
          'data.status': WALLET_ARCHIVE_STATUS.STATUS3,
          'data.cos': cos,
          'data.date': wallet?.data?.status === WALLET_ARCHIVE_STATUS.STATUS3 ? date + 1 : date,
        });
      } else {
        await wallet.updateOne({
          'data.status': WALLET_ARCHIVE_STATUS.STATUS3,
          'data.cos': cos
        });
      }
      return true;
    }
    if (down7Day) {
      if (wallet?.data?.status === WALLET_ARCHIVE_STATUS.STATUS1) {
        await wallet.updateOne({
          'data.status': WALLET_ARCHIVE_STATUS.STATUS2,
          'data.cos': cos
        });
        return true;
      }
      await wallet.updateOne({
        'data.cos': cos
      });
      return true;
    }
    if (cos > 10) {
      await wallet.updateOne({
        'data.status': WALLET_ARCHIVE_STATUS.STATUS1,
        'data.cos': cos
      });
      return true;
    }
    await wallet.updateOne({
      'data.cos': cos
    });
    return true;
  } catch (error) {
    return error500(error);
  }
}
export async function checkStatusWalletArchiveDown7Dates() {
  try {
    const archive = await walletArchiveHistory.find({}).sort({ _id: -1 }).limit(8).lean();
    if (archive.length < 8) return false;
    for (let i = 1; i < archive.length; i++) {
      if (archive[i].money < archive[i - 1].money) {
        return false;
      }
    }
    return true;
  } catch (e) {
    return error500(e);
  }
}

export async function getFirstWalletArchive() {
  try {
    const wallets = await walletArchiveHistory.find({}).sort({ _id: -1 }).limit(1);
    return wallets[0];
  } catch (e) {
    return error500(e);
  }
}

export async function checkStatusWalletArchiveDown30Dates() {
  try {
    const archive = await walletArchiveHistory.find({}).sort({ _id: -1 }).limit(31).lean();
    if (archive.length < 31) return false;
    for (let i = 1; i < archive.length; i++) {
      if (archive[i].money < archive[i - 1].money) {
        return false;
      }
    }
    return true;
  } catch (e) {
    return error500(e);
  }
}

export async function getWalletArchiveHistory(options) {
  try {
    const results = await Promise.all([
      walletArchiveHistory.find({}).select({ updatedAt: 0, __v: 0 })
        .sort({ _id: -1 })
        .skip(options.skip)
        .limit(options.limit + 1)
        .lean(),
      walletArchiveHistory.countDocuments({})
    ]);
    const data = results[0];
    const count = results[1];
    for (let i = 0; i < data.length; i++) {
      if (data[i + 1]) {
        data[i].change = data[i].money - data[i + 1].money;
      } else {
        data[i].change = data[i].money;
      }
    }
    if (data.length > options.limit) {
      data.splice(-1, 1);
    }
    return [count, data];
  } catch (e) {
    return error500(e);
  }
}


export async function getWalletArchiveChart(query, skip) {
  try {
    if (skip) {
      return await ArchiveTracking.find({
        _id: {
          $gt: skip
        }
      }).sort({ _id: -1 }).limit(query.limit).skip(query.skip).select({ updatedAt: 0, __v: 0 })
        .lean();
    }
    return await ArchiveTracking.find({}).sort({ _id: -1 }).limit(query.limit).skip(query.skip).select({ updatedAt: 0, __v: 0 })
      .lean();
  } catch (e) {
    return error500(e);
  }
}

export async function getWalletArchiveChange(type) {
  try {
    const results = await Promise.all([
      walletArchiveHistory.find({})
        .sort({ _id: -1 })
        .skip(parseInt(type) - 1)
        .limit(1)
        .lean(),
      getWallet({ type: WALLET_TYPE.ARCHIVE }),
    ]);
    const data = results[0] && results[0].length ? results[0][0] : {};
    const archive = results[1];
    if (JSON.stringify(data) !== '{}' && archive) {
      if (data && archive) {
        return {
          change: archive.money ? (Math.abs(archive.money - data.money) / data.money * 100).toFixed(2)
            : (Math.abs(archive.money - data.money) * 100).toFixed(2),
          status: archive.money >= data.money ? 1 : -1
        };
      }
      if (JSON.stringify(data) === '{}' && archive) {
        return {
          change: (100).toFixed(2),
          status: 1
        };
      }
      return {
        change: '0',
        status: 1
      };
    }
  } catch (e) {
    return error500(e);
  }
}

export async function withdrawalPin(data, user) {
  try {
    if (data?.value < 100000) {
      return errorMessage(403, ERROR_CODE.MIN_VALUE_WITHDRAWAL);
    }
    if (data?.value % 10000 !== 0) {
      return errorMessage(400, ERROR_CODE.VALUE_IS_MULTIPLE_TEN_THOUGSAND);
    }
    if (data?.bankId) {
      const bankInfo = await getBankInfo(data.bankId);
      if (!bankInfo?._id) return errorMessage(403, ERROR_CODE.BANK_INFO_NOT_FOUND);
      data.bankCode = bankInfo.bankCode;
    }
    const wallets = await Promise.all([
      getWallet({
        user: user?.storeId || user._id,
        type: user?.storeId ? WALLET_TYPE.STORE : WALLET_TYPE.USER
      }),
      getWallet({
        type: WALLET_TYPE.TOTAL
      })
    ]);
    if (!wallets[0]) {
      return errorMessage(400, ERROR_CODE.WALLET_NOT_FOUND);
    }
    // TODO: Fee withdrawal pin
    let fee = 0;
    switch (parseInt(data.type)) {
      case WITHDRAWAL_TYPE.WITHDRAWAL_VND:
        fee = (await getSetting({ type: TYPE_SETTING.VND_FEE_WITHDRAWAL })).value / 100;
        if (!data?.bankId) {
          return errorMessage(422, ERROR_CODE.BANK_ID_REQUIRED);
        }
        if (wallets[0].money < 100000) {
          return errorMessage(403, ERROR_CODE.WALLET_MONEY_MIN_ONE_THOUGHSAND);
        }
        if (parseInt(data.value) + parseInt(data.value * fee) > wallets[0].money) {
          return errorMessage(403, ERROR_CODE.WALLET_NOT_ENOUGH_VND);
        }
        return await withdrawalVND(wallets, data, user, fee);

      case WITHDRAWAL_TYPE.WITHDRAWAL_PIN_TO_VND:
        fee = (await getSetting({ type: TYPE_SETTING.PIN_FEE_WITHDRAWL })).value / 100;
        if (wallets[0].pin < 100000) {
          return errorMessage(403, ERROR_CODE.WALLET_PIN_MIN_ONE_THOUGHSAND);
        }
        if (parseInt(data.value) + parseInt(data.value * fee) > wallets[0].pin) {
          return errorMessage(403, ERROR_CODE.WALLET_NOT_ENOUGH_PIN);
        }
        return await withdrawalPinToVND(wallets, data, user, fee);

      default:
        fee = (await getSetting({ type: TYPE_SETTING.PIN_FEE_WITHDRAWL })).value / 100;
        if (!data?.bankId) {
          return errorMessage(422, ERROR_CODE.BANK_ID_REQUIRED);
        }
        if (wallets[0].pin < 100000) {
          return errorMessage(403, ERROR_CODE.WALLET_PIN_MIN_ONE_THOUGHSAND);
        }
        if (parseInt(data.value) + parseInt(data.value * fee) > wallets[0].pin) {
          return errorMessage(403, ERROR_CODE.WALLET_NOT_ENOUGH_PIN);
        }
        return await withdrawalPinToBank(wallets, data, user, fee);
    }
  } catch (e) {
    return error500(e);
  }
}
export async function withdrawalPinToBank(wallets, data, user, fee) {
  try {
    const promies = await Promise.all([
      wallets[0].update({
        $inc: { pin: -(parseInt(data.value) + (parseInt(data.value) * fee)) }
      }),
      transactionCreate({
        receivedId: wallets[0]?._id || '',
        senderId: wallets[1]?._id || '',
        value: -parseInt(data.value),
        fee: parseInt(data.value * fee),
        total: -(parseInt(parseInt(data.value) + parseInt(data.value * fee))),
        data: {
          type: PAYMENT_TYPE.WITHDRAWAL_PIN,
          userType: user?.storeId ? WALLET_TYPE.STORE : WALLET_TYPE.USER,
          currency: CURRENCY_TYPE.PIN,
          bankId: data.bankId,
          bankCode: data.bankCode
        },
        timestamp: new Date().getTime(),
        status: STATUS_WITHDRAWL.PENDING
      })
    ]);
    return promies[1];
  } catch (e) {
    return error500(e);
  }
}

export async function withdrawalPinToVND(wallets, data, user, fee) {
  try {
    const promies = await Promise.all([
      wallets[0].update({
        $inc: {
          pin: -(parseInt(data.value) + (parseInt(data.value) * fee)),
          money: parseInt(data.value)
        },
      }),
      transactionCreate({
        receivedId: wallets[0]?._id || '',
        senderId: wallets[1]?._id || '',
        value: parseInt(data.value),
        fee: parseInt(data.value * fee),
        total: parseInt(parseInt(data.value) + parseInt(data.value * fee)),
        data: {
          type: PAYMENT_TYPE.TRANSFER_PIN_RECEIVED_VND,
          userType: user?.storeId ? WALLET_TYPE.STORE : WALLET_TYPE.USER,
          currency: CURRENCY_TYPE.VND,
        },
        timestamp: new Date().getTime(),
        status: STATUS_WITHDRAWL.APPROVE
      }),
      transactionCreate({
        receivedId: wallets[0]?._id || '',
        senderId: wallets[1]?._id || '',
        value: -parseInt(data.value),
        fee: parseInt(data.value * fee),
        total: -parseInt(parseInt(data.value) + parseInt(data.value * fee)),
        data: {
          type: PAYMENT_TYPE.TRANSFER_PIN,
          userType: user?.storeId ? WALLET_TYPE.STORE : WALLET_TYPE.USER,
          currency: CURRENCY_TYPE.PIN,
        },
        timestamp: new Date().getTime(),
        status: STATUS_WITHDRAWL.APPROVE
      })
    ]);
    return promies[1];
  } catch (e) {
    return error500(e);
  }
}

export async function withdrawalVND(wallets, data, user, fee) {
  try {
    const promies = await Promise.all([
      wallets[0].update({
        $inc: { money: -(parseInt(data.value) + (parseInt(data.value) * fee)) }
      }),
      transactionCreate({
        receivedId: wallets[0]?._id || '',
        senderId: wallets[1]?._id || '',
        value: -parseInt(data.value),
        fee: -parseInt(data.value * fee),
        total: -(parseInt(parseInt(data.value) + parseInt(data.value * fee))),
        data: {
          type: PAYMENT_TYPE.WITHDRAWAL_VND,
          userType: user?.storeId ? WALLET_TYPE.STORE : WALLET_TYPE.USER,
          currency: CURRENCY_TYPE.VND,
          bankId: data.bankId,
          bankCode: data.bankCode
        },
        timestamp: new Date().getTime(),
        status: STATUS_WITHDRAWL.PENDING
      })
    ]);
    return promies[1];
  } catch (e) {
    return error500(e);
  }
}
export async function interestMoneyWallet(item) {
  try {
    const promies = await Promise.all([
      Wallet.findOne({
        type: WALLET_TYPE.ARCHIVE
      }),
      Wallet.findById(item._id)
    ]);
    const walletArchive = promies[0];
    const wallet = promies[1];
    let tax = 0;
    if (wallet.type === 1) {
      tax = parseInt(item.vetic * item.commission) >= TAX_VALUE
        ? parseInt(item.vetic * item.commission) * 0.1 : 0;
    }
    const preTax = promies[1].tax;
    const preVetic = promies[1].vetic;
    await Promise.all([
      Wallet.updateOne({
        _id: item._id,
      }, {
        $inc: {
          pin: parseInt(item.vetic * item.commission) - tax,
          vetic: -parseInt(item.vetic * item.commission),
          tax: tax,
          veticTransferPin: parseInt(item.vetic * item.commission)
        },
      }),
      walletArchive.update({
        $inc: {
          money: -parseInt(item.vetic * item.commission),
          tax: tax
        }
      }),
      transactionCreate({
        receivedId: item?._id || '',
        senderId: walletArchive?._id || '',
        value: -parseInt(item.vetic * item.commission),
        total: -parseInt(item.vetic * item.commission),
        tax: tax,
        fee: 0,
        data: {
          type: PAYMENT_TYPE.TRANSFER_VETIC_FROM_PIN_RETURN,
          userType: item.type,
          commission: item.commission,
          currency: CURRENCY_TYPE.VETIC,
          preVetic: preVetic
        },
        timestamp: new Date().getTime(),
        status: STATUS_WITHDRAWL.APPROVE
      }),
      transactionCreate({
        receivedId: item?._id || '',
        senderId: walletArchive?._id || '',
        value: parseInt(item.vetic * item.commission) - tax,
        total: parseInt(item.vetic * item.commission),
        tax: tax,
        fee: 0,
        data: {
          type: PAYMENT_TYPE.TRANSFER_INTEREST_PIN,
          userType: item.type,
          commission: item.commission,
          currency: CURRENCY_TYPE.PIN,
          preTax
        },
        timestamp: new Date().getTime(),
        status: STATUS_WITHDRAWL.APPROVE
      }),
      StaticReport.updateOne(
        { type: REPORT.PIN },
        { $inc: { data: parseInt(item.vetic * item.commission) - tax } },
        { upsert: true }
      ),
      StaticReport.updateOne(
        { type: REPORT.VETIC },
        { $inc: { data: -parseInt(item.vetic * item.commission) } },
        { upsert: true }
      )
    ]);
    const archive = await Wallet.findOne({
      type: WALLET_TYPE.ARCHIVE
    });
    sendDataToQueue(Rabbitmq.getChannel(), QUEUE_NAME.SOCKET_EMIT_TO_USER, {
      id: null,
      data: archive,
      message: SOCKET_EMIT.ARCHIVE_CHANGE,
    });
  } catch (error) {
    console.error(error);
  }
}

export async function incomeTaxWallet(item) {
  try {
    const promies = await Promise.all([
      Wallet.findOne({
        type: WALLET_TYPE.ARCHIVE
      }),
      Wallet.findById(item._id)
    ]);
    const walletArchive = promies[0];
    const wallet = promies[1];
    await Promise.all([
      Wallet.updateOne({
        _id: item._id
      }, {
        tax: 0
      }),
      transactionCreate({
        receivedId: item?._id || '',
        senderId: walletArchive?._id || '',
        value: wallet.tax,
        total: wallet.tax,
        fee: 0,
        data: {
          type: PAYMENT_TYPE.INCOME_TAX,
          currency: CURRENCY_TYPE.PIN
        },
        timestamp: new Date().getTime(),
        status: STATUS_WITHDRAWL.APPROVE
      }),
    ]);
  } catch (error) {
    console.error(error);
  }
}

export const interestMoneyRabbit = async (channel) => {
  const q = await declareQueue(QUEUE_NAME.CREATE_INTEREST_MONEY, channel, false);
  try {
    channel.consume(q, async (msg) => {
      try {
        const data = JSON.parse(msg.content.toString());
        await interestMoneyWallet(data);
        return channel.ack(msg);
      } catch (e) {
        console.error(e);
        channel.ack(msg);
      }
    }, {
      noAck: false
    });
  } catch (error) {
    console.error(error);
  }
};

export const incomeTaxRabbit = async (channel) => {
  const q = await declareQueue(QUEUE_NAME.INCOME_TAX, channel, false);
  try {
    channel.consume(q, async (msg) => {
      try {
        const data = JSON.parse(msg.content.toString());
        await incomeTaxWallet(data);
        return channel.ack(msg);
      } catch (e) {
        console.error(e);
        channel.ack(msg);
      }
    }, {
      noAck: false
    });
  } catch (error) {
    console.error(error);
  }
};

export const checkPinGreaterThanVeticRabbit = async (channel) => {
  const q = await declareQueue(QUEUE_NAME.CHECK_PIN_GT_VETIC, channel, false);
  try {
    channel.consume(q, async (msg) => {
      try {
        const data = JSON.parse(msg.content.toString());
        await checkPinGtVetic(data);
        return channel.ack(msg);
      } catch (e) {
        console.error(e);
        channel.ack(msg);
      }
    }, {
      noAck: false
    });
  } catch (error) {
    console.error(error);
  }
};

export async function checkPinGtVetic(data) {
  try {
    const wallet = await getWalletDAO({ _id: data._id });
    if (wallet.totalPin > (wallet.totalVetic * 40 / 100)) {
      wallet.vetic = 0;
      wallet.totalVetic = 0;
      await Promise.all([
        transactionCreate({
          receivedId: wallet?._id || '',
          senderId: wallet?._id || '',
          value: -parseInt(wallet.totalVetic),
          fee: 0,
          data: {
            type: PAYMENT_TYPE.PIN_GREATER_THAN_VETIC,
            currency: CURRENCY_TYPE.VETIC
          },
          timestamp: new Date().getTime(),
          status: STATUS_WITHDRAWL.APPROVE
        })
      ]);
      await wallet.save();
    }
  } catch (error) {
    console.log(error);
  }
}

export const transferVeticToTokenRabbit = async (channel) => {
  const q = await declareQueue(QUEUE_NAME.TRANSFER_VETIC_TOKEN, channel, false);
  try {
    channel.consume(q, async (msg) => {
      try {
        const data = JSON.parse(msg.content.toString());
        await transferVetic(data);
        return channel.ack(msg);
      } catch (e) {
        console.error(e);
        channel.ack(msg);
      }
    }, {
      noAck: false
    });
  } catch (error) {
    console.error(error);
  }
};

export async function transferVetic(data) {
  try {
    const wallet = await getWalletDAO({ _id: data._id });
    if (data.vetic >= 500000) {
      const stock = Math.trunc(data.vetic / 500000);
      wallet.stock += stock;
      wallet.veticTransferStock += data.vetic;
      await Promise.all([
        transactionCreate({
          receivedId: wallet?._id || '',
          senderId: wallet?._id || '',
          value: parseInt(wallet.stock),
          fee: 0,
          data: {
            type: PAYMENT_TYPE.TRANSFER_VETIC_TO_STOCK,
            currency: CURRENCY_TYPE.STOCK,
            currentVetic: data.vetic
          },
          timestamp: new Date().getTime(),
          status: STATUS_WITHDRAWL.APPROVE
        }),
        StaticReport.updateOne(
          { type: REPORT.TOKEN },
          { $inc: { data: wallet.stock } },
          { upsert: true }
        )
      ]);
    }
    wallet.vetic = 0;
    wallet.totalVetic = 0;
    wallet.totalPin = 0;
    wallet.veticTransferPin = 0;
    await wallet.save();
  } catch (error) {
    console.log(error);
  }
}

export async function calculatorToken(vetic) {
  try {
    return Math.ceil(parseInt(vetic) / 500000);
  } catch (error) {
    return error500(error);
  }
}

export async function analyticToken(user) {
  try {
    const wallet = await getWalletDAO({ user: user?.storeId ? user.storeId : user._id });
    const matchingToken = ((parseInt(wallet.vetic) / 500000) / ((parseInt(wallet.vetic) / 500000) + parseInt(wallet.stock))) * 100;
    const matchedToken = parseInt(wallet.stock) / ((parseInt(wallet.vetic) / 500000) + parseInt(wallet.stock)) * 100;
    return {
      matchingToken,
      matchedToken
    };
  } catch (error) {
    return error500(error);
  }
}

export async function analyticStock() {
  try {
    const promise = await Promise.all([getTotalStockDAO({ type: { $in: [WALLET_TYPE.STORE, WALLET_TYPE.USER] } }), getTotalVeticDAO({ type: { $in: [WALLET_TYPE.SIM, WALLET_TYPE.STORE, WALLET_TYPE.USER] } }), getSetting({ type: TYPE_SETTING.MAXIMUM_TOKEN_SYSTEM })]);
    return {
      matchingStock: (promise[0][0].totalStock + (promise[1][0].totalVetic / 500000)) / promise[2].value * 100,
      matchedStock: 100 - ((promise[0][0].totalStock + (promise[1][0].totalVetic / 500000)) / promise[2].value * 100),
      matchingStockPoint: promise[1][0].totalVetic / 500000,
      matchedStockPoint: promise[0][0].totalStock,
      totalToken: promise[0][0].totalStock + (promise[1][0].totalVetic / 500000),
      totalStock: promise[2].value
    };
  } catch (error) {
    return error500(error);
  }
}

export async function getWalletSimDetail(sim, query) {
  try {
    const checked = await redisGet(REDIS_SIM.WALLET.concat(query.sim));
    if (checked.toString() !== query.otpCode.toString()) return errorMessage(404, ERROR_CODE.CODE_NOT_FOUND);
    const walletSim = await getWalletDAO({ 'data.sim': sim });
    if (!walletSim) return errorMessage(404, ERROR_CODE.WALLET_NOT_FOUND);
    return walletSim;
  } catch (error) {
    return error500(error);
  }
}

export async function getOtpSim(sim) {
  try {
    const otpCode = generateRandom6Digits();
    await Promise.all([
      redisSet(REDIS_SIM.WALLET.concat(sim), otpCode),
      redisExpire(REDIS_SIM.WALLET.concat(sim), EXPIRE_SIM_OTP),
    ]);
    return otpCode;
  } catch (error) {
    return error500(error);
  }
}

export async function getAllWallet(query) {
  try {
    const sort = getSort(query);
    const promise = await Promise.all([getTotalWalletDAO(), getAllWalletDAO({}, query, sort)]);
    if (promise[0]) {
      const data = promise[1].map(async (item) => {
        item = item.toObject();
        let user;
        if (item.type === WALLET_TYPE.USER) {
          user = await getUserInfo(item.user);
        } else if (item.type === WALLET_TYPE.STORE) {
          user = await getStoreInfo(item.user);
        } else {
          user = item.user;
        }
        item.user = user;
        return item;
      });
      const result = await Promise.all(data);
      return [promise[0], result];
    }
    return [promise[0], promise[1]];
  } catch (error) {
    return error500(error);
  }
}

export async function getRanking(query) {
  try {
    const sort = getSort(query);
    const data = await Promise.all([getTotalWalletsDAO({ type: { $nin: [WALLET_TYPE.TOTAL, WALLET_TYPE.ARCHIVE] } }), getRankingDAO({ type: { $nin: [WALLET_TYPE.TOTAL, WALLET_TYPE.ARCHIVE] } }, query, sort)]);
    if (data[0]) {
      const result = data[1].map(async (item) => {
        switch (item.type) {
          case WALLET_TYPE.USER:
            item.user = await getUserInfo(item.user);
            if (item?.user?.avatar) {
              item.user.avatar = GetFileData(SHARE_HOST, JSON.parse(item.user.avatar));
            }
            break;
          case WALLET_TYPE.STORE:
            item.user = await getStoreInfo(item.user);
            if (item?.user?.avatar) {
              item.user.avatar = GetFileData(SHARE_HOST, JSON.parse(item.user.avatar));
            }
            break;
          case WALLET_TYPE.SIM:
            item.user = await getSimInfo(item.user);
            if (item?.user?.avatar) {
              item.user.avatar = GetFileData(SHARE_HOST, JSON.parse(item.user.avatar));
            }
            break;
          default:
            break;
        }
        return item;
      });
      let promise = await Promise.all(result);
      promise = promise.map((item) => {
        item.ranking /= 500000;
        return item;
      });
      return [data[0], promise];
    }
    return [data[0], data[1]];
  } catch (error) {
    return error500(error);
  }
}

export async function getRank(query) {
  try {
    const sort = { totalVetic: -1 };
    const cond = {};
    if (query?.userType) {
      cond.type = parseInt(query.userType);
    }
    const payload = await getAllWalletDAO(cond, query, sort);
    const promise = payload.map(async (item) => {
      item = item.toObject();
      if (item?.type === USER_TYPE.USER) {
        item.user = await getUserInfo(item.user);
      }
      if (item?.type === USER_TYPE.STORE) {
        item.user = await getStoreInfo(item.user);
      }
      item.user.avatar = GetFileData(SHARE_HOST, JSON.parse(item.user.avatar));
      return item;
    });
    return await Promise.all(promise);
  } catch (error) {
    return error500(error);
  }
}

export async function getVeticStatistic(user) {
  try {
    const cond = {};
    if (user.storeId) {
      cond.user = user.storeId;
      cond.type = WALLET_TYPE.STORE;
    } else {
      cond.user = user._id;
      cond.type = WALLET_TYPE.USER;
    }
    const totalVetic = await getWalletDAO(cond);
    return totalVetic;
  } catch (error) {
    return error500(error);
  }
}

export async function getRefresh() {
  try {
    const payload = await ReportModel.findOne({ type: REPORT.REFRESH_SYSTEM });
    return payload;
  } catch (error) {
    return error500(error);
  }
}
