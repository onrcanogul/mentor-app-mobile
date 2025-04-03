export enum UserType {
  Mentor,
  Mentee,
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  imageUrl: string;
}

export interface LoginModel {
  usernameOrEmail: string;
  password: string;
  role: UserType;
}

export interface RegisterModel {
  userName: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  userRole: UserType;
}
