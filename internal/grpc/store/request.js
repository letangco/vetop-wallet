import { CallGrpc } from "../../../external/grpc/lib/call";
import { clientStore } from "./client";

export async function getClassInfoByID(id) {
  try {
    return await CallGrpc(clientStore, "GetClassInfoByID", {id})
  } catch (error) {
    console.log("Error GRPC getClassInfoByID : ", error)
    return false
  }
}

export async function getLessonInfoByID(id) {
  try {
    return await CallGrpc(clientStore, "GetLessonInfoByID", {id})
  } catch (error) {
    console.log("Error GRPC getLessonInfoByID : ", error)
    return false
  }
}


export async function getTotalOrder(cond) {
  try {
    return await CallGrpc(clientStore, 'getTotalOrder', { cond })
  } catch (error) {
    return false;
  }
}

export async function updateSettingTransaction(type) {
  try {
    return await CallGrpc(clientStore, 'updateSettingTransaction', { type });
  } catch (error) {
    return false;
  }
}

export async function updateTimeFirework(date, UTChour, UTCminute) {
  try {
    return await CallGrpc(clientStore, 'updateTimeFireWork', { date, UTChour, UTCminute });
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function getSimInfo(_id) {
  try {
    return await CallGrpc(clientStore, 'getSimInfo', { _id });
  } catch (error) {
    return false;
  }
}

export async function updateStatusTypeOrderById(orderId, status) {
  try {
    return await CallGrpc(clientStore, 'updateStatusTypeOrderById', { orderId, status });
  } catch (error) {
    return false;
  }
}

export async function getOrderInfo(_id) {
  try {
    return await CallGrpc(clientStore, 'getOrderInfo', { _id });
  } catch (error) {
    return false;
  }
}
