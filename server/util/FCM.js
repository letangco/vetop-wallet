// import FirebaseAdmin from 'firebase-admin';
// import logger from '../api/logger';
// import { DATABASE_URL } from '../config';
//
// const serviceAccount = require('../../firebase/service_account.json');
//
// FirebaseAdmin.initializeApp({
//   credential: FirebaseAdmin.credential.cert(serviceAccount),
//   databaseURL: DATABASE_URL,
// });
//
// const messaging = FirebaseAdmin.messaging();
//
// /**
//  * Send FCM message to devices by device token
//  * @param deviceTokens
//  * @param payload
//  * @returns {Promise<admin.messaging.MessagingDevicesResponse>}
//  */
// export async function sendFCMToDevices(deviceTokens, payload) {
//   try {
//     return await messaging.sendToDevice(deviceTokens, payload);
//   } catch (error) {
//     logger.error('sendFCMToDevices error:', error);
//     throw error;
//   }
// }
