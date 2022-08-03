import { error500 } from '../../../../external/util/error';
import PaymentList from './paymentList.model';

export async function createPaymentDAO(options) {
    try {
        return await PaymentList.create(options);
    } catch (error) {
        return error500(error);
    }
}

export async function getPaymentsDAO(cond, query, sort) {
    try {
        return await PaymentList.find(cond).skip(query.skip).limit(query.limit).sort(sort);
    } catch (error) {
        return error500(error);
    }
}

export async function getPaymentListDAO(cond) {
    try {
        return await PaymentList.findOne(cond);
    } catch (error) {
        return error500(error);
    }
}

export async function getTotalPaymentList(cond) {
    try {
        return await PaymentList.countDocuments(cond);
    } catch (error) {
        return error500(error);
    }
}
