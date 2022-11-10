import { Server, Socket } from 'socket.io';

// Wrap the socket handlers with generic function
// withHandlerWrapper(handler) -> wrapper(socket, io) -> (payload, ...args) => handler;

type THandler<PayloadType> = (
  payload: PayloadType,
  socket: Socket,
  io: Server,
) => void;

const withHandlerWrapper = <PayloadType>(cb: THandler<PayloadType>) => {
  return (socket: Socket, io: Server) =>
    (payload: PayloadType, ...args: any[]) =>
      cb(payload, socket, io);
};

export default withHandlerWrapper;
