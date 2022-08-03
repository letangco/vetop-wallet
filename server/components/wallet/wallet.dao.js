import { error500 } from '../../../external/util/error';
import Wallet from './wallet.model';

export async function updateVeticFromOrder(data) {
  try {
  } catch (error) {
    return error500(error);
  }
}

export async function getWallet(data) {
  try {
    return await Wallet.findOne(data);
  } catch (error) {
    return error500(error);
  }
}

export async function createWallet(data) {
  try {
    return await Wallet.create(data);
  } catch (error) {
    return error500(error);
  }
}


export async function updateWallet(data) {
  try {
    return await Wallet.update(data);
  } catch (error) {
    return error500(error);
  }
}

export async function getWalletDAO(data) {
  try {
    return await Wallet.findOne(data);
  } catch (error) {
    return error500(error);
  }
}

export async function createWalletDAO(data) {
  try {
    return await Wallet.create(data);
  } catch (error) {
    return error500(error);
  }
}

export async function getWalletsDAO(cond) {
  try {
    return await Wallet.find(cond);
  } catch (error) {
    return error500(error);
  }
}

export async function getTotalWalletsDAO(cond) {
  try {
    return await Wallet.countDocuments(cond);
  } catch (error) {
    return error500(error);
  }
}

export async function getAllWalletDAO(cond, query, sort) {
  try {
    return await Wallet.find(cond).skip(query.skip).limit(query.limit).sort(sort);
  } catch (error) {
    return error500(error);
  }
}

export async function getTotalVeticDAO(cond) {
  try {
    return await Wallet.aggregate([
      {
        $match: cond
      },
      {
 $group: {
 _id: null, vetic: { $first: '$vetic' }, totalVetic: { $sum: '$vetic' }, count: { $sum: 1 }
}
}
  ]);
  } catch (error) {
    return error500(error);
  }
}

export async function getTotalStockDAO(cond) {
  try {
    return await Wallet.aggregate([
      {
        $match: cond
      },
      {
 $group: {
 _id: null, stock: { $first: '$stock' }, totalStock: { $sum: '$stock' }, count: { $sum: 1 }
}
}
  ]);
  } catch (error) {
    return error500(error);
  }
}

export async function getTotalWalletDAO() {
  try {
    return await Wallet.countDocuments();
  } catch (error) {
    return error500(error);
  }
}

export async function getRankingDAO(cond, query, sort) {
  try {
    return await Wallet.aggregate([
      {
        $match: cond
      },
      {
        $project: {
          user: 1,
          type: 1,
          ranking: { $sum: ['$vetic', '$veticTransferStock'] }
        }
      },
      {
        $sort: { ranking: -1 }
      },
      {
        $limit: query.limit
      },
      {
        $skip: query.skip
      }
    ]);
  } catch (error) {
    return error500(error);
  }
}
