import { BaseEntity } from "./base/baseEntity";
import { Chat } from "./chat";
import { User } from "./user";

export interface Match extends BaseEntity {
  experiencedUserId: string;
  inExperiencedUserId: string;
  status: any;
  experiencedUser: User;
  inexperiencedUser: User;
  chat?: Chat;
}

export enum MatchStatus {
  Pending,
  Accepted,
  Rejected,
}
