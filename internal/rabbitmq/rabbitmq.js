import rabbitmq from 'amqplib';
import logger from '../logger/logger';
import { listQueues } from './subscriber/subscriber';

export default class RabbitMQ {
  constructor(uri) {
    this.uri = uri
    this.channel = null
  }

  async init() {
    try {
      const connection = await rabbitmq.connect(this.uri)
      logger.info("RabbitMQ connection ready !!!")
      this.channel = await connection.createChannel()
      await listQueues(this.channel)
    } catch (error) {
      logger.error("Init rabbitMQ failed : ", error)
      process.exit(1)
    }
  }

  getChannel() {
    return this.channel
  }
}
