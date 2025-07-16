import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebaseConfig";
import { useAuth } from "../../context/AuthContext";

import { AntDesign } from "@expo/vector-icons";
import { useGoogleAuth } from "./googleAuth";

type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  RoleSelection?: undefined;
  UserSettings?: { role: string };
};

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, "Login">;

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { setUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!password) {
      newErrors.password = "Please enter your password.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

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
      setErrors({ general: errorMessage });
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

      {!!errors.general && (
        <Text style={[styles.errorText, { marginBottom: 10 }]}>
          {errors.general}
        </Text>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#008080"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) setErrors((e) => ({ ...e, email: "" }));
            if (errors.general) setErrors((e) => ({ ...e, general: "" }));
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        {errors.email && (
          <Text style={styles.errorText}>{errors.email}</Text>
        )}
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#008080"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors((e) => ({ ...e, password: "" }));
              if (errors.general) setErrors((e) => ({ ...e, general: "" }));
            }}
            secureTextEntry={!showPassword}
            style={[styles.input, { flex: 1, borderBottomWidth: 0 }]}
          />
          <TouchableOpacity
            style={styles.showPasswordButton}
            onPress={() => setShowPassword((prev) => !prev)}
          >
            <AntDesign name={showPassword ? "eye" : "eyeo"} size={20} color="#008080" />
          </TouchableOpacity>
        </View>
        <View style={styles.passwordBorder} />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}
        <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Log In</Text>
      </TouchableOpacity>

      <Text style={styles.Text}>Or</Text>

      <TouchableOpacity
        onPress={() => promptAsync()}
        style={styles.googleButton}
      >
        <Image source={require("../../assets/google-logo.png")} style={styles.googleIcon} />
        <Text style={styles.googleButtonText}>
          Continue with Google
        </Text>
      </TouchableOpacity>

      <Text style={styles.Text}>Don't have an account?</Text>

      <TouchableOpacity style={styles.signUpButton} onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.signUpButtonText}>Sign Up</Text>
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
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 30,
    width: "75%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
    width: "75%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  googleIcon: {
    width: 24,
    height: 24,
  },
  googleButtonText: {
    color: "#000000",
    marginLeft: 10,
    fontWeight: "bold",
    fontSize: 16,
  },
  signUpButton: {
    marginTop: 10,
    paddingVertical: 8,
  },
  signUpButtonText: {
    color: "#008080",
    fontSize: 14,
    fontWeight: "bold",
  },
  Text: {
    marginTop: 20,
    color: "#000000",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  errorText: {
    color: "#FF4D4D",
    fontSize: 12,
    marginTop: 4,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordBorder: {
    height: 2,
    backgroundColor: '#F6A800',
    width: '100%',
  },
  showPasswordButton: {
    padding: 8,
  },
});

export default LoginScreen;
