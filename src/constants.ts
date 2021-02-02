export enum ChatEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  SEND_MESSAGE = 'send_message',
  MESSAGE = 'message',
  JOIN_ROOM = 'join',
  LEAVE_ROOM = 'leave',
  LOAD_MORE = 'load_more',
  UPDATE = 'update',
  DELETE_MESSAGE= 'delete',
  DELETE_CHAT= 'delete_room',
  ERROR = "err",
  ROOM_DATA = "roomData",
  INFO = "info"
}
