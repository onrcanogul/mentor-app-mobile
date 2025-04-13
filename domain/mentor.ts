import { Badge } from "./badge";
import { BaseEntity } from "./base/baseEntity";
import { Category } from "./category";
import { Certificate } from "./certificate";
import { Education } from "./education";
import { Experience } from "./experience";
import { Skill } from "./skill";
import { User } from "./user";

export interface Mentor extends BaseEntity {
  userId: string;
  rating: number;
  requestMessage: string;
  user: User;
  badges: Badge[];
  certificates: Certificate[];
  educations: Education[];
  experiences: Experience[];
  skills: Skill[];
}
