export interface BaseEntity {
  id?: string;
  createdBy?: string;
  createdDate?: Date;
  updatedDate?: Date;
  isDeleted?: boolean;
}
