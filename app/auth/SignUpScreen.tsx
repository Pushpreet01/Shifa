import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { useGoogleAuth } from "./googleAuth";

type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  RoleSelection: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
  };
  UserSettings: { role: string; fullName: string; email: string; phoneNumber: string; password: string };
};

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, "Signup">;

const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const formatPhoneNumber = (input: string) => {
    const digits = input.replace(/\D/g, "");
    let formatted = digits;
    if (digits.length >= 4)
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}`;
    if (digits.length >= 7) formatted += `-${digits.slice(6, 10)}`;
    return formatted;
  };

  const validatePhoneNumber = (phone: string) =>
    phone.replace(/\D/g, "").length === 10;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!fullName.trim()) newErrors.fullName = "Full name is required.";
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Email format is invalid.";
    if (!phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required.";
    else if (!validatePhoneNumber(phoneNumber))
      newErrors.phoneNumber = "Phone number must have exactly 10 digits.";
    if (!password) newErrors.password = "Password is required.";
    else if (password.length < 6)
      newErrors.password = "Password should be at least 6 characters.";
    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password.";
    else if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";
    // The original code had a role selection, but the new_code removed it.
    // Assuming role is no longer a field, so this validation is removed.
    // if (!role) newErrors.role = "Role selection is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneNumberChange = (text: string) =>
    setPhoneNumber(formatPhoneNumber(text));

  const handleContinue = () => {
    if (!validate()) return;
    setLoading(true);
    navigation.navigate("RoleSelection", {
      fullName,
      email,
      phoneNumber: phoneNumber.replace(/\D/g, ""),
      password,
    });
    setLoading(false);
  };

  const { promptAsync } = useGoogleAuth(async () => {
    navigation.navigate("RoleSelection", {
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
    });
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#F8F5E9" }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress Tracker */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: "33%" }]} />
            <View style={[styles.progressBar, styles.inactiveBar, { width: "67%" }]} />
          </View>
          <View style={styles.circleContainer}>
            <View style={[styles.circle, styles.activeCircle, styles.enlargedCircle]}>
              <Text style={styles.circleText}>1</Text>
            </View>
            <View style={styles.circle} />
            <View style={styles.circle} />
          </View>
          <Text style={styles.progressText}>Step 1 of 3</Text>
        </View>

        <Image source={require("../../assets/logo.png")} style={styles.logo} />

        {!!errors.general && (
          <Text style={[styles.errorText, { marginBottom: 10 }]}>
            {errors.general}
          </Text>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#008080"
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              if (errors.fullName) setErrors((e) => ({ ...e, fullName: "" }));
            }}
            style={styles.input}
          />
          {errors.fullName && (
            <Text style={styles.errorText}>{errors.fullName}</Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Email ID"
            placeholderTextColor="#008080"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors((e) => ({ ...e, email: "" }));
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
          <TextInput
            placeholder="Phone Number"
            placeholderTextColor="#008080"
            value={phoneNumber}
            onChangeText={handlePhoneNumberChange}
            keyboardType="phone-pad"
            style={styles.input}
            maxLength={14}
          />
          {errors.phoneNumber && (
            <Text style={styles.errorText}>{errors.phoneNumber}</Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Create Password"
            placeholderTextColor="#008080"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors((e) => ({ ...e, password: "" }));
              if (errors.confirmPassword) setErrors((e) => ({ ...e, confirmPassword: "" }));
            }}
            secureTextEntry={!showPassword}
            style={styles.input}
            contextMenuHidden={true}
            autoCorrect={false}
            autoComplete="off"
            importantForAutofill="no"
          />
          <TouchableOpacity
            style={styles.showPasswordButton}
            onPress={() => setShowPassword((prev) => !prev)}
          >
            <AntDesign name={showPassword ? "eye" : "eyeo"} size={20} color="#008080" />
          </TouchableOpacity>
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#008080"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) setErrors((e) => ({ ...e, confirmPassword: "" }));
            }}
            secureTextEntry={!showConfirmPassword}
            style={styles.input}
            contextMenuHidden={true}
            autoCorrect={false}
            autoComplete="off"
            importantForAutofill="no"
          />
          <TouchableOpacity
            style={styles.showPasswordButton}
            onPress={() => setShowConfirmPassword((prev) => !prev)}
          >
            <AntDesign name={showConfirmPassword ? "eye" : "eyeo"} size={20} color="#008080" />
          </TouchableOpacity>
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.continueButton, loading && { opacity: 0.7 }]}
          onPress={handleContinue}
          disabled={loading}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        <View style={{ marginVertical: 15 }}>
          <TouchableOpacity
            onPress={() => promptAsync()}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FFFFFF",
              paddingVertical: 12,
              paddingHorizontal: 40,
              borderRadius: 25,
              marginTop: 5,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 3,
              elevation: 5,
            }}
          >
            <Image
              source={require("../../assets/google-logo.png")}
              style={{ width: 24, height: 24 }}
            />
            <Text
              style={{
                color: "#000000",
                marginLeft: 10,
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              Continue with Google
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.Text}>Already have an account?</Text>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("Login")}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F8F5E9",
    alignItems: "center",
    padding: 20,
  },
  progressContainer: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 30,
  },
  progressBarContainer: {
    position: "relative",
    width: 300,
    height: 6,
    flexDirection: "row",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#1B6B63",
  },
  inactiveBar: {
    backgroundColor: "#E0E0E0",
  },
  circleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 300,
    position: "absolute",
    top: 0,
    left: 0,
  },
  circle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    top: -6,
  },
  activeCircle: {
    backgroundColor: "#1B6B63",
  },
  enlargedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    top: -9,
  },
  circleText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  progressText: {
    color: "#1B6B63",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 50,
  },
  inputContainer: {
    width: "75%",
    marginBottom: 10,
    position: "relative", // Added for show password button positioning
  },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: "#F6A800",
    padding: 10,
    fontSize: 14,
    color: "#008080",
  },
  continueButton: {
    backgroundColor: "#008080",
    paddingVertical: 12,
    paddingHorizontal: 100,
    borderRadius: 25,
    marginTop: 10,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginButton: {
    marginTop: 0,
  },
  loginButtonText: {
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
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  showPasswordButton: {
    position: 'absolute',
    right: 0,
    top: 10,
    padding: 8,
  },
});

export default SignUpScreen;