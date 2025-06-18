import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebaseConfig";
import { useAuth } from "../../context/AuthContext";

import { AntDesign } from "@expo/vector-icons";
import { useGoogleAuth } from "./googleAuth"; 
import { AuthStackParamList } from "../../types/navigation";

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, "Login">;

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in both email and password.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch (error: any) {
      let errorMessage = "Login failed. Please try again.";
      if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format.";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "No user found with this email.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password.";
      }
      Alert.alert("Error", errorMessage);
    }
  };

  const { promptAsync } = useGoogleAuth(() => {
    const user = auth.currentUser;
    if (user) {
      setUser(user);
    }
  });

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/logo.png")} style={styles.logo} />

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#008080"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Password"
          placeholderTextColor="#008080"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <TouchableOpacity onPress={() => navigation.navigate({ name: "ForgotPassword", params: undefined })}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Log In</Text>
      </TouchableOpacity>

      <Text style={styles.Text}>Or</Text>

      {/*  Google Sign-In Button */}
      <TouchableOpacity
        onPress={() => promptAsync()}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#DB4437",
          paddingVertical: 12,
          paddingHorizontal: 30,
          borderRadius: 25,
          marginTop: 20,
        }}
      >
        <AntDesign name="google" size={24} color="white" />
        <Text
          style={{
            color: "white",
            marginLeft: 10,
            fontWeight: "bold",
            fontSize: 16,
          }}
        >
          Continue with Google
        </Text>
      </TouchableOpacity>

      <Text style={styles.Text}>Don't have an account?</Text>

      <TouchableOpacity style={styles.signUpButton} onPress={() => navigation.navigate({ name: "SignUp", params: undefined })}>
        <Text style={styles.signUpButtonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Optional test button */}
      <TouchableOpacity
        style={[styles.signUpButton, { marginTop: 20, backgroundColor: "#F4A941" }]}
        onPress={() => {
          // @ts-ignore
          navigation.navigate({ name: "RoleSelection", params: undefined });
        }}
      >
        <Text style={styles.signUpButtonText}>Test New Signup Flow</Text>
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
    marginBottom: 80,
  },
  inputContainer: {
    width: "75%",
    marginBottom: 20,
  },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: "#F6A800",
    padding: 10,
    fontSize: 14,
    color: "#008080",
  },
  forgotPassword: {
    color: "#008080",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "right",
    marginTop: 5,
  },
  loginButton: {
    backgroundColor: "#008080",
    paddingVertical: 12,
    paddingHorizontal: 100,
    borderRadius: 25,
    marginTop: 30,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  signUpButton: {
    marginTop: 0,
  },
  signUpButtonText: {
    color: "#008080",
    fontSize: 14,
    fontWeight: "bold",
  },
  Text: {
    marginTop: 20,
    color: "#008080",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default LoginScreen;
