export const sendDataToQueue = (channel, queueName, data) => {
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)))
}
