/**
 * The config for server
 */
import {Zookeeper} from '../external/constants/configs';

export const SERVER_PORT = process.env.PORT_TEST || Zookeeper.port || process.env.SERVER_PORT || 8010;
export const GRPC_HOST = Zookeeper.grpc.user || process.env.GRPC_PORT;
let serverOrigin = process.env.SERVER_ORIGIN || '*';
try {
  serverOrigin = JSON.parse(serverOrigin);
} catch (e) {
  console.log(`Server Origin is ${serverOrigin}`);
}
export const CORS_OPTIONS = {
  // Find and fill your options here: https://github.com/expressjs/cors#configuration-options
  origin: serverOrigin,
  methods: 'GET,PUT,POST,DELETE',
  allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Accept-Language',
};
export const API_DOCS_HOST = Zookeeper.apiDocs || process.env.API_DOCS_HOST || `localhost:${SERVER_PORT}`;
// Service config
export const MONGO_URI = Zookeeper.db || process.env.MONGO_URI;
export const REDIS_HOST = Zookeeper.redis.host || process.env.REDIS_HOST;
export const REDIS_PORT = Zookeeper.redis.port || process.env.REDIS_PORT;
export const REDIS_PASS = Zookeeper.redis.pass || process.env.REDIS_PASS;
// RabbitMQ
export const RABBITMQ_URI = Zookeeper.rabbitmqURI || process.env.RABBIT_URI;
// Auth
export const JWT_SECRET_KEY = Zookeeper.secret || process.env.JWT_SECRET_KEY;
// Firebase
export const API_KEY_FIREBASE = Zookeeper.firebase.key || process.env.API_KEY_FIREBASE;
export const FIREBASE_JSON_ENCODE = Zookeeper.firebase.jsonEncode || process.env.FIREBASE_JSON_ENCODE;
// Elasticsearch
export const ELASTICSEARCH_HOST = Zookeeper.elasticsearch.host || process.env.ELASTICSEARCH_HOST || 'localhost';
export const ELASTICSEARCH_PORT = Zookeeper.elasticsearch.port || process.env.ELASTICSEARCH_PORT || '9200';
export const GRPC = {
  class: Zookeeper.grpc.user || process.env.GRPC_USER
};
