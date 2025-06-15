import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import CustomTabBar from "./CustomTabBar";

// Screens
import AdminDashboardScreen from "../app/admin/AdminDashboardScreen";
import ApprovalManagementScreen from "../app/admin/ApprovalManagementScreen";
import ResourceManagementScreen from "../app/admin/ResourceManagementScreen";
import EventsScreen from "../app/admin/EventsScreen";
import AssignVolunteersScreen from "../app/admin/AssignVolunteersScreen";
import AttendanceReportScreen from "../app/admin/AttendanceReportScreen";
import UserManagementScreen from "../app/admin/UserManagementScreen";
import UserDetailsScreen from "../app/admin/UserDetailsScreen";
import AssignUserRoleScreen from "../app/admin/AssignUserRoleScreen";

export type AdminStackParamList = {
  AdminTabs: undefined;
  AdminDashboard: undefined;
  Approvals: undefined;
  Analytics: undefined;
  Settings: undefined;
  ResourceManagement: undefined;
  Events: undefined;
  AssignVolunteers: undefined;
  AttendanceReport: undefined;
  UserManagement: undefined;
  UserDetails: { userId: string };
  AssignUserRole: { user: { name: string; role: string; [key: string]: any } };
  // ...other routes
};


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<AdminStackParamList>();

const AnalyticsScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Coming Soon</Text>
  </View>
);

const AdminSettingsScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Admin Settings Coming Soon</Text>
  </View>
);

const AdminTabNavigator = () => (
  <Tab.Navigator
    initialRouteName="AdminDashboard"
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName = "";
        switch (route.name) {
          case "AdminDashboard":
            iconName = focused ? "home" : "home-outline";
            break;
          case "Approvals":
            iconName = focused ? "checkmark-circle" : "checkmark-circle-outline";
            break;
          case "Analytics":
            iconName = focused ? "stats-chart" : "stats-chart-outline";
            break;
          case "Settings":
            iconName = focused ? "settings" : "settings-outline";
            break;
          case "ResourceManagement":
            iconName = focused ? "book" : "book-outline";
            break;
          case "Events":
            iconName = focused ? "calendar" : "calendar-outline";
            break;
        }
        return <Ionicons name={iconName as any} size={size} color={color} />;
      },
      tabBarActiveTintColor: "#1B6B63",
      tabBarInactiveTintColor: "#666666",
    })}
  >
    <Tab.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    <Tab.Screen name="Approvals" component={ApprovalManagementScreen} />
    <Tab.Screen name="ResourceManagement" component={ResourceManagementScreen} />
    <Tab.Screen name="Events" component={EventsScreen} />
    <Tab.Screen name="Analytics" component={AnalyticsScreen} />
    <Tab.Screen name="Settings" component={AdminSettingsScreen} />
  </Tab.Navigator>
);

// Main stack including User-related screens
const AdminNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
      <Stack.Screen name="AssignVolunteers" component={AssignVolunteersScreen} />
      <Stack.Screen name="AttendanceReport" component={AttendanceReportScreen} />
      <Stack.Screen name="UserManagement" component={UserManagementScreen} />
      <Stack.Screen name="UserDetails" component={UserDetailsScreen} />
      <Stack.Screen name="AssignUserRole" component={AssignUserRoleScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666666",
  },
});

export default AdminNavigator;
