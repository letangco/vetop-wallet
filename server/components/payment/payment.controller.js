import * as PaymentServices from './payment.service';

export async function paymentCreate(req, res) {
  try {
    const body = req.body;
    const data = await PaymentServices.paymentVNPayGetUrl(body, req.user);
    return res.RH.success(data);
  } catch (error) {
    return res.RH.error(error);
  }
}

// eslint-disable-next-line consistent-return
export async function paymentPostBack(req) {
  try {
    const query = req.query;
    await PaymentServices.paymentPostBack(query);
  } catch (error) {
    console.log('error paymentPostBack: ', error);
  }
}

export async function paymentPaymeCreate(req, res) {
  try {
    const { user } = req;
    const { body } = req;
    const payload = await PaymentServices.paymentPaymeCreate(user._id, body.amount, body.code);
    return res.RH.success(payload);
  } catch (error) {
    return res.RH.error(error);
  }
}

export async function getInfoTransactionPayme(req, res) {
  try {
    const payload = await PaymentServices.getInfoTransactionPayme(req.params.transactionId);
    return res.RH.success(payload);
  } catch (error) {
    return res.RH.error(error);
  }
}

export async function createPaymentPayme(req, res) {
  try {
    const { transId } = req.body;
    const payload = await PaymentServices.createPaymentLater(transId);
    return res.RH.success(payload);
  } catch (error) {
    return res.RH.error(error);
  }
}
