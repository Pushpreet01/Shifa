import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "../context/AuthContext";

// Import screens
import LoginScreen from "../app/LoginScreen";
import SignUpScreen from "../app/SignUpScreen";
import EventsScreen from "../app/EventsScreen";
import EventsFormScreen from "../app/EventsFormScreen";
import RegisterEventScreen from "../app/RegisterEventScreen";
import HomeDashboardScreen from "../app/HomeDashboardScreen";
import JournalScreen from "../app/JournalScreen";
import NewJournalEntryScreen from "../app/NewJournalEntryScreen";
import AnnouncementsScreen from "../app/AnnouncementsScreen";
import VolunteerScreen from "../app/VolunteerScreen";
import OpportunitiesScreen from "../app/OpportunitiesScreen";
import EmergencyScreen from "../app/EmergencyScreen";

// Import your custom tab bar
import CustomTabBar from "./CustomTabBar"; // 👈 Custom curved bottom tab bar component

// Route names used in the bottom tab navigator
enum TabRoutes {
  Home = "Home",
  Settings = "Settings",
  Resources = "Resources",
}

// Type definitions for navigation stacks
export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type HomeStackParamList = {
  HomeDashboard: undefined;
  JournalScreen: undefined;
  NewJournalEntryScreen: undefined;
  Events: { refresh?: number } | undefined;
  EventsForm: undefined;
  RegisterEvent: { eventId: string };
  Announcements: undefined;
  VolunteerScreen: undefined;
  Opportunities: undefined;
  Emergency: undefined;
};

export type SettingsStackParamList = {
  Settings: undefined;
};

export type ResourcesStackParamList = {
  Resources: undefined;
};

export type RootTabParamList = {
  [TabRoutes.Home]: undefined;
  [TabRoutes.Settings]: undefined;
  [TabRoutes.Resources]: undefined;
};

// Create individual stack navigators
const AuthStack = createStackNavigator<AuthStackParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const SettingsStack = createStackNavigator<SettingsStackParamList>();
const ResourcesStack = createStackNavigator<ResourcesStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

// 👇 Home stack contains screens related to dashboard and journaling
const HomeStackScreen = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    {/* Main dashboard screen */}
    <HomeStack.Screen name="HomeDashboard" component={HomeDashboardScreen} />
    {/* Events screen */}
    <HomeStack.Screen name="Events" component={EventsScreen} />
    <HomeStack.Screen name="EventsForm" component={EventsFormScreen} />
    <HomeStack.Screen name="RegisterEvent" component={RegisterEventScreen} />
    {/* Journal listing screen */}
    <HomeStack.Screen name="JournalScreen" component={JournalScreen} />
    {/* New journal entry screen */}
    <HomeStack.Screen name="NewJournalEntryScreen" component={NewJournalEntryScreen} />
    <HomeStack.Screen name="Announcements" component={AnnouncementsScreen} />
    <HomeStack.Screen name="VolunteerScreen" component={VolunteerScreen} />
    <HomeStack.Screen name="Opportunities" component={OpportunitiesScreen} />
    <HomeStack.Screen name="Emergency" component={EmergencyScreen} />
  </HomeStack.Navigator>
);

// 👇 Settings stack includes event-related screens
const SettingsStackScreen = () => (
  <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
    <SettingsStack.Screen
      name="Settings"
      component={() => <>Settings coming soon</>}
    />
  </SettingsStack.Navigator>
);

// 👇 Placeholder Resources stack
const ResourcesStackScreen = () => (
  <ResourcesStack.Navigator screenOptions={{ headerShown: false }}>
    <ResourcesStack.Screen
      name="Resources"
      component={() => <>Resources coming soon</>}
    />
  </ResourcesStack.Navigator>
);

// 👇 Bottom tab navigator using the custom curved tab bar
const TabNavigator = () => (
  <Tab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
    initialRouteName={TabRoutes.Home}
  >
    <Tab.Screen name={TabRoutes.Resources} component={ResourcesStackScreen} />
    <Tab.Screen name={TabRoutes.Home} component={HomeStackScreen} />
    <Tab.Screen name={TabRoutes.Settings} component={SettingsStackScreen} />
  </Tab.Navigator>
);

// 👇 Authentication stack for login/signup flow
const AuthStackScreen = () => (
  <AuthStack.Navigator
    initialRouteName="Login"
    screenOptions={{ headerShown: false }}
  >
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="SignUp" component={SignUpScreen} />
  </AuthStack.Navigator>
);

// 👇 Main app navigator - decides between auth and main app flow
const AppNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      {isAuthenticated ? <TabNavigator /> : <AuthStackScreen />}
    </NavigationContainer>
  );
};

export default AppNavigator;
