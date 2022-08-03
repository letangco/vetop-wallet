import { ERROR_CODE } from '../../../external/constants/constants';
import { error500 } from '../../../external/util/error';
import TransactionSetting from './transactionSetting.model';

export async function getTransactionSetting(cond) {
    try {
        return await TransactionSetting.findOne(cond);
    } catch (error) {
        return error500(error, ERROR_CODE.INTERNAL_SERVER_ERROR);
    }
}

export async function createTransactionSetting(option) {
    try {
        return await TransactionSetting.create(option);
    } catch (error) {
        return error500(error, ERROR_CODE.INTERNAL_SERVER_ERROR);
    }
}

export async function totalTransactionSetting(cond) {
    try {
        return await TransactionSetting.countDocuments(cond);
    } catch (error) {
        return error500(error, ERROR_CODE.INTERNAL_SERVER_ERROR);
    }
}
