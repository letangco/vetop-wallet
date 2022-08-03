import { ERROR_CODE } from '../../../../external/constants/constants';
import { error500 } from '../../../../external/util/error';
import SettingsGeneral from './settings-general.model';

export async function createSetting(option) {
    try {
        return await SettingsGeneral.create(option);
    } catch (error) {
        return error500(error, ERROR_CODE.INTERNAL_SERVER_ERROR);
    }
}

export async function getSetting(cond) {
    try {
        return await SettingsGeneral.findOne(cond);
    } catch (error) {
        return error500(error, ERROR_CODE.INTERNAL_SERVER_ERROR);
    }
}

export async function getSettings(cond, query, sort) {
    try {
        return await SettingsGeneral.find(cond).skip(query.skip).limit(query.limit).sort(sort);
    } catch (error) {
        return error500(error, ERROR_CODE.INTERNAL_SERVER_ERROR);
    }
}

export async function totalSettings(cond) {
    try {
        return await SettingsGeneral.countDocuments(cond);
    } catch (error) {
        return error500(error, ERROR_CODE.INTERNAL_SERVER_ERROR);
    }
}
