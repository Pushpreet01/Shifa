import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { auth } from "../config/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "../context/AuthContext";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, setUser } = useAuth();

  // Dummy credentials
  const DUMMY_CREDENTIALS = {
    email: "test@example.com",
    password: "password123",
    name: "Test User"
  };

  // Handle navigation when user is authenticated
  useEffect(() => {
    if (user) {
      navigation.replace("Events");
    }
  }, [user, navigation]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in both email and password.");
      return;
    }

    try {
      // Check for dummy credentials
      if (email === DUMMY_CREDENTIALS.email && password === DUMMY_CREDENTIALS.password) {
        // Create a dummy user object
        const dummyUser = {
          uid: "dummy-user-id",
          email: DUMMY_CREDENTIALS.email,
          displayName: DUMMY_CREDENTIALS.name
        };
        setUser(dummyUser); // Set the dummy user in context
        return;
      }

      // Regular Firebase authentication
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

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require("../assets/logo.png")} style={styles.logo} />

      {/* Email Field */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#3A7D44"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
      </View>

      {/* Password Field */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Password"
          placeholderTextColor="#3A7D44"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      {/* Log In Button */}
      <TouchableOpacity 
        style={styles.loginButton} 
        onPress={handleLogin}
        disabled={!email || !password}
      >
        <Text style={styles.loginButtonText}>Log In</Text>
      </TouchableOpacity>

      {/* Dummy credentials hint */}
      <View style={styles.dummyHint}>
        <Text style={styles.dummyHintText}>
          Test with: {DUMMY_CREDENTIALS.email} / {DUMMY_CREDENTIALS.password}
        </Text>
      </View>
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
    borderBottomColor: "#9DC08B",
    padding: 10,
    fontSize: 14,
    color: "#3A7D44",
  },
  forgotPassword: {
    color: "#000",
    fontSize: 14,
    textAlign: "right",
    marginTop: 5,
  },
  loginButton: {
    backgroundColor: "#9DC08B",
    paddingVertical: 12,
    paddingHorizontal: 100,
    borderRadius: 25,
    marginTop: 30,
  },
  loginButtonText: {
    color: "#F8F5E9",
    fontSize: 16,
    fontWeight: "bold",
  },
  dummyHint: {
    marginTop: 30,
    padding: 10,
    backgroundColor: "#E8F5E9",
    borderRadius: 5,
  },
  dummyHintText: {
    color: "#3A7D44",
    fontSize: 12,
    textAlign: "center",
  },
});

export default LoginScreen;