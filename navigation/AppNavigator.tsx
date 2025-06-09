import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// Screens
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
import AnnouncementsScreen from "../app/AnnouncementsScreen";
import VolunteerScreen from "../app/VolunteerScreen";
import OpportunitiesScreen from "../app/OpportunitiesScreen";
import EmergencyScreen from "../app/EmergencyScreen";
import SupportSystemScreen from "../app/SupportSystemScreen";
import VolunteerRewardsScreen from "../app/VolunteerRewardsScreen";
import ProfileScreen from "../app/ProfileScreen";
import FeedbackScreen from "../app/FeedbackScreen";

// Custom Tab Bar
import CustomTabBar from "./CustomTabBar";

// Tab Routes
enum TabRoutes {
  Home = "Home",
  Settings = "Settings",
  Resources = "Resources",
}

// Stack Param Lists
export type HomeStackParamList = {
  HomeDashboard: undefined;
  Events: undefined;
  EventsForm: undefined;
  RegisterEvent: { eventId: string };
  JournalScreen: undefined;
  MyJournalsScreen: undefined;
  NewJournalEntryScreen: undefined;
  Announcements: undefined;
  VolunteerScreen: undefined;
  Opportunities: undefined;
  OpportunityDetails: {
    title: string;
    organization: string;
    timing: string;
    tasks: string[];
  };
  OpportunityApplicationForm: undefined;
  VolunteerLearnings: undefined;
  Emergency: undefined;
  VolunteerRewards: undefined;
};

export type SettingsStackParamList = {
  Settings: undefined;
  Profile: undefined;
  Feedback: undefined;
};

export type ResourcesStackParamList = {
  Resources: undefined;
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
    <HomeStack.Screen name="MyJournalsScreen" component={MyJournalScreen} />
    <HomeStack.Screen
      name="NewJournalEntryScreen"
      component={NewJournalEntryScreen}
    />
    <HomeStack.Screen name="Announcements" component={AnnouncementsScreen} />
    <HomeStack.Screen name="VolunteerScreen" component={VolunteerScreen} />
    <HomeStack.Screen name="Opportunities" component={OpportunitiesScreen} />
    <HomeStack.Screen
      name="OpportunityDetails"
      component={OpportunityDetailsScreen}
    />
    <HomeStack.Screen
      name="OpportunityApplicationForm"
      component={OpportunityApplicationFormScreen}
    />
    <HomeStack.Screen
      name="VolunteerLearnings"
      component={VolunteerLearningsScreen}
    />
    <HomeStack.Screen name="Emergency" component={EmergencyScreen} />
    <HomeStack.Screen
      name="VolunteerRewards"
      component={VolunteerRewardsScreen}
    />
  </HomeStack.Navigator>
);

const SettingsStackScreen = () => (
  <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
    <SettingsStack.Screen name="Settings" component={SettingsScreen} />
    <SettingsStack.Screen name="Profile" component={ProfileScreen} />
    <SettingsStack.Screen name="Feedback" component={FeedbackScreen} />
  </SettingsStack.Navigator>
);

const ResourcesStackScreen = () => (
  <ResourcesStack.Navigator screenOptions={{ headerShown: false }}>
    <ResourcesStack.Screen name="Resources" component={ResourceScreen} />
    <ResourcesStack.Screen
      name="AddictionHelp"
      component={AddictionHelpScreen}
    />
    <ResourcesStack.Screen
      name="FindTherapist"
      component={FindTherapistScreen}
    />
    <ResourcesStack.Screen name="Counselling" component={CounsellingScreen} />
    <ResourcesStack.Screen name="Awareness" component={AwarenessScreen} />
    <ResourcesStack.Screen
      name="SupportSystem"
      component={SupportSystemScreen}
    />
  </ResourcesStack.Navigator>
);

// Tab Navigator
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

export default TabNavigator;
