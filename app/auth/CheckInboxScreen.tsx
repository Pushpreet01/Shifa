import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../types/navigation";

const CheckInboxScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, "CheckInbox">>();
  return (
    <View style={styles.container}>
      <Image source={require("../../assets/logo.png")} style={styles.logo} />
      <Text style={styles.title}>Check Your Inbox</Text>
      <Text style={styles.subtitle}>
        We've sent you a password reset link. Please check your email and follow the instructions to reset your password.
      </Text>
      <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate("Login")}> 
        <Text style={styles.loginButtonText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F5E9",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#008080",
    marginBottom: 10,
  },
  subtitle: {
    color: "#008080",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: "#008080",
    paddingVertical: 12,
    paddingHorizontal: 80,
    borderRadius: 25,
    marginTop: 10,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CheckInboxScreen; 