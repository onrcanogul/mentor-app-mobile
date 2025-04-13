export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  MentorProfile: { mentorId?: string };
  MenteeProfile: { menteeId?: string };
  GeneralProfile: undefined;
  Settings: undefined;
  Chat: { chatId: string };
  MentorList: undefined;
  MenteeList: undefined;
  Notifications: undefined;
  Conversations: undefined;
  AIChat: { chatId: string };
};
