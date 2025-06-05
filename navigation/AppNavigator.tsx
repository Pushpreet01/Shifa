import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "../context/AuthContext";

// Import types from the new types file
import {
  AuthStackParamList,
  HomeStackParamList,
  SettingsStackParamList,
  ResourcesStackParamList,
  RootTabParamList,
  TabRoutes,
} from "../types/navigation";

// Import screens
import LoginScreen from "../app/LoginScreen";
import SignUpScreen from "../app/SignUpScreen";
import EventsScreen from "../app/EventsScreen";
import EventsFormScreen from "../app/EventsFormScreen";
import RegisterEventScreen from "../app/RegisterEventScreen";
import HomeDashboardScreen from "../app/HomeDashboardScreen";
import JournalScreen from "../app/JournalScreen";
import NewJournalEntryScreen from "../app/NewJournalEntryScreen";
<<<<<<< Updated upstream
import AnnouncementsScreen from "../app/AnnouncementsScreen";
import MyJournalsScreen from "../app/MyJournalScreen";

// Import your custom tab bar
import CustomTabBar from "./CustomTabBar"; // 👈 Custom curved bottom tab bar component

// Create individual stack navigators
=======
import ResourceScreen from "../app/ResourcesScreen";
import AddictionHelpScreen from "../app/AddictionHelpScreen";
import FindTherapistScreen from "../app/FindTherapistScreen";
import CounsellingScreen from "../app/CounsellingScreen";
import AwarenessScreen from "../app/AwarenessScreen";
import SettingsScreen from "../app/SettingsScreen"; // ✅ properly created

// Custom Tab Bar
import CustomTabBar from "./CustomTabBar";

// Tab Routes
enum TabRoutes {
  Home = "Home",
  Settings = "Settings",
  Resources = "Resources",
}

// Type Definitions
export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type HomeStackParamList = {
  HomeDashboard: undefined;
  JournalScreen: undefined;
  NewJournalEntryScreen: undefined;
  Events: undefined;
  EventsForm: undefined;
  RegisterEvent: { eventId: string };
};

export type SettingsStackParamList = {
  Settings: undefined;
};

export type ResourcesStackParamList = {
  ResourcesMain: undefined;
  AddictionHelp: undefined;
  FindTherapist: undefined;
  Counselling: undefined;
  Awareness: undefined;
};

export type RootTabParamList = {
  [TabRoutes.Home]: undefined;
  [TabRoutes.Settings]: undefined;
  [TabRoutes.Resources]: undefined;
};

// Stack Navigators
>>>>>>> Stashed changes
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
    <HomeStack.Screen
      name="NewJournalEntryScreen"
      component={NewJournalEntryScreen}
    />
    <HomeStack.Screen name="Announcements" component={AnnouncementsScreen} />
    <HomeStack.Screen name="MyJournalsScreen" component={MyJournalsScreen} />
  </HomeStack.Navigator>
);

// 👇 Settings stack includes event-related screens
const SettingsStackScreen = () => (
  <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    <SettingsStack.Screen
      name="Settings"
      component={() => <>Settings coming soon</>}
    />
=======
    <SettingsStack.Screen name="Settings" component={SettingsScreen} />
>>>>>>> Stashed changes
=======
    <SettingsStack.Screen name="Settings" component={SettingsScreen} />
>>>>>>> Stashed changes
=======
    <SettingsStack.Screen name="Settings" component={SettingsScreen} />
>>>>>>> Stashed changes
  </SettingsStack.Navigator>
);

// 👇 Placeholder Resources stack
const ResourcesStackScreen = () => (
  <ResourcesStack.Navigator screenOptions={{ headerShown: false }}>
<<<<<<< Updated upstream
    <ResourcesStack.Screen
      name="Resources"
      component={() => <>Resources coming soon</>}
    />
=======
    <ResourcesStack.Screen name="ResourcesMain" component={ResourceScreen} />
    <ResourcesStack.Screen name="AddictionHelp" component={AddictionHelpScreen} />
    <ResourcesStack.Screen name="FindTherapist" component={FindTherapistScreen} />
    <ResourcesStack.Screen name="Counselling" component={CounsellingScreen} />
    <ResourcesStack.Screen name="Awareness" component={AwarenessScreen} />
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
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
