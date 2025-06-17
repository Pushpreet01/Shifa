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
import { Picker } from "@react-native-picker/picker";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../../config/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { useGoogleAuth } from "./googleAuth"; // ✅ Reused

type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, "Signup">;

const roles = [
  { label: "Support Seeker", value: "Support Seeker" },
  { label: "Volunteer", value: "Volunteer" },
  { label: "Event Organizer", value: "Event Organizer" },
];

const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Support Seeker");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();

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
    if (!role) newErrors.role = "Role selection is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneNumberChange = (text: string) =>
    setPhoneNumber(formatPhoneNumber(text));

  const handleSignUp = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const digits = phoneNumber.replace(/\D/g, "");

      const q = query(
        collection(db, "users"),
        where("phoneNumber", "==", digits)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setErrors({
          phoneNumber:
            "This phone number is already registered. Please sign in or use a different number.",
        });
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const approved = role === "Support Seeker";

      await setDoc(doc(db, "users", user.uid), {
        fullName,
        email,
        phoneNumber: digits,
        role,
        approved,
        createdAt: new Date().toISOString(),
      });

      setUser(user);

      if (!approved) {
        setErrors({
          general:
            "Your account requires admin approval before access is granted.",
        });
      }
    } catch (error: any) {
      console.error(error);
      let errorMessage = "Sign-up failed. Please try again.";
      if (error.code === "auth/email-already-in-use") {
        setErrors({ email: "This email is already in use." });
      } else if (error.code === "auth/invalid-email") {
        setErrors({ email: "Invalid email format." });
      } else if (error.code === "auth/weak-password") {
        setErrors({ password: "Password should be at least 6 characters." });
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const { promptAsync } = useGoogleAuth(async () => {
    const user = auth.currentUser;
    if (user) {
      const userQuery = query(
        collection(db, "users"),
        where("email", "==", user.email)
      );
      const existing = await getDocs(userQuery);

      if (existing.empty) {
        await setDoc(doc(db, "users", user.uid), {
          fullName: user.displayName || "",
          email: user.email,
          phoneNumber: "",
          role: "Support Seeker",
          approved: true,
          createdAt: new Date().toISOString(),
        });
      }

      setUser(user);
    }
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
            }}
            secureTextEntry
            style={styles.input}
          />
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}
        </View>

        <Text style={styles.label}>Select Role:</Text>
        <View
          style={[
            styles.pickerContainer,
            errors.role && { borderColor: "#FF4D4D" },
          ]}
        >
          <Picker
            selectedValue={role}
            onValueChange={(itemValue) => {
              setRole(itemValue);
              if (errors.role) setErrors((e) => ({ ...e, role: "" }));
            }}
            style={styles.picker}
          >
            {roles.map((r) => (
              <Picker.Item key={r.value} label={r.label} value={r.value} />
            ))}
          </Picker>
        </View>
        {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}

        <TouchableOpacity
          style={[styles.signUpButton, loading && { opacity: 0.7 }]}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>

        <Text style={styles.Text}>Or</Text>

        {/* ✅ Google Sign-In Button */}
        <View style={{ marginVertical: 15 }}>
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
              marginTop: 5,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 3,
              elevation: 5,
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
    marginBottom: 10,
  },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: "#F6A800",
    padding: 10,
    fontSize: 14,
    color: "#008080",
  },
  label: {
    color: "#008080",
    fontWeight: "bold",
    marginBottom: 6,
    alignSelf: "flex-start",
    marginLeft: "12.5%",
  },
  pickerContainer: {
    width: "75%",
    borderWidth: 1,
    borderColor: "#008080",
    borderRadius: 4,
    marginBottom: 10,
  },
  picker: {
    color: "#008080",
  },
  signUpButton: {
    backgroundColor: "#008080",
    paddingVertical: 12,
    paddingHorizontal: 100,
    borderRadius: 25,
    marginTop: 10,
  },
  signUpButtonText: {
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
    color: "#008080",
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
});

export default SignUpScreen;
