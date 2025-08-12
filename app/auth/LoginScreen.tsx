import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";

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
  const { signOut } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Fetch approvalStatus from Firestore
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;
      const approvalStatus = userData?.approvalStatus;
      if (!approvalStatus || approvalStatus.status === "Pending") {
        setErrors({ general: "Your account is pending admin approval. You can sign out and try with a different account while waiting." });
        setLoading(false);
        return;
      } else if (approvalStatus.status === "Rejected") {
        setErrors({ general: approvalStatus.reason ? `Account rejected: ${approvalStatus.reason}. You can sign out and try with a different account.` : "Your account was rejected by the admin. You can sign out and try with a different account." });
        setLoading(false);
        return;
      } else if (approvalStatus.status === "Approved") {
        // Don't set user here - let AuthContext handle it through onAuthStateChanged
        // The AuthContext will automatically set the user with role when Firebase auth state changes
      } else {
        setErrors({ general: "Unknown approval status. Please contact support." });
        setLoading(false);
        return;
      }
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
    } finally {
      setLoading(false);
    }
  };

  const { promptAsync } = useGoogleAuth(() => {
    // Don't set user here - let AuthContext handle it through onAuthStateChanged
    // The AuthContext will automatically set the user with role when Firebase auth state changes
  });

  return (
    <View style={styles.container}>
      {/* Loading Spinner Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#008080" />
        </View>
      )}
      <Image source={require("../../assets/logo.png")} style={styles.logo} />

      {!!errors.general && (
        <Text style={[styles.errorText, { marginBottom: 10 }]}>
          {errors.general}
        </Text>
      )}

      {/* Sign Out Button for Pending/Rejected Users */}
      {(errors.general?.includes("pending admin approval") || errors.general?.includes("rejected")) && (
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={async () => {
            try {
              await signOut();
              setErrors({});
            } catch (error) {
              console.error("Error signing out:", error);
            }
          }}
        >
          <Text style={styles.signOutButtonText}>Sign Out & Try Different Account</Text>
        </TouchableOpacity>
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
        onPress={() => promptAsync({ useProxy: false, showInRecents: true })}
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
  signOutButton: {
    backgroundColor: "#C44536",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  signOutButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});

export default LoginScreen;
