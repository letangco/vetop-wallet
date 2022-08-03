var cron = require('node-cron');
import { walletInterest, walletArchiveTrackingMinute, incomeTax, resetIncomeTax, transferVeticToToken, checkPinGreaterThanVetic } from '../components/wallet/wallet.service';

export default async function cronJob() {
  // Interest each day
  cron.schedule('*/8 * * * *', async () => {
    await walletInterest();
    await transferVeticToToken();
    await checkPinGreaterThanVetic();
  }, {
    scheduled: true,
    timezone: 'Asia/Bangkok'
  });
  cron.schedule('0 0 1 * *', () => {
    incomeTax();
  }, {
    scheduled: true,
    timezone: 'Asia/Bangkok'
  });

  cron.schedule('0 0 1 1 *', () => {
    resetIncomeTax();
  }, {
    scheduled: true,
    timezone: 'Asia/Bangkok'
  });
  // Tracking wallet archive each minutes
  cron.schedule('*/5 * * * *', () => {
    walletArchiveTrackingMinute();
  });
}
