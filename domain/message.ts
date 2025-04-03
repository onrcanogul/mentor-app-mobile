import { BaseEntity } from "./base/baseEntity";
import { Chat } from "./chat";
import { User } from "./user";

export interface Message extends BaseEntity {
  chatId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  chat?: Chat;
  sender?: User;
}
