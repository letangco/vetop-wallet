import { VN_PAY } from '../config';
import querystring from 'qs';
import sha256 from 'sha256';

export function generateUrlPay(options) {
  let vnpUrl = VN_PAY.VNP_URL;
  let vnp_params = {
    vnp_Locale: VN_PAY.LOCALE,
    vnp_CurrCode: VN_PAY.CURRENCY_CODE,
    vnp_Version: VN_PAY.VNP_VERSION,
    vnp_TxnRef: options.paymentId,
    vnp_CreateDate: options.paymentId,
    vnp_OrderInfo: 'Nap tien vao tai khoan',
    vnp_IpAddr: options.ipAddress,
    vnp_Amount: options.amount * 100,
    vnp_Command: VN_PAY.VNP_COMMAND,
    vnp_TmnCode: VN_PAY.VNP_TMN_CODE,
    vnp_ReturnUrl: VN_PAY.VNP_URL_RETURN,
  };
  if (options.bankCode) {
    vnp_params.vnp_BankCode = options.bankCode;
  }
  vnp_params = sortObject(vnp_params);
  const signData = VN_PAY.VNP_HASH_SECRET + querystring.stringify(vnp_params, { encode: false });
  vnp_params.vnp_SecureHashType = VN_PAY.VNP_HASH_SECRET_TYPE;
  vnp_params.vnp_SecureHash = sha256(signData);
  vnpUrl += `?${ querystring.stringify(vnp_params, { encode: true })}`;
  return vnpUrl;
}

/**
 * PostBack
 * */
export function postBackTransaction(options) {
  const secureHash = options.vnp_SecureHash
  delete options.vnp_SecureHash
  delete options.vnp_SecureHashType
  options = sortObject(options)
  const signData = VN_PAY.VNP_HASH_SECRET + querystring.stringify(options, { encode: false });
  const checkSum = sha256(signData)
  if (secureHash === checkSum) {
    return true
  }
  return false
}

function sortObject(o) {
  var sorted = {},
    key, a = [];

  for (key in o) {
    if (o.hasOwnProperty(key)) {
      a.push(key);
    }
  }

  a.sort();

  for (key = 0; key < a.length; key++) {
    sorted[a[key]] = o[a[key]];
  }
  return sorted;
}
