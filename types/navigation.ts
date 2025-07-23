// Navigation type definitions
export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  CheckInbox: undefined;
};

export type HomeStackParamList = {
  HomeDashboard: undefined;
  JournalScreen: undefined;
  NewJournalEntryScreen: undefined;
  Events: { refresh?: number } | undefined;
  EventsForm: { selectedDate?: Date } | undefined;
  RegisterEvent: { eventId: string };
  Announcements: undefined;
  MyJournalsScreen: undefined;
};

export type SettingsStackParamList = {
  Settings: undefined;
  Profile: undefined;
  Feedback: undefined;
  AboutUs: undefined;
};

export type ResourcesStackParamList = {
  Resources: undefined;
};

export enum TabRoutes {
  Home = "Home",
  Settings = "Settings",
  Resources = "Resources",
}

export type RootTabParamList = {
  [TabRoutes.Home]: undefined;
  [TabRoutes.Settings]: undefined;
  [TabRoutes.Resources]: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  CheckInbox: undefined;
  HomeDashboard: undefined;
  JournalScreen: undefined;
  NewJournalEntryScreen: undefined;
  Events: { refresh?: number } | undefined;
  EventsForm: { selectedDate?: Date } | undefined;
  RegisterEvent: { eventId: string };
  Announcements: undefined;
  MyJournalsScreen: undefined;
  Settings: undefined;
  Profile: undefined;
  Feedback: undefined;
  AboutUs: undefined;
  Resources: undefined;
};

// Super Admin navigation stack
export type SuperAdminStackParamList = {
  SuperAdminDashboard: undefined;
  AdminDetails: { adminId: string };
  CreateAdmin: undefined;
  EditAdmin: { adminId: string };
};
