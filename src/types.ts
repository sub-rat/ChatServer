export interface ChatMessage {
  message ?: string,
  sender ?: JSON
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
