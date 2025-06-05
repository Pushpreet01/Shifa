import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "../context/AuthContext";

// Screens
import LoginScreen from "../app/LoginScreen";
import SignUpScreen from "../app/SignUpScreen";
import EventsScreen from "../app/EventsScreen";
import EventsFormScreen from "../app/EventsFormScreen";
import RegisterEventScreen from "../app/RegisterEventScreen";
import HomeDashboardScreen from "../app/HomeDashboardScreen";
import JournalScreen from "../app/JournalScreen";
import NewJournalEntryScreen from "../app/NewJournalEntryScreen";
import ResourceScreen from "../app/ResourcesScreen";
import AddictionHelpScreen from "../app/AddictionHelpScreen";


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
  ResourcesMain: undefined; // updated name
   AddictionHelp: undefined;

};

export type RootTabParamList = {
  [TabRoutes.Home]: undefined;
  [TabRoutes.Settings]: undefined;
  [TabRoutes.Resources]: undefined;
};

// Stack Navigators
const AuthStack = createStackNavigator<AuthStackParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const SettingsStack = createStackNavigator<SettingsStackParamList>();
const ResourcesStack = createStackNavigator<ResourcesStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

const HomeStackScreen = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeDashboard" component={HomeDashboardScreen} />
    <HomeStack.Screen name="Events" component={EventsScreen} />
    <HomeStack.Screen name="EventsForm" component={EventsFormScreen} />
    <HomeStack.Screen name="RegisterEvent" component={RegisterEventScreen} />
    <HomeStack.Screen name="JournalScreen" component={JournalScreen} />
    <HomeStack.Screen name="NewJournalEntryScreen" component={NewJournalEntryScreen} />
  </HomeStack.Navigator>
);

const SettingsStackScreen = () => (
  <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
    <SettingsStack.Screen name="Settings" component={() => <>Settings coming soon</>} />
  </SettingsStack.Navigator>
);

const ResourcesStackScreen = () => (
  <ResourcesStack.Navigator screenOptions={{ headerShown: false }}>
    <ResourcesStack.Screen name="ResourcesMain" component={ResourceScreen} />
    <ResourcesStack.Screen name="AddictionHelp" component={AddictionHelpScreen} />
  </ResourcesStack.Navigator>
);

// Tab Navigator
const TabNavigator = () => (
  <Tab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
    initialRouteName="Home"
  >
    <Tab.Screen name={TabRoutes.Resources} component={ResourcesStackScreen} />
    <Tab.Screen name={TabRoutes.Home} component={HomeStackScreen} />
    <Tab.Screen name={TabRoutes.Settings} component={SettingsStackScreen} />
  </Tab.Navigator>
);

// Auth Navigator
const AuthStackScreen = () => (
  <AuthStack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="SignUp" component={SignUpScreen} />
  </AuthStack.Navigator>
);

// App Navigator
const AppNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      {isAuthenticated ? <TabNavigator /> : <AuthStackScreen />}
    </NavigationContainer>
  );
};

export default AppNavigator;
