import { BaseEntity } from "./base/baseEntity";
import { Category } from "./category";
import { User } from "./user";

export interface CommunityUser extends BaseEntity {
  userId: string;
  user: User;
  requestMessage?: string;
  categories: Category[];
}
