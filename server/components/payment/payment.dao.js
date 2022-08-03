import { error500 } from '../../../external/util/error';
import Payment from './payment.model';

export async function paymentInsertOne(options) {
  try {
    return await Payment.create(options);
  } catch (error) {
    return error500(error);
  }
}
export async function getPayment(options) {
  try {
    return await Payment.findOne(options).lean();
  } catch (error) {
    return error500(error);
  }
}


export async function paymentFindOneByCondition(cond) {
  try {
    return await Payment.findOne(cond);
  } catch (error) {
    return error500(error)
  }
}
export async function paymentCountByCondition(cond) {
  try {
    return Payment.countDocuments(cond);
  } catch (error) {
    return error500(error);
  }
}

export async function paymentUpdateOneByCondition(cond, update) {
  try {
    return await Payment.updateOne(cond, update)
  } catch (error) {
    return error500(error)
  }
}

export async function paymentFindByCondition(cond, query, sort) {
  try {
    return Payment.find(cond).sort(sort).limit(query.limit).skip(query.skip);
  } catch (error) {
    return error500(error);
  }
}
