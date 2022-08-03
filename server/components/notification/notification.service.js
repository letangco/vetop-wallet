import {
  QUEUE_NAME,
  BODY_FCM,
  TITLE_FCM,
  NOTIFICATION_TYPE, SOCKET_EMIT
} from '../../../external/constants/job_name';
import { sendDataToQueue } from '../../../internal/rabbitmq/publisher/publisher';
import { Rabbitmq } from '../../server';
import { formatToCurrency } from '../../helpers/string.helper';
import { getWallet } from '../wallet/wallet.dao';

export async function sendNotification(data) {
    try {
      console.log('func noti: ', data);
      const options = {
        type: data.type,
        to: data.to,
        targetId: data.data.targetId,
      };
      const total = data?.data?.total || 0;
      const tax = data?.data?.tax || 0;
      const value = data?.data?.value || 0;
      const bankCode = data?.data?.transaction?.bankCode || '';
      const invoice = data?.data?.transaction?.invoice || '';
      const commission = data?.data?.transaction?.commission ? data.data.transaction.commission * 100 : 0;
      const wallet = await getWallet({ _id: data.data.receivedId });
      switch (data.type) {
        case NOTIFICATION_TYPE.TRANSFER_INTEREST_PIN:
          options.title = `${TITLE_FCM.TRANSFER}.`;
          if (tax) {
            options.body = `${BODY_FCM.TRANSACTION_TRANSFER_PIN}${formatToCurrency(parseInt(total))}${BODY_FCM.TRANSACTION_TRANSFER_PIN1}${commission}${BODY_FCM.TRANSACTION_TRANSFER_PIN2}${formatToCurrency(parseInt(wallet?.vetic || 0))}${BODY_FCM.TRANSACTION_TRANSFER_PIN3}${formatToCurrency(parseInt(tax))}${BODY_FCM.TRANSACTION_TRANSFER_PIN4}.`;
          } else {
            options.body = `${BODY_FCM.TRANSACTION_TRANSFER_PIN}${formatToCurrency(parseInt(total))}${BODY_FCM.TRANSACTION_TRANSFER_PIN1}${commission}${BODY_FCM.TRANSACTION_TRANSFER_PIN2}${formatToCurrency(parseInt(wallet?.vetic || 0))}VTĐ.`;
          }
          break;
        case NOTIFICATION_TYPE.DEPOSIT:
          options.title = `${TITLE_FCM.TRANSFER}`;
          options.body = `${BODY_FCM.DEPOSIT}${formatToCurrency(parseInt(value))}${BODY_FCM.DEPOSIT1}.`;
          break;
        case NOTIFICATION_TYPE.WITHDRAWAL_PIN:
          options.title = `${TITLE_FCM.WITHDRAWAL}`;
          options.body = `${BODY_FCM.WITHDRAWAL}${formatToCurrency(parseInt(value))}${BODY_FCM.PIN}${BODY_FCM.FROM_PIN_TO}${BODY_FCM.BANK} ${bankCode}${BODY_FCM.SUCCESS}`;
          break;
        case NOTIFICATION_TYPE.WITHDRAWAL_VND:
          options.title = `${TITLE_FCM.WITHDRAWAL}`;
          options.body = `${BODY_FCM.WITHDRAWAL}${formatToCurrency(parseInt(value))}${BODY_FCM.VND}${BODY_FCM.FROM_VND_TO}${BODY_FCM.BANK} ${bankCode}${BODY_FCM.SUCCESS}`;
          break;
        case NOTIFICATION_TYPE.ADMIN_APPROVE_WITHDRAWAL_PIN:
          options.title = `${TITLE_FCM.WITHDRAWAL}`;
          options.body = `${BODY_FCM.WITHDRAWAL}${formatToCurrency(parseInt(value))}${BODY_FCM.PIN}${BODY_FCM.ADMIN_APPROVE_WITHDRAWAL}`;
          break;
        case NOTIFICATION_TYPE.ADMIN_IS_CONSIDERING_PIN:
          options.title = `${TITLE_FCM.WITHDRAWAL}`;
          options.body = `${BODY_FCM.WITHDRAWAL}${formatToCurrency(parseInt(value))}${BODY_FCM.PIN}${BODY_FCM.ADMIN_IS_CONSIDERING}`;
          break;
        case NOTIFICATION_TYPE.ADMIN_IS_CONSIDERING_VND:
          options.title = `${TITLE_FCM.WITHDRAWAL}`;
          options.body = `${BODY_FCM.WITHDRAWAL}${formatToCurrency(parseInt(value))}${BODY_FCM.VND}${BODY_FCM.ADMIN_IS_CONSIDERING}`;
          break;
        case NOTIFICATION_TYPE.ADMIN_APPROVE_WITHDRAWAL_VND:
          options.title = `${TITLE_FCM.WITHDRAWAL}`;
          options.body = `${BODY_FCM.WITHDRAWAL}${formatToCurrency(parseInt(value))}${BODY_FCM.VND}${BODY_FCM.ADMIN_APPROVE_WITHDRAWAL}`;
          break;
        case NOTIFICATION_TYPE.ADMIN_REJECT_WITHDRAWAL_PIN:
          options.title = `${TITLE_FCM.WITHDRAWAL}`;
          options.body = `${BODY_FCM.WITHDRAWAL}${formatToCurrency(parseInt(value))}${BODY_FCM.PIN}${BODY_FCM.ADMIN_REJECT_WITHDRAWAL}`;
          break;
        case NOTIFICATION_TYPE.ADMIN_REJECT_WITHDRAWAL_VND:
          options.title = `${TITLE_FCM.WITHDRAWAL}`;
          options.body = `${BODY_FCM.WITHDRAWAL}${formatToCurrency(parseInt(value))}${BODY_FCM.VND}${BODY_FCM.ADMIN_REJECT_WITHDRAWAL}`;
          break;
        case NOTIFICATION_TYPE.TRANSFER_VETIC_BUY:
          options.title = `${TITLE_FCM.TRANSFER}`;
          options.body = `${BODY_FCM.TRANSFER}${formatToCurrency(parseInt(value))}${BODY_FCM.TRANSFER_VETIC_BUY}${invoice}`;
          break;
        case NOTIFICATION_TYPE.TRANSFER_VETIC_SELL:
          options.title = `${TITLE_FCM.TRANSFER}`;
          options.body = `${BODY_FCM.TRANSFER_VETIC_SELL}${invoice}${BODY_FCM.TRANSFER_VETIC_SELL1}${formatToCurrency(parseInt(value))}${BODY_FCM.TRANSFER_VETIC_SELL2}`;
          break;
        case NOTIFICATION_TYPE.TRANSFER_VETIC_REF_BUY:
          options.title = `${TITLE_FCM.TRANSFER}`;
          options.body = `${BODY_FCM.TRANSFER_VETIC_REF_BUY}${formatToCurrency(parseInt(value))}${BODY_FCM.TRANSFER_VETIC_REF_BUY1}${invoice}${BODY_FCM.TRANSFER_VETIC_REF_BUY2}`;
          break;
        case NOTIFICATION_TYPE.TRANSFER_VETIC_REF_SELL:
          options.title = `${TITLE_FCM.TRANSFER}`;
          options.body = `${BODY_FCM.TRANSFER_VETIC_REF_SELL}${formatToCurrency(parseInt(value))}${BODY_FCM.TRANSFER_VETIC_REF_SELL1}${invoice}${BODY_FCM.TRANSFER_VETIC_REF_BUY2}`;
          break;
        case NOTIFICATION_TYPE.REFUND_WITHDRAWAL_PIN:
          options.title = `${TITLE_FCM.TRANSFER}`;
          options.body = `${BODY_FCM.TRANSFER_VETIC_REF_SELL}${formatToCurrency(parseInt(value))}${BODY_FCM.PIN}${BODY_FCM.PIN_REFUND_FROM_WITHDRAWAL_PIN}`;
          break;
        case NOTIFICATION_TYPE.REFUND_WITHDRAWAL_VND:
          options.title = `${TITLE_FCM.TRANSFER}`;
          options.body = `${BODY_FCM.TRANSFER_VETIC_REF_SELL}${formatToCurrency(parseInt(value))}${BODY_FCM.VND}${BODY_FCM.PIN_REFUND_FROM_WITHDRAWAL_VND}`;
          break;
        // thay đổi thông báo khi admin duyệt đơn hàng pending VND => VTD
        case NOTIFICATION_TYPE.TOPUP:
          options.title = `${TITLE_FCM.TRANSFER}`;
          options.body = `${BODY_FCM.TRANSFER_VETIC_REF_SELL}${formatToCurrency(parseInt(value))}${BODY_FCM.VTD}${BODY_FCM.ADMIN_TOPUP_USER}`;
          break;
        case NOTIFICATION_TYPE.STOCK_VND:
          options.title = `${TITLE_FCM.TRANSFER}`;
          options.body = `${BODY_FCM.STOCK_VND_WALLET}${formatToCurrency(parseInt(value))}${BODY_FCM.VND}${BODY_FCM.STOCK_VND_CONTENT}`;
          break;
          //  TODO: pending notification to all user when archive wallet changed vnd
        // case NOTIFICATION_TYPE.TRANSFER_MONEY_ARCHIVE:
        //   options.title = `${TITLE_FCM.TRANSFER}`;
        //   options.body = `${BODY_FCM.DEPOSIT}
        //    ${options.data.value}đ
        //    ${BODY_FCM.TRANSFER_MONEY_ARCHIVE}`;
        //   break;
        case NOTIFICATION_TYPE.TRANSFER_PIN:
          options.title = `${TITLE_FCM.TRANSFER}`;
          options.body = `${BODY_FCM.TRANSFER_PIN}${formatToCurrency(parseInt(value))}${BODY_FCM.TRANSFER_PIN1}`;
          break;
        case NOTIFICATION_TYPE.INCOME_TAX:
          options.title = `${TITLE_FCM.INCOME_TAX}`;
          options.body = `${BODY_FCM.INCOME_TAX}${formatToCurrency(parseInt(value))}PIN`;
          break;
        default:
          break;
      }
      if (options.to) {
        sendDataToQueue(Rabbitmq.getChannel(), QUEUE_NAME.CREATE_NOTIFICATION, options);
      }
    } catch (error) {
      console.log(error);
    }
  }
