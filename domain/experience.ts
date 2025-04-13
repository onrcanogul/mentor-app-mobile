import { BaseEntity } from "./base/baseEntity";
import { Skill } from "./skill";

export interface Experience extends BaseEntity {
  title: string;
  company?: string;
  startDate: Date;
  endDate: Date | null;
  location: string;
  description?: string;
  skills?: Skill[];
  isCurrentPosition?: boolean;
}
