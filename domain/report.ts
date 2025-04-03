import { BaseEntity } from "./base/baseEntity";
import { User } from "./user";

export interface Report extends BaseEntity {
  reportedByUserId: string;
  reportedUserId: string;
  reason: string;
  status: string;

  reportedByUser: User;
  reportedUser: User;
}
