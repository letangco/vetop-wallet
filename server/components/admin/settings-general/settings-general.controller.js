import { ERROR_CODE, TYPE_SETTING } from '../../../../external/constants/constants';
import { commonGetQuery, getSort } from '../../../../external/middleware/query';
import { error500, errorMessage } from '../../../../external/util/error';
import * as SettingsGeneralService from './settings-general.service';

export async function getFee(req, res) {
    try {
        const query = commonGetQuery(req);
        const payload = await SettingsGeneralService.getFee(query);
        return res.RH.paging(payload, query.page, query.limit);
    } catch (error) {
        return res.RH.error(error);
    }
}

export async function changeFee(req, res) {
    try {
        const { body } = req;
        const payload = await SettingsGeneralService.changeFee(body);
        return res.RH.success(payload);
    } catch (error) {
        return res.RH.error(error);
    }
}

export async function getSettings(req, res) {
    try {
        const query = commonGetQuery(req);
        const payload = await SettingsGeneralService.getSettingsGeneral(query);
        return res.RH.paging(payload, query.page, query.limit);
    } catch (error) {
        return res.RH.error(error);
    }
}

export async function updateSetting(req, res) {
    try {
        const { body } = req;
        const payload = await SettingsGeneralService.updateSetting(body);
        return res.RH.success(payload);
    } catch (error) {
        return res.RH.error(error);
    }
}
