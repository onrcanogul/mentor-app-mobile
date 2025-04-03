import { BaseEntity } from "./base/baseEntity";
import { Skill } from "./skill";

export interface Badge extends BaseEntity {
  name: string;
  description: string;
  icon: string;
  from: string;
  skills: Skill[];
}
