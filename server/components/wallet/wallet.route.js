import { Router } from 'express';
import { isAdmin, isUser } from '../../../internal/auth/jwt';
import * as WalletController from './wallet.controller';
import * as WalletValidator from './wallet.validator';

const router = new Router();

router.route('')
  .post(
    isUser.auth(),
    WalletController.createWallet
  )
  .get(
    isUser.auth(),
    WalletController.getWallet
  );
router.route('/wallet-archive')
  .get(
    // isUser.auth(),
    WalletController.getWalletArchive
  );
router.route('/wallet-archive-chart')
  .get(
    // isUser.auth(),
    WalletController.getWalletArchiveChart
  );
router.route('/wallet-archive-change')
  .get(
    // isUser.auth(),
    WalletController.getWalletArchiveChange
  );
router.route('/wallet-archive-history')
  .get(
    // isUser.auth(),
    WalletController.getWalletArchiveHistory
  );
router.route('/wallet-total')
  .get(
    // isUser.auth(),
    WalletController.getWalletTotal
  );
router.route('/withdrawal')
  .post(
    isUser.auth(),
    WalletValidator.withdrawalValidator,
    WalletController.withdrawal
  );
// router.route('/checkUpdateWallet')
//   .get(
//     WalletController.checkUpdateWallet
//   );

router.route('/token')
  .get(
    isUser.auth(),
    WalletController.calculatorToken
  )

router.route('/analytic-token')
  .get(
    isUser.auth(),
    WalletController.analyticToken
  )

router.route('/analytic-stock')
  .get(
    WalletController.analyticStock
  )

router.route('/sim/detail/:sim')
  .get(
    isUser.auth(),
    WalletController.getWalletSimDetail
  )

router.route('/otp-sim/:sim')
  .get(
    isUser.auth(),
    WalletController.getOtpSim
  )

// test
router.route('/all-wallet')
  .get(
    isAdmin.auth(),
    WalletController.getAllWallet
  );

router.route('/ranking')
  .get(
    WalletController.getRanking
  );

router.route('/rank')
  .get(
    WalletController.getRank
  )

router.route('/vetic-statistic')
  .get(
    isUser.auth(),
    WalletController.getVeticStatistic
  )

router.route('/refresh')
  .get(
    // isUser.auth(),
    WalletController.getRefresh
  )
  
export default router;
