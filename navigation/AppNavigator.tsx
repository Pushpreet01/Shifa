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
import MyJournalScreen from "../app/MyJournalScreen";
import NewJournalEntryScreen from "../app/NewJournalEntryScreen";
import ResourceScreen from "../app/ResourcesScreen";
import AddictionHelpScreen from "../app/AddictionHelpScreen";
import FindTherapistScreen from "../app/FindTherapistScreen";
import CounsellingScreen from "../app/CounsellingScreen";
import AwarenessScreen from "../app/AwarenessScreen";
import SettingsScreen from "../app/SettingsScreen";
import OpportunityDetailsScreen from "../app/OpportunityDetailsScreen";
import OpportunityApplicationFormScreen from "../app/OpportunityApplicationFormScreen";
import VolunteerLearningsScreen from "../app/VolunteerLearningsScreen";
import JournalScreen from "../app/JournalScreen";

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
  Announcements: undefined;
  VolunteerScreen: undefined;
  Opportunities: undefined;
  OpportunityDetails: {
    title: string;
    organization: string;
    timing: string;
    tasks?: string;
  };
  OpportunityApplicationForm: {
    title: string;
    description: string;
  };
  VolunteerLearnings: undefined;
  Emergency: undefined;
  MyJournalsScreen: undefined;
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
  SupportSystem: undefined;
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
    {/* Journal screens */}
    <HomeStack.Screen name="JournalScreen" component={JournalScreen} />
    <HomeStack.Screen name="MyJournalsScreen" component={MyJournalScreen} />
    <HomeStack.Screen
      name="NewJournalEntryScreen"
      component={NewJournalEntryScreen}
    />
    <HomeStack.Screen name="Announcements" component={AnnouncementsScreen} />
    <HomeStack.Screen name="VolunteerScreen" component={VolunteerScreen} />
    <HomeStack.Screen name="Opportunities" component={OpportunitiesScreen} />
    <HomeStack.Screen name="OpportunityDetails" component={OpportunityDetailsScreen} />
    <HomeStack.Screen name="OpportunityApplicationForm" component={OpportunityApplicationFormScreen} />
    <HomeStack.Screen name="VolunteerLearnings" component={VolunteerLearningsScreen} />
    <HomeStack.Screen name="Emergency" component={EmergencyScreen} />
  </HomeStack.Navigator>
);

const SettingsStackScreen = () => (
  <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
    <SettingsStack.Screen name="Settings" component={SettingsScreen} />
  </SettingsStack.Navigator>
);

const ResourcesStackScreen = () => (
  <ResourcesStack.Navigator screenOptions={{ headerShown: false }}>
    <ResourcesStack.Screen name="ResourcesMain" component={ResourceScreen} />
    <ResourcesStack.Screen name="AddictionHelp" component={AddictionHelpScreen} />
    <ResourcesStack.Screen name="FindTherapist" component={FindTherapistScreen} />
    <ResourcesStack.Screen name="Counselling" component={CounsellingScreen} />
    <ResourcesStack.Screen name="Awareness" component={AwarenessScreen} />
    <ResourcesStack.Screen name="SupportSystem" component={SupportSystemScreen} />
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
