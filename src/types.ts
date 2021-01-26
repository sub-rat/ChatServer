export interface ChatMessage {
  message ?: string,
  sender ?: string
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
