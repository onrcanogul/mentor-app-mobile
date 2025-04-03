import { AIChat } from "./aichat";
import { BaseEntity } from "./base/baseEntity";

export interface AIMessage extends BaseEntity {
  aiChatId: string;
  message: string;
  sender: AIMessageSender;
  aiChat?: AIChat;
}

export enum AIMessageSender {
  Mentee,
  Mentor,
  Ai,
}
