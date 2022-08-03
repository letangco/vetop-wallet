import { clientUser } from './client';
import { CallGrpc } from '../../../external/grpc/lib/call';

export async function getUserInfo(id) {
  try {
    // eslint-disable-next-line new-cap
    return await CallGrpc(clientUser, 'getUserInfo', { id });
  } catch (err) {
    console.log('Error GRPC : ', err);
    return false;
  }
}

export async function getStaffInfo(id) {
  try {
    // eslint-disable-next-line new-cap
    return await CallGrpc(clientUser, 'getStaffInfo', { id });
  } catch (err) {
    console.log('Error GRPC : ', err);
    return false;
  }
}

export async function getAdminInfo(id) {
  try {
    // eslint-disable-next-line new-cap
    return await CallGrpc(clientUser, 'getAdminInfo', { id });
  } catch (err) {
    console.log('Error GRPC : ', err);
    return false;
  }
}
export async function getStoreInfo(id) {
  try {
    // eslint-disable-next-line new-cap
    return await CallGrpc(clientUser, 'getStoreInfo', { id });
  } catch (err) {
    console.log('Error GRPC : ', err);
    return false;
  }
}

export async function getBankInfo(bankInfoId) {
  try {
    return await CallGrpc(clientUser, 'getBankById', { bankInfoId });
  } catch (error) {
    return false;
  }
}

export async function changeCodeUser(user, code) {
  try {
    return await CallGrpc(clientUser, 'updateNewCodeUser', { user, code });
  } catch (error) {
    return false;
  }
}

export async function getUserInfoResponse(code) {
  try {
    return await CallGrpc(clientUser, 'getUserInfoResponse', { code });
  } catch (error) {
    return false;
  }
}

export async function getStoreInfoByCode(code) {
  try {
    return await CallGrpc(clientUser, 'getStoreInfoByCode', {code})
  } catch (error) {
    return false
  }
}

export async function getUserInfoByCode(code) {
  try {
    return await CallGrpc(clientUser, 'getUserInfoByCode', {code})
  } catch (error) {
    return false
  }
}
