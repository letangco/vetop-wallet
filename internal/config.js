/**
 * The config for server
 */
import { Zookeeper } from '../external/constants/configs';

export const SERVER_PORT = process.env.PORT_TEST || Zookeeper.port || process.env.SERVER_PORT || 8040;
export const GRPC_HOST = Zookeeper.grpc.payment || process.env.GRPC_PORT || 9040;
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
export const SHARE_HOST = Zookeeper.shareHost || process.env.SHARE_HOST;
export const API_DOCS_HOST = Zookeeper.apiDocs || process.env.API_DOCS_HOST || "localhost:8020";
// Service config
export const MONGO_URI = Zookeeper.db || process.env.MONGO_URI || "mongodb://root:root@docker-mongodb:27017/tggs-class?retryWrites=true";
export const REDIS_HOST = Zookeeper.redis.host || process.env.REDIS_HOST || "docker-redis-server";
export const REDIS_PORT = Zookeeper.redis.port || process.env.REDIS_PORT || 6379;
export const REDIS_PASS = Zookeeper.redis.pass || process.env.REDIS_PASS || "";
// auth
export const JWT_SECRET_KEY = Zookeeper.secret || process.env.JWT_SECRET_KEY || "ansnejas";

// GRPC
export const GRPC = {
  user: Zookeeper.grpc.user || process.env.GRPC_USER,
  store: Zookeeper.grpc.store || process.env.GRPC_STORE,
  wallet: Zookeeper.grpc.wallet || process.env.GRPC_WALLET,
  notification: Zookeeper.grpc.notification || process.env.GRPC_NOTIFICATION,
  socket: Zookeeper.grpc.socket || process.env.GRPC_SOCKET,
}

// Elasticsearch
export const ELASTICSEARCH_HOST = Zookeeper.elasticsearch.host || process.env.ELASTICSEARCH_HOST || "localhost";
export const ELASTICSEARCH_PORT = Zookeeper.elasticsearch.port || process.env.ELASTICSEARCH_PORT || "9200";

// RabbitMQ
export const RABBITMQ_URI = Zookeeper.rabbitmqURI || process.env.RABBIT_URI;

// Firebase
export const FIREBASE_ADMIN = {
  JSON_ENCODE: Zookeeper.firebase.jsonEncode || process.env.FIREBASE_SERVICE_ACCOUNT,
  DATABASE_URL: Zookeeper.firebase.databaseURL || process.env.FIREBASE_DATABASE_URL
}

// Company config
export const COMPANY_CONFIG = {
  ICON: Zookeeper.company.icon || process.env.ICON_COMPANY
}

// VN Pay
export const VN_PAY = {
  VNP_COMMAND: process.env.VNP_COMMAND,
  VNP_VERSION: process.env.VNP_VERSION,
  VNP_TMN_CODE: process.env.VNP_TMN_CODE,
  VNP_HASH_SECRET: process.env.VNP_HASH_SECRET,
  VNP_HASH_SECRET_TYPE: process.env.VNP_HASH_SECRET_TYPE,
  VNP_URL: process.env.VNP_URL,
  VNP_URL_RETURN: process.env.VNP_URL_RETURN,
  LOCALE: process.env.LOCALE,
  CURRENCY_CODE: process.env.CURRENCY_CODE,
}
