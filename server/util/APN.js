/**
 * Implement
 * Apple Push Notification
 */

import apn from 'apn';
import path from 'path';
import {APN_KEY_NAME, APN_PRODUCTION_MODE, APP_TEAM_ID,} from '../config';
import logger from '../api/logger';

const options = {
  token: {
    key: path.resolve(__dirname, `../../${APN_KEY_NAME}`),
    keyId: APP_KEY_ID,
    teamId: APP_TEAM_ID
  },
  production: APN_PRODUCTION_MODE
};

const apnProvider = new apn.Provider(options);

/**
 * Send APN message to devices by device token
 * @param deviceToken
 * @param notification APN Notification
 */
export async function sendAPNToDevice(deviceToken, notification) {
  try {
    return await apnProvider.send(notification, deviceToken);
  } catch (error) {
    logger.error('sendAPNToDevice error:', error);
    throw error;
  }
}

/**
 * Send APN message to devices by devices token
 * @param deviceTokens array of deviceToken
 * @param notification APN Notification
 */
export async function sendAPNToDevices(deviceTokens, notification) {
  try {
    return await apnProvider.send(notification, deviceTokens);
  } catch (error) {
    logger.error('sendAPNToDevices error:', error);
    throw error;
  }
}
