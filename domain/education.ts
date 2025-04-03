import { BaseEntity } from "./base/baseEntity";

export interface Education extends BaseEntity {
  school?: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate: Date;
  endDate: Date;
  grade?: string;
  activities?: string;
  description?: string;
}
