import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Import all your screens
import LoginScreen from "../app/LoginScreen";
import SignUpScreen from "../app/SignUpScreen";
import EventsScreen from "../app/EventsScreen";
import EventsFormScreen from "../app/EventsFormScreen";
import RegisterEventScreen from "../app/RegisterEventScreen";
import HomeDashboardScreen from "../app/HomeDashboardScreen"; // Make sure this path is correct

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Events: undefined;
  EventsForm: undefined;
  RegisterEvent: { eventId: string };
  HomeDashboard: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Events" component={EventsScreen} />
        <Stack.Screen name="EventsForm" component={EventsFormScreen} />
        <Stack.Screen name="RegisterEvent" component={RegisterEventScreen} />
        <Stack.Screen name="HomeDashboard" component={HomeDashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
