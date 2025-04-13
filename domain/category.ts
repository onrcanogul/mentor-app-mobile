import { BaseEntity } from "./base/baseEntity";

export interface Category extends BaseEntity {
  name: string;
  localizationCode?: string;
}
