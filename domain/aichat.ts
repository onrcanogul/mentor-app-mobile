import { BaseEntity } from "./base/baseEntity";
import { User } from "./user";

export interface AIChat extends BaseEntity {
  userId: string;
  title: string;
  user: User;
  messages: any[];
}
