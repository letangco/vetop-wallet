/**
 * Run the scripts to create initial data
 * @returns {Promise<boolean>}
 */
import { getWallet, createWallet } from '../../server/components/wallet/wallet.dao'
import logger from '../../server/api/logger';
import {
  WALLET_TYPE,
  WALLET_ARCHIVE_STATUS,
  TRANSACTION_CODE,
  TYPE_SETTING
} from '../../external/constants/constants';
import { totalTransactionSetting, createTransactionSetting } from '../../server/components/transaction/transactionSetting.dao';
import { getTransaction } from '../../server/components/transaction/transaction.controller';
import { createSetting, getSetting } from '../../server/components/admin/settings-general/settings-general.dao';

export default async function dummySomeData() {
  try {
    // Todo: run your scripts to create dummy data
    const archive = await getWallet({
      type: WALLET_TYPE.ARCHIVE
    });
    if (!archive) {
      await createWallet({
        type: WALLET_TYPE.ARCHIVE,
        data: {
          status: WALLET_ARCHIVE_STATUS.STATUS1
        }
      });
    }
  
    const settings = await Promise.all([
      getSetting({ type: TYPE_SETTING.PIN_FEE_WITHDRAWL }),
      getSetting({ type: TYPE_SETTING.VND_FEE_WITHDRAWAL }),
      getSetting({ type: TYPE_SETTING.VETIC_REF_BUYER_RECEIVE }),
      getSetting({ type: TYPE_SETTING.VETIC_REF_SELLER_RECEIVE }),
      getSetting({ type: TYPE_SETTING.MULTIPLE_NUMBER_VETIC }),
      getSetting({ type: TYPE_SETTING.MAX_VETIC }),
      getSetting({ type: TYPE_SETTING.MAXIMUM_TOKEN_SYSTEM }),
    ]);

    if (!settings[0]) {
      await createSetting({
        type: TYPE_SETTING.PIN_FEE_WITHDRAWL,
        value: 0
      });
    }

    if (!settings[1]) {
      await createSetting({
        type: TYPE_SETTING.VND_FEE_WITHDRAWAL,
        value: 0
      });
    }

    if (!settings[2]) {
      await createSetting({
        type: TYPE_SETTING.VETIC_REF_BUYER_RECEIVE,
        value: 5
      });
    }

    if (!settings[3]) {
      await createSetting({
        type: TYPE_SETTING.VETIC_REF_SELLER_RECEIVE,
        value: 3
      });
    }

    if (!settings[4]) {
      await createSetting({
        type: TYPE_SETTING.MULTIPLE_NUMBER_VETIC,
        value: 1000 // vetic user receive
      });
    }

    if (!settings[5]) {
      await createSetting({
        type: TYPE_SETTING.MAX_VETIC,
        value: 300 // 300%
      });
    }

    if (!settings[6]) {
      await createSetting({
        type: TYPE_SETTING.MAXIMUM_TOKEN_SYSTEM,
        value: 50000000 // 50000000%
      });
    }

    const total = await getWallet({
      type: WALLET_TYPE.TOTAL
    });
    if (!total) {
      await createWallet({
        type: WALLET_TYPE.TOTAL
      });
    }
    const promise = await Promise.all([
      totalTransactionSetting({ type: TRANSACTION_CODE.PIN }),
      totalTransactionSetting({ type: TRANSACTION_CODE.VND }),
      totalTransactionSetting({ type: TRANSACTION_CODE.PIN }),
      totalTransactionSetting({ type: TRANSACTION_CODE.STOCK })
    ]);
    if (!promise[0]) {
      await createTransactionSetting({
        type: TRANSACTION_CODE.PIN,
        value: 0
      });
    }
    if (!promise[1]) {
      await createTransactionSetting({
        type: TRANSACTION_CODE.VND,
        value: 0
      });
    }
    if (!promise[2]) {
      await createTransactionSetting({
        type: TRANSACTION_CODE.VETIC,
        value: 0
      });
    }
    if (!promise[3]) {
      await createTransactionSetting({
        type: TRANSACTION_CODE.STOCK,
        value: 0
      });
    }
    logger.info('dummySomeData done');
    return true;
    // eslint-disable-next-line no-unreachable
  } catch (error) {
    throw error;
  }
}
