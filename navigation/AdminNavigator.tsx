import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import CustomTabBar from './CustomTabBar';

// Home Screens
import AdminDashboardScreen from '../app/admin/AdminDashboardScreen';
import ApprovalManagementScreen from '../app/admin/ApprovalManagementScreen';
import ResourceManagementScreen from '../app/admin/ResourceManagementScreen';
import EventsScreen from '../app/admin/EventsScreen';
import AssignVolunteersScreen from '../app/admin/AssignVolunteersScreen';
import AttendanceReportScreen from '../app/admin/AttendanceReportScreen';
import UserManagementScreen from '../app/admin/UserManagementScreen';
import UserDetailsScreen from '../app/admin/UserDetailsScreen';
import AssignUserRoleScreen from '../app/admin/AssignUserRoleScreen';

// Settings Screens
import SettingsScreen from '../app/admin/SettingsScreen';
import ProfileScreen from '../app/admin/ProfileScreen';

// Types for user
export type UserType = {
  id: string;
  name: string;
  role: string;
  email?: string;
  [key: string]: any;
};

// Main admin stack
export type AdminStackParamList = {
  AdminTabs: undefined;
  AdminDashboard: undefined;
  Approvals: undefined;
  ResourceManagement: undefined;
  Events: undefined;
  AssignVolunteers: undefined;
  AttendanceReport: undefined;
  UserManagement: undefined;
  UserDetails: { userId: string };
  AssignUserRole: { user: UserType };
};

// Other stacks
export type ComposeStackParamList = {
  Compose1: undefined;
  Compose2: undefined;
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator();
const AdminStack = createNativeStackNavigator<AdminStackParamList>();
const ComposeStack = createNativeStackNavigator<ComposeStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

const PlaceholderScreen = ({ title }: { title: string }) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>{title}</Text>
  </View>
);

const AdminHomeStackScreen = () => (
  <AdminStack.Navigator screenOptions={{ headerShown: false }}>
    <AdminStack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    <AdminStack.Screen name="Approvals" component={ApprovalManagementScreen} />
    <AdminStack.Screen name="ResourceManagement" component={ResourceManagementScreen} />
    <AdminStack.Screen name="Events" component={EventsScreen} />
    <AdminStack.Screen name="AssignVolunteers" component={AssignVolunteersScreen} />
    <AdminStack.Screen name="AttendanceReport" component={AttendanceReportScreen} />
    <AdminStack.Screen name="UserManagement" component={UserManagementScreen} />
    <AdminStack.Screen name="UserDetails" component={UserDetailsScreen} />
    <AdminStack.Screen name="AssignUserRole" component={AssignUserRoleScreen} />
  </AdminStack.Navigator>
);

const ComposeStackScreen = () => (
  <ComposeStack.Navigator screenOptions={{ headerShown: false }}>
    <ComposeStack.Screen name="Compose1" children={() => <PlaceholderScreen title="Compose 1" />} />
    <ComposeStack.Screen name="Compose2" children={() => <PlaceholderScreen title="Compose 2" />} />
  </ComposeStack.Navigator>
);

const SettingsStackScreen = () => (
  <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
    <SettingsStack.Screen name="SettingsHome" component={SettingsScreen} />
    <SettingsStack.Screen name="Profile" component={ProfileScreen} />
  </SettingsStack.Navigator>
);

const AdminTabNavigator = () => (
  <Tab.Navigator
    initialRouteName="Home"
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="Compose" component={ComposeStackScreen} />
    <Tab.Screen name="Home" component={AdminHomeStackScreen} />
    <Tab.Screen name="Settings" component={SettingsStackScreen} />
  </Tab.Navigator>
);

const AdminNavigator = () => {
  return <AdminTabNavigator />;
};

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666666',
  },
});

export default AdminNavigator;
