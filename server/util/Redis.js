import redis from 'redis';
import {
  REDIS_HOST,
  REDIS_PORT,
} from '../config';
import logger from '../api/logger';

const client = redis.createClient({
  host: REDIS_HOST,
  port: REDIS_PORT,
});

client.on('error', (error) => {
  logger.error('Redis client connection error:');
  logger.error(error);
});

client.on('ready', () => {
  logger.info('Redis client connection ready');
});

export async function redisExpire(key, time) {
  return new Promise((resolve, reject) => {
    client.expire(key, time, (error) => {
      if (error) {
        console.error('redisExpire error:');
        console.error(error);
        return reject(error);
      }
      return resolve();
    });
  });
}

export async function redisSet(key, value) {
  return new Promise((resolve, reject) => {
    client.set(key, value, (error) => {
      if (error) {
        console.error('redisSet error:');
        console.error(error);
        return reject(error);
      }
      return resolve();
    });
  });
}

export async function redisGet(key) {
  return new Promise((resolve, reject) => {
    client.get(key, (error, reply) => {
      if (error) {
        logger.error('redisGet error:');
        logger.error(error);
        return reject(error);
      }
      return resolve(reply);
    });
  });
}

export async function redisDel(key) {
  return new Promise((resolve, reject) => {
    client.del(key, (error, reply) => {
      if (error) {
        logger.error('redisDel error:');
        logger.error(error);
        return reject(error);
      }
      return resolve(reply);
    });
  });
}
