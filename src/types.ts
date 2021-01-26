export interface ChatMessage {
  roomId: string,
  message: string,
  sender: {}
}

export interface ChatMessageServer {
  appId: string,
  room: string,
  message: string,
  sender: JSON
}

export interface Pagination {
  page?: number,
  limit?:number
}
