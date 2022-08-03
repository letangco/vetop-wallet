import { commonGetQuery, getSort } from "../../../../external/middleware/query";
import * as TrangsactionService from './transaction.service';

export async function adminGetTransactions(req, res) {
    try {
        const query = commonGetQuery(req);
        const payload = await TrangsactionService.adminGetTransactions(query, getSort(query));
        return res.RH.paging(payload, query.page, query.limit);
    } catch (error) {
        return res.RH.error(error);
    }
}

export async function adminGetTransactionById(req, res) {
    try {
        const { id } = req.params;
        const payload = await TrangsactionService.adminGetTransactionById(id);
        return res.RH.success(payload);
    } catch (error) {
        return res.RH.error(error);
    }
}

export async function adminTopupVndToUser(req, res) {
    try {
        const options = {
            code: req?.body?.code,
            amount: req?.body?.amount,
            type: req?.body?.type,
            _id: req?.user?._id
        };
        const payload = await TrangsactionService.adminTopupVndToUser(options);
        return res.RH.success(payload);
    } catch (error) {
        return res.RH.error(error);
    }
}

export async function adminGetWithdrawal(req, res) {
    try {
        const query = commonGetQuery(req);
        const payload = await TrangsactionService.adminGetWithdrawal(query);
        return res.RH.paging(payload, query.page, query.limit);
    } catch (error) {
        return res.RH.error(error);
    }
}

export async function adminHandleWithdrawal(req, res) {
    try {
        const { body } = req;
        const payload = await TrangsactionService.adminHandleWithdrawal(body);
        return res.RH.success(payload);
    } catch (error) {
        return res.RH.error(error);
    }
}

export async function adminGetWithdrawalById(req, res) {
    try {
        const { id } = req.params;
        const payload = await TrangsactionService.adminGetWithdrawalById(id);
        return res.RH.success(payload);
    } catch (error) {
        return res.RH.error(error);
    }
}

export async function adminExportTransaction(req, res) {
    try {
        const query = commonGetQuery(req);
        const payload = await TrangsactionService.adminExportTransaction(query);
        res.setHeader('Content-Disposition', `attachment; filename=${payload[0]}`);
        return res.send(payload[1]);
        // return res.send(true);
    } catch (error) {
        return res.RH.error(error);
    }
}
