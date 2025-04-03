import { BaseEntity } from "./base/baseEntity";
import { User } from "./user";

export interface Goal extends BaseEntity {
  userId: string;
  text: string;
  targetDate: Date;
  user?: User;
}
