import { BaseEntity } from "./base/baseEntity";
import { Chat } from "./chat";
import { User } from "./user";

export interface Message extends BaseEntity {
  chatId: string;
  senderId: string;
  content?: string;
  mediaUrl?: string;
  duration?: number;
  messageType: MessageType;
  isRead: boolean;
  chat?: Chat;
  sender?: User;
}

export enum MessageType {
  Text,
  Audio,
  Video,
  Image,
}
