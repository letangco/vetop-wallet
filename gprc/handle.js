import { getSetting } from '../server/components/admin/settings-general/settings-general.dao';
import * as WalletService from '../server/components/wallet/wallet.service';
import { createTransaction, findOneTransactionByCond, getTransactions } from '../server/components/transaction/transaction.dao';
import { getWalletDAO, createWalletDAO } from '../server/components/wallet/wallet.dao';
import { PAYMENT_TYPE, USER_TYPE, WALLET_TYPE } from '../external/constants/constants';
import { getTransaction, transactionCreate } from '../server/components/transaction/transaction.service';
import { paymentPaymeCreate, paymentVNPayGetUrlOrder } from '../server/components/payment/payment.service';
import IDFan from '../server/components/IDFan/IDFan.model';
import { BODY_FCM, NOTIFICATION_TYPE, QUEUE_NAME, TITLE_FCM } from '../external/constants/job_name';
import { Rabbitmq } from '../server/server';
import { sendDataToQueue } from '../internal/rabbitmq/publisher/publisher';
import { formatToCurrency } from '../server/helpers/string.helper';

export async function updateVeticFromOrder(call) {
  try {
    const request = call.request;
    return await WalletService.updateVeticFromOrder(JSON.parse(request.order));
  } catch (err) {
    return false;
  }
}

export async function createWallet(call) {
  try {
    const request = call.request;
    return await WalletService.createWalletGRPC(request);
  } catch (err) {
    return false;
  }
}

export async function getWallet(call) {
  try {
    const request = call.request;
    const wallet = await WalletService.getWalletGRPC(request);
    return {
      wallet: JSON.stringify(wallet)
    }
  } catch (err) {
    return false;
  }
}

export async function getSettingHandle(call) {
  try {
    const request = call.request;
    const result = await getSetting({ type: request.type });
    return {
      value: result.value
    };
  } catch (error) {
    return false;
  }
}

export async function createTransactionHandle(call) {
  try {
    const request = call.request;
    const wallet = await getWalletDAO({ user: request.senderId, type: request.userType === USER_TYPE.STORE ? WALLET_TYPE.STORE : WALLET_TYPE.USER });
    const preVetic = wallet.vetic;
    await wallet.update({ $inc: { vetic: -parseInt(request.value) } });
    await createTransaction({
      receivedId: '',
      senderId: request.senderId,
      value: parseInt(request.value),
      fee: 0,
      data: {
        simId: request.simId,
        userType: request.userType,
        currency: request.currency,
        type: request.type,
        preVetic
      }
    });
    return {
      success: true
    };
  } catch (error) {
    return false;
  }
}

