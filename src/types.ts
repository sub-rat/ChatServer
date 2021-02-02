export interface ChatMessage {
  message ?: string,
  sender ?: string
}

export interface UpdateMessage {
  message ?: string,
  id ?: number
}

export interface JoinRoom {
  roomId ?: string,
  sender ?: string
}

export interface User {
  id: string,
  appId: string,
  room: string,
  sender: string
}

export interface ChatMessageServer {
  appId: string,
  room: string,
  message: string,
  sender: string
}

export interface Pagination {
  page?: number,
  limit?:number
}
