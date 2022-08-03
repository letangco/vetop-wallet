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
const packageDefinition = protoLoader.loadSync('./external/grpc/proto/socket.proto', options);
const notesProto = grpc.loadPackageDefinition(packageDefinition);

const NoteService = notesProto.socket.Socket;

export const clientSocket = new NoteService(GRPC.socket,
  grpc.credentials.createInsecure()
);
