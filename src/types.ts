export interface ChatMessage {
  message ?: string,
  sender ?: string
}

export interface UpdateMessage {
  message ?: string,
  id ?: number
}

// export interface JoinRoom {
//   roomId ?: string
// }

export interface ChatUser {
  id: string,
  appId: string,
  room: string,
  roomId: number,
  sender: number
}

export interface ChatMessageServer {
  roomId: string,
  message: string,
  userId: string
}

export interface Pagination {
  page?: number,
  limit?:number
}
