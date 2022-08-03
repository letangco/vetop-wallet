import * as TransactionServices from './transaction.service';
import * as WalletDao from '../wallet/wallet.dao';
import { commonGetQuery, getSort } from '../../../external/middleware/query';
import { WALLET_TYPE } from '../../../external/constants/constants';

export async function getTransactions(req, res) {
  try {
    const query = commonGetQuery(req);
    let { user } = req;
    let wallet = await WalletDao.getWallet({
      user: user?.storeId || user?._id,
      type: user?.storeId ? WALLET_TYPE.STORE : WALLET_TYPE.USER
    });
    query.wallet = wallet?._id || '';
    const payload = await TransactionServices.getTransactions(query, getSort(query));
    return res.RH.paging(payload, query.page, query.limit);
  } catch (error) {
    return res.RH.error(error);
  }
}

export async function getStockTransaction(req, res) {
  try {
    const query = commonGetQuery(req);
    let { user } = req;
    let wallet = await WalletDao.getWallet({
      user: user?.storeId || user?._id,
      type: user?.storeId ? WALLET_TYPE.STORE : WALLET_TYPE.USER
    });
    query.wallet = wallet?._id || ''
    const payload = await TransactionServices.getStockTransaction(query, getSort(query));
    return res.RH.paging(payload, query.page, query.limit);
  } catch (error) {
    return res.RH.error(error);
  }
}

export async function getIncomeTax(req, res) {
  try {
    const query = commonGetQuery(req);
    const { user } = req;
    const wallet = await WalletDao.getWallet({
      user: user?.storeId || user?._id
    });
    query.wallet = wallet?._id || '';
    const payload = await TransactionServices.getIncomeTax(query, getSort(query));
    return res.RH.paging(payload, query.page, query.limit);
  } catch (error) {
    return res.RH.error(error);
  }
}
export async function getTransaction(req, res) {
  try {
    const payload = await TransactionServices.getTransaction(req.params.id, req.user._id);
    return res.RH.success(payload);
  } catch (error) {
    return res.RH.error(error);
  }
}
