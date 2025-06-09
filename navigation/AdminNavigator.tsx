import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import CustomTabBar from "./CustomTabBar";
import ApprovalManagementScreen from "../app/admin/ApprovalManagementScreen";
import ResourceManagementScreen from "../app/admin/ResourceManagementScreen";

// Type definitions
export type AdminStackParamList = {
  Approvals: undefined;
  Analytics: undefined;
  Settings: undefined;
  ResourceManagement: undefined;
};

const Stack = createStackNavigator<AdminStackParamList>();
const Tab = createBottomTabNavigator<AdminStackParamList>();

// Placeholder screen for Analytics
const AnalyticsScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Coming Soon</Text>
  </View>
);

// Placeholder screen for Settings
const AdminSettingsScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Admin Settings Coming Soon</Text>
  </View>
);

const AdminNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Approvals') {
            iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
          } else if (route.name === 'Analytics') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'ResourceManagement') {
            iconName = focused ? 'book' : 'book-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1B6B63',
        tabBarInactiveTintColor: '#666666',
      })}
    >
      <Tab.Screen 
        name="Approvals" 
        component={ApprovalManagementScreen}
      />
      <Tab.Screen 
        name="ResourceManagement" 
        component={ResourceManagementScreen}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsScreen}
      />
      <Tab.Screen 
        name="Settings" 
        component={AdminSettingsScreen}
      />
    </Tab.Navigator>
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
