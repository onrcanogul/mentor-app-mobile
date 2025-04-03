import { BaseEntity } from "./base/baseEntity";
import { Category } from "./category";
import { Goal } from "./goal";
import { User } from "./user";

export interface Mentee extends BaseEntity {
  userId: string;
  user: User;
  categories: Category[];
  goals: Goal[];
  requestMessage: string;
  matchingCount: number;
}
