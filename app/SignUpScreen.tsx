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
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { auth, db } from "../config/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

type Props = NativeStackScreenProps<RootStackParamList, "SignUp">;

const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useAuth();

  const formatPhoneNumber = (input: string) => {
    // Remove all non-digit characters
    const digits = input.replace(/\D/g, "");

    // Format the digits into (XXX) XXX-XXXX
    let formatted = "";
    if (digits.length > 0) {
      formatted = "(" + digits.substring(0, 3);
    }
    if (digits.length >= 4) {
      formatted = formatted.substring(0, 4) + ") " + digits.substring(3, 6);
    }
    if (digits.length >= 7) {
      formatted = formatted.substring(0, 9) + "-" + digits.substring(6, 10);
    }

    return formatted;
  };

  const validatePhoneNumber = (phone: string) => {
    // Extract digits and check if we have exactly 10
    const digits = phone.replace(/\D/g, "");
    return digits.length === 10;
  };

  const handlePhoneNumberChange = (text: string) => {
    const formattedPhone = formatPhoneNumber(text);
    setPhoneNumber(formattedPhone);
  };

  const handleSignUp = async () => {
    if (!fullName || !email || !phoneNumber || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    // Validate phone number 
    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert("Error", "Phone number must contain exactly 10 digits.");
      return;
    }

    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store additional user details in Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullName,
        email,
        phoneNumber,
        createdAt: new Date().toISOString(),
      });

      setUser(user);
      navigation.replace("Events");
    } catch (error: any) {
      let errorMessage = "Sign-up failed. Please try again.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already in use.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters.";
      }
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require("../assets/logo.png")} style={styles.logo} />

      {/* Full Name Field */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Full Name"
          placeholderTextColor="#3A7D44"
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
        />
      </View>

      {/* Email Field */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email ID"
          placeholderTextColor="#3A7D44"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
      </View>

      {/* Phone Number Field */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Phone Number"
          placeholderTextColor="#3A7D44"
          value={phoneNumber}
          onChangeText={handlePhoneNumberChange}
          keyboardType="phone-pad"
          style={styles.input}
          maxLength={14} // (XXX) XXX-XXXX is 14 characters
        />
      </View>

      {/* Password Field */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Create Password"
          placeholderTextColor="#3A7D44"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity
        style={styles.signUpButton}
        onPress={handleSignUp}
      >
        <Text style={styles.signUpButtonText}>Sign Up</Text>
      </TouchableOpacity>

      <Text style={styles.Text}>Already have an account?</Text>

      {/* Log In Button */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.loginButtonText}>Log In</Text>
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
    borderBottomColor: "#9DC08B",
    padding: 10,
    fontSize: 14,
    color: "#3A7D44",
  },
  signUpButton: {
    backgroundColor: "#9DC08B",
    paddingVertical: 12,
    paddingHorizontal: 100,
    borderRadius: 25,
    marginTop: 10,
  },
  signUpButtonText: {
    color: "#F8F5E9",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginButton: {
    marginTop: 0,
  },
  loginButtonText: {
    color: "#3A7D44",
    fontSize: 14,
    fontWeight: "bold",
  },
  Text: {
    marginTop: 20,
    color: "#3A7D44",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default SignUpScreen;