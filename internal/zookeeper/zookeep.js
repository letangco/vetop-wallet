const zookeeper = require('node-zookeeper-client');
const Colors = require('colors');


// eslint-disable-next-line prefer-const
let client = zookeeper.createClient(process.env.ZOOKEEPER_URI, {
  sessionTimeout: 10000
});
// tslint:disable-next-line: no-console
client.once('connected', () => {
  console.log(Colors.green(' *** ZOOKEEPER READY -'), process.env.ZOOKEEPER_URI);
});

client.on('disconnected', () => {
  console.log('Zk Disconnected');
});

client.on('expired', () => {
  console.log('zk session expired');
});

client.connect();

const zkCommonPrefix = process.env.ZOOKEEPER_COMMON_PREFIX;
const zkServicePrefix = process.env.ZOOKEEPER_SERVICE_PREFIX;
const zkGRPCPrefix = process.env.ZOOKEEPER_GRPC_PREFIX;
/**
 * Get data
 * @param path
 */
const getData = async (path) => {
  let result = '';
  return new Promise((resolve) => {
    client.getData(path, (error, data) => {
      if (error) {
        resolve('');
      }
      result = data ? data.toString() : '';
      resolve(result);
    });
  });
};

/**
 * Load Data Init From zookeeper
 */
const getConfig = async () => {
  // App port
  const appPort = await getData(`${zkServicePrefix}/app/port`);
  // Database
  const dbURI = await getData(`${zkServicePrefix}/database/uri`);
  const dbName = await getData(`${zkServicePrefix}/database/name`);
  const dbAuthUser = await getData(`${zkServicePrefix}/database/username`);
  const dbAuthPassword = await getData(`${zkServicePrefix}/database/password`);
  const portGrpcUser = await getData(`${zkGRPCPrefix}/user`);
  const portGrpcClass = await getData(`${zkGRPCPrefix}/class`);

  // Firebase
  const firebaseKey = await getData(`${zkCommonPrefix}/firebase/key`);
  const firebaseEncode = await getData(`${zkCommonPrefix}/firebase/firebase_json_decode`);

  // Secret for user token
  const secret = await getData(`${zkCommonPrefix}/app/authSecret`);

  let dbPath = dbURI ? `${dbURI}/${dbName}` : '';
  if (dbAuthUser && dbAuthPassword) {
    dbPath = dbPath.replace('://', `://${dbAuthUser}:${dbAuthPassword}@`);
    dbPath += '?retryWrites=true&authSource=admin&w=1';
  }
  // RabbitMQ
  const rabbitmqURI = await getData(`${zkCommonPrefix}/rabbitmq/uri`);

  // Api Docs
  const apiDocs = await getData(`${zkServicePrefix}/apidocs`)

  // Redis
  const redisHost = await getData(`${zkCommonPrefix}/redis/host`);
  const redisPort = await getData(`${zkCommonPrefix}/redis/port`);
  const redisPass = await getData(`${zkCommonPrefix}/redis/password`);

  // Elasticsearch
  const elasticsearchHost = await getData(`${zkCommonPrefix}/elasticsearch/host`)
  const elasticsearchPort = await getData(`${zkCommonPrefix}/elasticsearch/port`)


  const zkConfig = {
    port: appPort,
    db: dbPath,
    secret,
    grpc: {
      user: portGrpcUser,
      class: portGrpcClass
    },
    rabbitmqURI,
    redis: {
      host: redisHost,
      port: redisPort,
      pass: redisPass
    },
    dbName,
    apiDocs,
    firebase: {
      key: firebaseKey,
      jsonEncode: firebaseEncode
    },
    elasticsearch: {
      host: elasticsearchHost,
      port: elasticsearchPort,
    }

  };
  return zkConfig;
};

module.exports = {
  getConfig,
  getData,
  zkGRPCPrefix,
  zkClient: client,
};
