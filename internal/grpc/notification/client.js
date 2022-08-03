import { GRPC } from '../../config';

const grpc = require('grpc');
const options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
};
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync('./external/grpc/proto/notification.proto', options);
const notesProto = grpc.loadPackageDefinition(packageDefinition);

const NoteService = notesProto.notification.Notification;

export const clientNotification = new NoteService(GRPC.notification,
  grpc.credentials.createInsecure()
);
