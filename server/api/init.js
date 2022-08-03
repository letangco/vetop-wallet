import RabbitMQ from '../../internal/rabbitmq/rabbitmq';
import {
  ELASTICSEARCH_HOST,
  ELASTICSEARCH_PORT,
  MONGO_URI, RABBITMQ_URI
} from '../../internal/config';
import Colors from 'colors';
import mongoose from 'mongoose';
import logger from '../../internal/logger/logger';
import ElasticSearch from '../../internal/elasticsearch/elasticsearch';

export const Rabbitmq = new RabbitMQ(RABBITMQ_URI)
export const Elastic = new ElasticSearch(
  {
    host: ELASTICSEARCH_HOST,
    port: ELASTICSEARCH_PORT,
  }
)

async function MongoConnect() {
  try {
    if (!MONGO_URI) throw new Error('No database info provided');

    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });
    logger.info(`Mongodb connected ${Colors.green('✔✔✔')}`);
  } catch (err) {
    logger.error('Please make sure Mongodb is installed and running!');
    throw err;
  }
}

export async function ModuleInit() {
  try {
    await MongoConnect();
    await Rabbitmq.init();
    console.info(Colors.green(Colors.italic('================ Init Module Success =================')))
  } catch (err) {
    logger.info("Init Module Failed : ", err)
    process.exit(1)
  }
}