export async function createWalletSimHandle(call) {
  try {
    const request = call.request;
    const wallet = await getWalletDAO({
      user: request._id,
      type: WALLET_TYPE[request.type],
      'data.sim': request.sim
    });
    if (wallet?._id) {
      return {
        success: true
      };
    }
    await createWalletDAO({
      user: request._id,
      type: WALLET_TYPE[request.type],
      vetic: request.vetic,
      data: {
        simId: request.sim
      }
    });
    return {
      success: true
    };
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function getWalletSimHandle(call) {
  try {
    const request = call.request;
    const wallet = await getWalletDAO({ 'data.simId': request.sim });
    if (!wallet) {
      return false;
    }
    return {
      _id: wallet._id,
      pin: wallet.pin,
      vetic: wallet.vetic,
      stock: wallet.stock,
      tax: wallet.tax,
      money: wallet.money,
      data: JSON.stringify(wallet.data)
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function updateWalletFromSimHandle(call) {
  try {
    const request = call.request;
    const promise = await Promise.all([getWalletDAO({ user: request._id, type: WALLET_TYPE[request.type] }), getWalletDAO({ 'data.sim': request.sim })]);
    promise[0].pin += parseInt(request.pin);
    promise[0].tax += parseInt(request.tax);
    promise[0].stock += parseInt(request.stock);
    promise[0].vetic += parseInt(request.vetic);
    promise[0].money += parseInt(request.money);
    await Promise.all([promise[0].save(), promise[1].remove()]);
    return {
      success: true
    };
  } catch (error) {
    return false;
  }
}

export async function updateVeticFromOrderSimHandle(call) {
  try {
    const request = call.request;
    const walletSim = await getWalletDAO({ 'data.sim': request.sim });
    walletSim.vetic = request.vetic;
    await walletSim.save();
    return {
      success: true
    };
  } catch (error) {
    return false;
  }
}

export async function createTransactionTopUpHandle(call) {
  try {
    const request = call.request;
    const wallet = await Promise.all([getWalletDAO({ user: request.receiverId, type: WALLET_TYPE.STORE }), getWalletDAO({ type: WALLET_TYPE.TOTAL })]);
    if (!wallet) return false;
    // fix khong tru vi khi admin duyet order
    // await wallet[0].update({
    //   $inc: { money: parseInt(request.value) }
    // });
    // ----------
    await transactionCreate({
      receivedId: wallet[0]._id || '',
      senderId: wallet[1]._id || '',
      value: request?.value || 0,
      fee: 0,
      data: {
        type: request.type,
        currency: request.currency
      },
      timestamps: new Date().getTime(),
      status: 1,
    });
    return {
      success: true
    };
  } catch (error) {
    return false;
  }
}

export async function paymentPaymeCreateHandle(call) {
  try {
    const request = call.request;
    const payload = await paymentPaymeCreate(request.user, request.amount, request.code);
    return {
      link: payload
    }
  } catch (error) {
    return false;
  }
}

export async function getTransactionChangeCodeHandle(call) {
  try {
    const request = call.request;
    const payload = await findOneTransactionByCond({ 'data.user': request.userId });
    return {
      _id: payload._id,
      transactionPayme: payload.data.transactionIdPayme,
      code: payload.data.code,
      value: payload.value,
      status: payload.status
    };
  } catch (error) {
    return false;
  }
}

export async function getIdFANAdmin(call) {
  try {
    const request = call.request;
    const userRefer = request._id;
    const payload = await Promise.all([
      IDFan.find({ refer: userRefer }).sort({ createdAt: -1 }).select({ __v: 0 }),
      IDFan.countDocuments({ refer: userRefer })
    ]);
    let totalVetic = 0;
    let totalCommission = 0;
    const response = payload[0].map((item) => {
      totalVetic += item.total;
      totalCommission += item.commission;
      return {
        _id: item._id,
        total: item.total,
        commission: item.commission,
        user: item.user,
        refer: item.refer,
        createdAt: item.createdAt
      };
    });
    return {
      idfans: response,
      totalIdFan: payload[1],
      totalVetic: totalVetic,
      totalCommission: totalCommission,
    };
  } catch (error) {
    return false;
  }
}

export async function notificationCreatePendingOrder(call) {
  try {
    console.log(call);
    const request = call.request;
    const options = {
      type: NOTIFICATION_TYPE.CREATE_OVER_ORDER,
      to: request.userId,
      targetId: request._id
    };
    options.title = `${TITLE_FCM.TRANSFER}`;
    options.body = `${BODY_FCM.TRANSFER_VETIC_REF_SELL}${formatToCurrency(parseInt(request.total))}${BODY_FCM.VTD}${BODY_FCM.ADMIN_TOPUP_USER}`;
    console.log('fr: ', options);
    sendDataToQueue(Rabbitmq.getChannel(), QUEUE_NAME.CREATE_NOTIFICATION, options);
    return {
      success: true
    };
  } catch (error) {
    return false;
  }
}

export async function createPaymentVNPayOrder(call) {
  try {
    const request = call.request;
    const urlGeneralPayment = await paymentVNPayGetUrlOrder(request);
    return {
      url: urlGeneralPayment
    };
  } catch (error) {
    return false;
  }
}
