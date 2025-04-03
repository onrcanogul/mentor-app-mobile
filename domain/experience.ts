import { BaseEntity } from "./base/baseEntity";
import { Skill } from "./skill";

export interface Experience extends BaseEntity {
  title: string;
  company?: string;
  StartDate: Date;
  EndDate: Date;
  location: string;
  description?: string;
  skills: Skill[];
}
