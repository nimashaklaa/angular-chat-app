export interface Message {
  id: number;
  senderId: string | null;
  receiverId: string | null;
  content: string | null;
  timestamp: string;
  isRead: boolean;
}
