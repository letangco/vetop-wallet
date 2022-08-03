import { error500 } from '../../../external/util/error';
import Transaction from './transaction.model';

/**
 * transactionCreate
 * @param {object} options
 * */
export async function createTransaction(conditions) {
  try {
    return await Transaction.create(conditions);
  } catch (error) {
    return error500(error);
  }
}

/**
 * transactionCreate
 * */
export async function getTransactionById(id) {
  try {
    return await Transaction.findById(id).lean();
  } catch (error) {
    return error500(error);
  }
}

/**
 * getTransactions
 * @param {object} options
 * */
export async function getTransactions(conditions, query, sort) {
  try {
    return await Transaction.find(conditions).sort(sort).limit(query.limit).skip(query.skip);
  } catch (error) {
    return error500(error);
  }
}

/**
 * getTransactionTotal
 * @param {object} options
 * */
export async function getTransactionTotal(conditions) {
  try {
    return await Transaction.countDocuments(conditions);
  } catch (error) {
    return error500(error);
  }
}

export async function countTransactionByCond(cond) {
  try {
    return await Transaction.countDocuments(cond);
  } catch (error) {
    return error500(error);
  }
}

export async function findOneTransactionByCond(cond) {
  try {
    return await Transaction.findOne(cond);
  } catch (error) {
    return error500(error);
  }
}
