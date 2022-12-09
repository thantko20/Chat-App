import { Server, Socket } from 'socket.io';

// Wrap the socket handlers with generic function
// withHandlerWrapper(handler) -> wrapper(socket, io) -> (payload, ...args) => handler;

type TAcknowledgeResponse = {
  status: {
    ok: boolean;
  };
};

type THandler<PayloadType> = (
  payload: PayloadType,
  socket: Socket,
  io: Server,
  ack?: (response: TAcknowledgeResponse) => void
) => void;

const withHandlerWrapper = <PayloadType>(cb: THandler<PayloadType>) => {
  return (socket: Socket, io: Server) =>
    (payload: PayloadType, ack?: (response: TAcknowledgeResponse) => void) =>
      cb(payload, socket, io, ack);
};

export default withHandlerWrapper;
