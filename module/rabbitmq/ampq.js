import amqp from 'amqplib';
import config from '../../server/config';
import logger from '../../server/api/logger';

export default class AMPQ {
  static channel = null;

  static queues = {};

  static initChannel() {
    return new Promise( ( resolve, reject ) => {
      let channel = AMPQ.channel;
      if (channel) {
        return resolve(channel);
      }
      // Connect to RabbitQM
      amqp.connect(config.rabbitMQ.url).then( async conn => {
        // Create channel
        channel = await conn.createChannel();
        AMPQ.channel = channel;
        return resolve(channel);
      }).catch(error => {
        logger.error('amqp connection failed, please check it carefully:');
        logger.error(error);
        return reject(error);
      });
    })
  }

  static getChannel() {
    return AMPQ.channel;
  }

  static initQueue(queueName, durable = true) {
    let channel;
    try {
      channel = AMPQ.getChannel();
    } catch (error) {
      logger.error('initQueue error:');
      logger.error(error);
      throw error;
    }

    if (!AMPQ.queues[queueName]) {
      AMPQ.queues[queueName] = channel.assertQueue(queueName, {durable: durable});
    }

    return AMPQ.queues[queueName];
  }

  static sendDataToRabbit(queueName, data) {
    if (! data || ! (typeof data === 'object' || typeof data === 'string')) {
      throw Error('Data must be object or string');
    }

    if (typeof data === 'object') {
      data = JSON.stringify(data);
    }

    try {
      // Convert data to Binary type before send it to Queue
      AMPQ.channel.sendToQueue(queueName, Buffer.from(data));
    } catch(error) {
      // Do your stuff to handle this error
      logger.error('sendDataToRabbit error:');
      logger.error(error);
      throw error;
    }
  }

  /**
   *
   * @param queueName
   * @param callback
   * @param options
   * @param options.noAck, if need to make sure the message proceed let set noAck = false
   */
  static consumeData(queueName, callback, options) {
    if (!queueName) {
      throw new Error('You must implement queueName in consumer child');
    }
    let noAck = options ? options.noAck : undefined;
    if (typeof noAck === 'undefined') {
      noAck = true;
    }

    AMPQ.channel.consume(queueName, (msg) => {
      callback(msg, AMPQ.channel);
    }, {
      noAck: noAck,
    });
  }
}
