import mongoose, { Schema } from 'mongoose';
import { sendDataToQueue } from '../../../internal/rabbitmq/publisher/publisher';
import { Rabbitmq } from '../../server';
import {
  QUEUE_NAME,
  SOCKET_EMIT
} from '../../../external/constants/job_name';
/**
 * @swagger
 * definitions:
 *  Wallet User:
 *    type: object
 *    properties:
 *      user:
 *        type: String
 *      vetic:
 *        type: number
 */
const ArchiveTrackingSchema = new Schema({
  money: { type: 'number', default: 0, index: 1 }
}, {
  timestamps: true
});

ArchiveTrackingSchema.pre('save', function (next) {
  this.wasNew = this.isNew;
  next();
});
ArchiveTrackingSchema.post('save', async function (created, next) {
  if (this.wasNew) {
    try {
      // TODO Socket
      sendDataToQueue(Rabbitmq.getChannel(), QUEUE_NAME.SOCKET_EMIT_TO_USER, {
        id: null,
        data: {
          money: created.money
        },
        message: SOCKET_EMIT.CHART_ARCHIVE,
      })
    } catch (error) {
      console.error("Error Post Save Notification", error);
    }
  }
  next();
});

export default mongoose.model('ArchiveTracking', ArchiveTrackingSchema);
