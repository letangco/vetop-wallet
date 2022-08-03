import * as WalletServices from './wallet.service';
import { WALLET_TYPE } from '../../../external/constants/constants';
import { commonGetQuery } from '../../../external/middleware/query';
import { QUEUE_NAME, SOCKET_EMIT } from '../../../external/constants/job_name';
import { sendDataToQueue } from '../../../internal/rabbitmq/publisher/publisher';
import { Rabbitmq } from '../../server';
export async function createWallet(req, res) {
  try {
    const body = req.body;
    body.user = req.user;
    return res.RH.success(await WalletServices.createWalletService(body));
  } catch (error) {
    return res.RH.error(error);
  }
}

export async function getWallet(req, res) {
  try {
    const user = req.user;
    const wallet = await WalletServices.getWalletService({
      user: user?.storeId || user._id,
      type: user?.storeId ? WALLET_TYPE.STORE : WALLET_TYPE.USER
    });
    if (wallet) {
      return res.RH.success(wallet);
    }
    return res.RH.success(await WalletServices.createWalletService({
      user: user?.storeId || user._id,
      type: user?.storeId ? WALLET_TYPE.STORE : WALLET_TYPE.USER
    }));
  } catch (error) {
    return res.RH.error(error);
  }
}
export async function getWalletArchive(req, res) {
  try {
    return res.RH.success(await WalletServices.getWalletService({ type: WALLET_TYPE.ARCHIVE }));
  } catch (error) {
    return res.RH.error(error);
  }
}
export async function checkUpdateWallet(req, res) {
  try {
    await WalletServices.checkUpdateWallet();
    return res.json({success: true})
  } catch (error) {
    return res.RH.error(error);
  }
}

export async function getWalletArchiveHistory(req, res) {
  try {
    const query = commonGetQuery(req);
    const payload = await WalletServices.getWalletArchiveHistory(query);
    return res.RH.paging(payload, query.page, query.limit);
  } catch (error) {
    return res.RH.error(error);
  }
}
export async function getWalletArchiveChart(req, res) {
  try {
    const query = commonGetQuery(req);
    const payload = await WalletServices.getWalletArchiveChart(query, req?.query?.last_id || '');
    return res.RH.success(payload);
  } catch (error) {
    return res.RH.error(error);
  }
}
export async function getWalletArchiveChange(req, res) {
  try {
    const { type } = req.query || 1;
    return res.RH.success(await WalletServices.getWalletArchiveChange(type));
  } catch (error) {
    return res.RH.error(error);
  }
}

export async function getWalletTotal(req, res) {
  try {
    await WalletServices.walletInterest();
    return res.RH.success(await WalletServices.getWalletService({ type: WALLET_TYPE.TOTAL }));
  } catch (error) {
    return res.RH.error(error);
  }
}

export async function withdrawal(req, res) {
  try {
    return res.RH.success(await WalletServices.withdrawalPin(req.body, req.user));
  } catch (error) {
    return res.RH.error(error);
  }
}

export async function calculatorToken(req, res) {
  try {
    const { vetic } = req.query;
    const payload = await WalletServices.calculatorToken(vetic);
    return res.RH.success(payload);
  } catch (error) {
    return res.RH.error(error);
  }
}

export async function analyticToken(req, res) {
  try {
    const { user } = req;
    const payload = await WalletServices.analyticToken(user);
    return res.RH.success(payload);
  } catch (error) {
    return res.RH.error(error);
  }
}

export async function analyticStock(req, res) {
  try {
    const payload = await WalletServices.analyticStock();
    return res.RH.success(payload);
  } catch (error) {
    return res.RH.error(error);
  }
}

export async function getWalletSimDetail(req, res) {
  try {
    const { sim } = req.params;
    const query = commonGetQuery(req);
    const payload = await WalletServices.getWalletSimDetail(sim, query);
    return res.RH.success(payload);
  } catch (error) {
    return res.RH.error(error);
  }
}

export async function getOtpSim(req, res) {
  try {
    const { sim } = req.params;
    const payload = await WalletServices.getOtpSim(sim);
    return res.RH.success(payload);
  } catch (error) {
    return res.RH.error(error);
  }
}

export async function getAllWallet(req, res) {
  try {
    const query = commonGetQuery(req);
    const payload = await WalletServices.getAllWallet(query);
    return res.RH.paging(payload, query.page, query.limit);
  } catch (error) {
    return res.RH.error(error);
  }
}

export async function getRanking(req, res) {
  try {
    const query = commonGetQuery(req);
    const payload = await WalletServices.getRanking(query);
    return res.RH.paging(payload, query.page, query.limit);
  } catch (error) {
    return res.RH.error(error);
  }
}

export async function getRank(req, res) {
  try {
    const query = commonGetQuery(req);
    const payload = await WalletServices.getRank(query);
    return res.RH.success(payload);
  } catch (error) {
    return res.RH.error(error);
  }
}

export async function getVeticStatistic(req, res) {
  try {
    const { user } = req;
    const payload = await WalletServices.getVeticStatistic(user);
    return res.RH.success(payload);
  } catch (error) {
    return res.RH.error(error);
  }
}

export async function getRefresh(req, res) {
  try {
    const payload = await WalletServices.getRefresh();
    return res.RH.success(payload);
  } catch (error) {
    return res.RH.error(error);
  }
}
