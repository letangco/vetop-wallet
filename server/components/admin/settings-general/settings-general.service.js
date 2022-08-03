import { getSetting, totalSettings, getSettings } from './settings-general.dao';
import { error500, errorMessage } from "../../../../external/util/error";
import { ERROR_CODE, TYPE_SETTING } from '../../../../external/constants/constants';
import { getSort } from '../../../../external/middleware/query';

export async function changeFee(body) {
    try {
        if (!Object.values(TYPE_SETTING).includes(Number(body.type))) return errorMessage(403, ERROR_CODE.TYPE_SETTING_NOT_FOUND)
        const preFee = await getSetting({ type: body.type });
        preFee.value = parseInt(body.value);
        await preFee.save();
        return preFee;
    } catch (error) {
        return error500(error);
    }
}

export async function getFee(query) {
    try {
        const sort = getSort(query);
        const promise = await Promise.all([totalSettings({}), getSettings({}, query, sort)]);
        return [promise[0], promise[1]];
    } catch (error) {
        return error500(error);
    }
}

export async function getSettingsGeneral(query) {
    try {
        const sort = getSort(query);
        const promise = await Promise.all([totalSettings({}), getSettings({}, query, sort)]);
        return [promise[0], promise[1]];
    } catch (error) {
        return error500(error);
    }
}

export async function updateSetting(body) {
    try {
        if (!Object.values(TYPE_SETTING).includes(parseInt(body.type))) return errorMessage(403, ERROR_CODE.TYPE_SETTING_NOT_FOUND);
        const setting = await getSetting({ type: parseInt(body.type)});
        if (!setting) return errorMessage(403, ERROR_CODE.TYPE_SETTING_NOT_FOUND);
        setting.value = parseInt(body.value);
        await setting.save();
        return setting;
    } catch (error) {
        return error500(error);
    }
}
