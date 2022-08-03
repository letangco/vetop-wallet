import slug from 'slug';
import { ERROR_CODE, PAYMENT_LIST_TYPE, SHARE_HOST } from '../../../../external/constants/constants';
import { getSort } from '../../../../external/middleware/query';
import { error500, errorMessage } from '../../../../external/util/error';
import { GetFileData } from '../../../helpers/file.helper';
import { createPaymentDAO, getPaymentListDAO, getPaymentsDAO, getTotalPaymentList } from './paymentList.dao';

export async function createPaymentList(body) {
    try {
        if (!Object.values(PAYMENT_LIST_TYPE).includes(body.type)) return errorMessage(403, ERROR_CODE.NOT_FOUND_ERR);
        const searchString = slug(`${body.name}`, ' ');
        const hasName = await getPaymentListDAO({ searchString, type: body.type });
        if (hasName) return errorMessage(403, ERROR_CODE.VALUE_EXIST);
        const newPayment = await createPaymentDAO({
            name: body.name,
            image: body.image || {},
            type: body.type,
            data: body.type === PAYMENT_LIST_TYPE.TRANSFER ? [{
 bankName: body.bankName, accountNumber: body.accountNumber, accountName: body.accountName, bankBranch: body.bankBranch
            }] : []
        });
        return newPayment;
    } catch (error) {
        return error500(error);
    }
}

export async function getPaymentList(query) {
    try {
        const sort = getSort(query);
        const promise = await Promise.all([getTotalPaymentList({}), getPaymentsDAO({}, query, sort)]);
        if (promise[0]) {
            promise[1] = promise[1].map((item) => {
                if (item?.image?.name) {
                    item.image = GetFileData(SHARE_HOST, item.image);
                }
                return item;
            });
        }
        return [promise[0], promise[1]];
    } catch (error) {
        return error500(error);
    }
}

export async function getPaymentListById(_id) {
    try {
        const data = await getPaymentListDAO({ _id })
        return data;
    } catch (error) {
        return error500(error);
    }
}
