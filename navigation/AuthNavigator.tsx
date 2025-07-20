// navigation/AuthNavigator.tsx
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../app/auth/LoginScreen";
import SignUpScreen from "../app/auth/SignUpScreen";
import ForgotPasswordScreen from "../app/auth/ForgotPassword";
import RoleSelectionScreen from "../app/auth/RoleSelectionScreen";
import UserSettingsScreen from "../app/auth/UserSettingsScreen";
import EmailVerificationScreen from "../app/auth/EmailVerificationScreen";
import { useAuth } from "../context/AuthContext";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const AuthStack = createStackNavigator();

const RoleErrorScreen = () => {
  const { errorMsg, signOut } = useAuth();
  const navigation = useNavigation();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#C44536" />
      </View>
      <Text style={styles.errorText}>{errorMsg || "Unauthorized access."}</Text>
      <Text style={styles.subText}>Please contact support for assistance.</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const AuthNavigator = () => {
  const { errorMsg, user } = useAuth();
  const navigation = useNavigation();

  React.useEffect(() => {
    if (errorMsg === "Please verify your email address to continue." && user?.email) {
      (navigation as any).reset({
        index: 0,
        routes: [
          { name: "EmailVerification", params: { email: user.email } },
        ],
      });
    }
  }, [errorMsg, user, navigation]);

  if (errorMsg && errorMsg !== "Please verify your email address to continue.") {
    return <RoleErrorScreen />;
  }

  return (
    <AuthStack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignUpScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      {/* Test screens - will be removed when integrating into main flow */}
      <AuthStack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <AuthStack.Screen name="UserSettings" component={UserSettingsScreen} />
      <AuthStack.Screen name="EmailVerification" component={EmailVerificationScreen} />
    </AuthStack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F8F5E9",
  },
  iconContainer: {
    marginBottom: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#C44536",
    textAlign: "center",
  },
  subText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
    gap: 0,
    alignItems: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C44536",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#1B6B63",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: "#1B6B63",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default AuthNavigator;
