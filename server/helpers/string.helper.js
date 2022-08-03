import mongoose from 'mongoose';

export function generateRandom6Digits() {
  return Math.floor(100000 + Math.random() * 100000);
}

export function getObjectId(objectId) {
  try {
    if (typeof objectId === 'string') {
      return mongoose.Types.ObjectId(objectId);
    }
    return objectId;
  } catch (error) {
    throw error;
  }
}
export function formatToCurrency(value) {
  const valueFormat = value.toString().replace(/[,.]/g, '');
  return valueFormat.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
}
