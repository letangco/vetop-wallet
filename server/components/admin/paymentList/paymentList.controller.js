import { commonGetQuery } from '../../../../external/middleware/query';
import * as PaymentListService from './paymentList.service';

export async function createPaymentList(req, res) {
    try {
        const { user, body } = req;
        const payload = await PaymentListService.createPaymentList(body);
        return res.RH.success(payload); 
    } catch (error) {
        return res.RH.error(error);
    }
}

export async function getPaymentList(req, res) {
    try {
        const query = commonGetQuery(req);
        const payload = await PaymentListService.getPaymentList(query);
        return res.RH.paging(payload, query.page, query.limit);
    } catch (error) {
        return res.RH.error(error);
    }
}

export async function getPaymentListById(req, res) {
    try {
        const { id } = req.params;
        const payload = await PaymentListService.getPaymentListById(id);
        return res.RH.success(payload); 
    } catch (error) {
        return rs.RH.error(error);
    }
}
