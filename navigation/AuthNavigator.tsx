// navigation/AuthNavigator.tsx
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../app/auth/LoginScreen";
import SignUpScreen from "../app/auth/SignUpScreen";
import RoleSelectionScreen from "../app/auth/RoleSelectionScreen";
import UserSettingsScreen from "../app/auth/UserSettingsScreen";
import ForgotPasswordScreen from "../app/auth/ForgotPasswordScreen";
import CheckInboxScreen from "../app/auth/CheckInboxScreen";
import { useAuth } from "../context/AuthContext";
import { View, Text, StyleSheet } from "react-native";

const AuthStack = createStackNavigator();

const RoleErrorScreen = () => {
  const { errorMsg } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.errorText}>{errorMsg || "Unauthorized access."}</Text>
      <Text>Please contact support for assistance.</Text>
    </View>
  );
};

const AuthNavigator = () => {
  const { errorMsg } = useAuth();

  if (errorMsg) {
    return <RoleErrorScreen />;
  }

  return (
    <AuthStack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignUpScreen} />
      {/* Test screens - will be removed when integrating into main flow */}
      <AuthStack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <AuthStack.Screen name="UserSettings" component={UserSettingsScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="CheckInbox" component={CheckInboxScreen} />
    </AuthStack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "red",
  },
});

export default AuthNavigator;
