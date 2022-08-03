import grpc from 'grpc';
import {
  updateVeticFromOrder, createWallet, getWallet,
  getSettingHandle, createTransactionHandle, createWalletSimHandle, getWalletSimHandle,
  updateWalletFromSimHandle, updateVeticFromOrderSimHandle, createTransactionTopUpHandle,
  paymentPaymeCreateHandle, getTransactionChangeCodeHandle, getIdFANAdmin, notificationCreatePendingOrder,
  createPaymentVNPayOrder
} from './handle';
import logger from '../server/api/logger';
import { GRPC_HOST } from '../server/config';

const options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
};
const protoLoader = require('@grpc/proto-loader');

const host = GRPC_HOST.split(':');
const packageDefinition = protoLoader.loadSync('./external/grpc/proto/wallet.proto', options);
const notesProto = grpc.loadPackageDefinition(packageDefinition);

export const server = new grpc.Server();
server.addService(notesProto.wallet.Wallet.service, {
  updateVeticFromOrder: async (call, callback) => {
    callback(null, await updateVeticFromOrder(call));
  },
  createWallet: async (call, callback) => {
    callback(null, await createWallet(call));
  },
  getWallet: async (call, callback) => {
    callback(null, await getWallet(call));
  },
  getSetting: async (call, callback) => {
    callback(null, await getSettingHandle(call));
  },
  createTransaction: async (call, callback) => {
    callback(null, await createTransactionHandle(call))
  },
  createWalletSim: async (call, callback) => {
    callback(null, await createWalletSimHandle(call));
  },
  getWalletSim: async (call, callback) => {
    callback(null, await getWalletSimHandle(call));
  },
  updateWalletFromSim: async (call, callback) => {
    callback(null, await updateWalletFromSimHandle(call));
  },
  updateVeticFromOrderSim: async (call, callback) => {
    callback(null, await updateVeticFromOrderSimHandle(call));
  },
  createTransactionTopUp: async (call, callback) => {
    callback(null, await createTransactionTopUpHandle(call));
  },
  paymentPaymeCreate: async (call, callback) => {
    callback(null, await paymentPaymeCreateHandle(call))
  },
  getTransactionChangeCode: async (call, callback) => {
    callback(null, await getTransactionChangeCodeHandle(call))
  },
  getIdFANAdmin: async (call, callback) => {
    callback(null, await getIdFANAdmin(call));
  },
  notificationCreatePendingOrder: async (call, callback) => {
    callback(null, await notificationCreatePendingOrder(call));
  },
  createPaymentVNPayOrder: async (call, callback) => {
    callback(null, await createPaymentVNPayOrder(call));
  },
});

server.bind(`${host[0]}:${host[1]}`, grpc.ServerCredentials.createInsecure());

logger.info(`GRPC Wallet Running: ${host[0]}:${host[1]}`);
server.start();
