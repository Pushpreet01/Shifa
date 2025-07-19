import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// Screens
import EventsScreen from "../app/event/EventsScreen";
import EventsFormScreen from "../app/event/EventsFormScreen";
import RegisterEventScreen from "../app/event/RegisterEventScreen";
import HomeDashboardScreen from "../app/HomeDashboardScreen";
import MyJournalScreen from "../app/journal/MyJournalScreen";
import NewJournalEntryScreen from "../app/journal/NewJournalEntryScreen";
import ResourceScreen from "../app/resources/ResourcesScreen";
import AddictionHelpScreen from "../app/resources/AddictionHelpScreen";
import FindTherapistScreen from "../app/resources/FindTherapistScreen";
import CounsellingScreen from "../app/resources/CounsellingScreen";
import AwarenessScreen from "../app/resources/AwarenessScreen";
import SettingsScreen from "../app/settings/SettingsScreen";
import OpportunityDetailsScreen from "../app/volunteer/OpportunityDetailsScreen";
import OpportunityApplicationFormScreen from "../app/volunteer/OpportunityApplicationFormScreen";
import VolunteerLearningsScreen from "../app/volunteer/VolunteerLearningsScreen";
import JournalScreen from "../app/journal/JournalScreen";
import AnnouncementsScreen from "../app/header/AnnouncementsScreen";
import VolunteerScreen from "../app/volunteer/VolunteerScreen";
import OpportunitiesScreen from "../app/volunteer/OpportunitiesScreen";
import EmergencyScreen from "../app/header/EmergencyScreen";
import SupportSystemScreen from "../app/resources/SupportSystemScreen";
import VolunteerRewardsScreen from "../app/volunteer/VolunteerRewardsScreen";
import ProfileScreen from "../app/settings/ProfileScreen";
import FeedbackScreen from "../app/settings/FeedbackScreen";
import AboutUsScreen from "../app/settings/AboutUsScreen";


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
  Events: { refresh?: boolean } | undefined;
  EventsForm: { selectedDate?: Date } | undefined;
  RegisterEvent: { eventId: string };
  JournalScreen: undefined;
  MyJournalsScreen: undefined;
  NewJournalEntryScreen: {
    entry?: {
      id: string;
      title: string;
      body: string;
    };
  };

  Announcements: undefined;
  VolunteerScreen: undefined;
  Opportunities: undefined;
  OpportunityDetails: {
    title: string;
    timing: string;
    eventId: string;
    opportunityId: string; // Added and required
    description: string;
    date?: string;
    location?: string;
  };
  OpportunityApplicationForm: {
    opportunityId: string;
    eventId: string;
    title: string;
    description: string;
    timing: string;
    date?: string;
    location?: string;
  };
  VolunteerLearnings: undefined;
  Emergency: undefined;
  VolunteerRewards: undefined;
};

export type SettingsStackParamList = {
  Settings: undefined;
  Profile: undefined;
  Feedback: undefined;
  AboutUs: undefined;
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
    <HomeStack.Screen
      name="Events"
      component={EventsScreen}
      options={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: "horizontal",
        headerLeft: () => null, // This removes the back button
        headerBackTitle: null,
      }}
      listeners={({ navigation }) => ({
        beforeRemove: (e) => {
          // Prevent the default back action
          e.preventDefault();
          // Navigate to HomeDashboard instead
          navigation.navigate("HomeDashboard");
        },
      })}
    />
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
    <SettingsStack.Screen name="AboutUs" component={AboutUsScreen} />
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
    <Tab.Screen
      name={TabRoutes.Resources}
      component={ResourcesStackScreen}
      options={{
        unmountOnBlur: true, // This will reset the Resources stack when switching tabs
      }}
    />
    <Tab.Screen
      name={TabRoutes.Home}
      component={HomeStackScreen}
      options={{
        unmountOnBlur: false, // Keep Home stack mounted to preserve state
      }}
    />
    <Tab.Screen
      name={TabRoutes.Settings}
      component={SettingsStackScreen}
      options={{
        unmountOnBlur: true, // This will reset the Settings stack when switching tabs
      }}
    />
  </Tab.Navigator>
);

export default TabNavigator;
