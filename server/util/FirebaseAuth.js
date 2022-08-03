/**
 * Use to send the verification code to user phone number
 */
import {google} from 'googleapis';
import admin from 'firebase-admin';
import logger from '../api/logger';
import {API_KEY_FIREBASE, FIREBASE_JSON_ENCODE,} from '../config';
import {Base64Decode} from '../../external/util/base64';

const identityToolkit = google.identitytoolkit({
  version: 'v3',
  auth: API_KEY_FIREBASE,
});

const serviceAccount = Base64Decode(FIREBASE_JSON_ENCODE);

/**
 * Request SMS verification code
 * @param phoneNumber
 * @param reCaptchaToken
 * @returns {Promise.<boolean>}
 */
export async function sendAuthenticationSMS(phoneNumber, reCaptchaToken) {
  try {
    const response = await identityToolkit.relyingparty.sendVerificationCode({
      phoneNumber,
      recaptchaToken: reCaptchaToken,
    });
    // save sessionInfo into db. You will need this to verify the SMS code
    return response.data.sessionInfo;
  } catch (error) {
    logger.error('Firebase Phone Authentication sendAuthenticationSMS error:', error);
    throw error;
  }
}

/**
 * Verifying Phone Numbers with verification code
 * @param verificationCode
 * @param sessionInfo
 * @returns {Promise.<boolean>}
 */
export async function verifyAuthenticationCode(verificationCode, sessionInfo) {
  try {
    const response = await identityToolkit.relyingparty.verifyPhoneNumber({
      code: verificationCode,
      sessionInfo: sessionInfo,
    });
    return response.data;
  } catch (error) {
    logger.error('Firebase Phone Authentication verifyAuthenticationCode error:', error);
    throw error;
  }
}

export const firebaseAdmin = admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://thegioigiasu-a5a0c.firebaseio.com'
  }
);

export async function getUserByUid(uid) {
  try {
    return await firebaseAdmin.auth().getUser(uid);
  } catch (err) {
    console.log('error getUserByUid : ', err);
    throw error;
  }
}
