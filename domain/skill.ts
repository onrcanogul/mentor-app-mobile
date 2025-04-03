import { BaseEntity } from "./base/baseEntity";
import { Experience } from "./experience";

export interface Skill extends BaseEntity {
  name: string;
  description?: string;
  level: number;
  experiences: Experience[];
}
