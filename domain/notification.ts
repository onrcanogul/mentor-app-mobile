import { BaseEntity } from "./base/baseEntity";
import { User } from "./user";

export interface Notification extends BaseEntity {
  userId: string;
  type: string;
  content: string;
  isRead: boolean;
  user: User;
}
