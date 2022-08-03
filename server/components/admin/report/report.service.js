import { REPORT, STATUS_ORDER, WALLET_ARCHIVE_STATUS, WALLET_TYPE } from '../../../../external/constants/constants';
import { error500 } from '../../../../external/util/error';
import StaticReport from '../../wallet/staticReport';
import Wallet from '../../wallet/wallet.model';
import { getTotalOrder } from '../../../../internal/grpc/store/request';

export async function getReports() {
  try {
    const promises = await Promise.all([
      Wallet.aggregate([
        { $match: { $or: [{ type: 1 }, { type: 2 }, { type: 5 }] } },
        { $group: { _id: null, totalVetic: { $sum: '$vetic' }, count: { $sum: 1 } } }
      ]),
      StaticReport.findOne({ type: REPORT.PIN }),
      Wallet.findOne({ type: WALLET_TYPE.ARCHIVE }),
      Wallet.aggregate([
        { $match: { $or: [{ type: 1 }, { type: 2 }, { type: 5 }] } },
        { $group: { _id: null, totalPin: { $sum: '$pin' }, count: { $sum: 1 } } }
      ]),
      getTotalOrder(JSON.stringify({ status: STATUS_ORDER.MAIN })),
      StaticReport.findOne({ type: REPORT.VETIC }),
      Wallet.aggregate([
        { $match: { $or: [{ type: 1 }, { type: 2 }, { type: 5 }] } },
        { $group: { _id: null, totalToken: { $sum: '$stock' }, count: { $sum: 1 } } }
      ]),
    ]);
    let numsPinRefund = 0;
    switch (promises[2].data.status) {
      case WALLET_ARCHIVE_STATUS.STATUS1:
        numsPinRefund = promises[0][0].totalVetic * 0.001;
        break;
      case WALLET_ARCHIVE_STATUS.STATUS2:
        numsPinRefund = promises[0][0].totalVetic * 0.0005;
        break;
      default:
        break;
    }
    return {
      veticReport: promises[5]?.data || 0,
      vetic: promises[0][0]?.totalVetic || 0,
      pin: promises[1]?.data || 0,
      interest: promises[0]?.data ? promises[0]?.data * (promises[2]?.data?.status === 2 ? 0.005 : 0.01) : 0,
      archive: promises[2] ? {
        tax: promises[2]?.tax || 0,
        money: promises[2]?.money || 0,
        type: promises[2]?.type || 1,
        data: promises[2]?.data || {},
      } : {},
      numsPinRefund: Math.trunc(numsPinRefund),
      totalOrder: promises[4].total,
      token: (promises[0][0].totalVetic / 500000) + promises[6][0].totalToken,
      matchedToken: promises[6][0].totalToken
    };
  } catch (e) {
    return error500(e);
  }
}
