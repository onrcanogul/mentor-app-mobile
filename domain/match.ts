import { BaseEntity } from "./base/baseEntity";
import { Chat } from "./chat";
import { User } from "./user";

export interface Match extends BaseEntity {
  receiverId: string;
  senderId: string;
  status: MatchStatus;
  receiver: User;
  sender: User;
  chat?: Chat;
}

export enum MatchStatus {
  Pending,
  Accepted,
  Rejected,
}
