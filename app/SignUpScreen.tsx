// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   StyleSheet,
//   Alert,
// } from "react-native";
// import { NativeStackScreenProps } from "@react-navigation/native-stack";
// import { RootStackParamList } from "../navigation/AppNavigator";
// import { auth, db } from "../config/firebaseConfig";
// import { createUserWithEmailAndPassword } from "firebase/auth";
// import { doc, setDoc } from "firebase/firestore";
// import { useAuth } from "../context/AuthContext";

// type Props = NativeStackScreenProps<RootStackParamList, "SignUp">;

// const SignUpScreen: React.FC<Props> = ({ navigation }) => {
//   const [fullName, setFullName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [password, setPassword] = useState("");
//   const { setUser } = useAuth();

//   const formatPhoneNumber = (input: string) => {
//     // Remove all non-digit characters
//     const digits = input.replace(/\D/g, "");

//     // Format the digits into (XXX) XXX-XXXX
//     let formatted = "";
//     if (digits.length > 0) {
//       formatted = "(" + digits.substring(0, 3);
//     }
//     if (digits.length >= 4) {
//       formatted = formatted.substring(0, 4) + ") " + digits.substring(3, 6);
//     }
//     if (digits.length >= 7) {
//       formatted = formatted.substring(0, 9) + "-" + digits.substring(6, 10);
//     }

//     return formatted;
//   };

//   const validatePhoneNumber = (phone: string) => {
//     // Extract digits and check if we have exactly 10
//     const digits = phone.replace(/\D/g, "");
//     return digits.length === 10;
//   };

//   const handlePhoneNumberChange = (text: string) => {
//     const formattedPhone = formatPhoneNumber(text);
//     setPhoneNumber(formattedPhone);
//   };

//   const handleSignUp = async () => {
//     if (!fullName || !email || !phoneNumber || !password) {
//       Alert.alert("Error", "Please fill in all fields.");
//       return;
//     }

//     // Validate phone number 
//     if (!validatePhoneNumber(phoneNumber)) {
//       Alert.alert("Error", "Phone number must contain exactly 10 digits.");
//       return;
//     }

//     try {
//       // Create user with Firebase Authentication
//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;

//       // Store additional user details in Firestore
//       await setDoc(doc(db, "users", user.uid), {
//         fullName,
//         email,
//         phoneNumber,
//         createdAt: new Date().toISOString(),
//       });

//       setUser(user);
//       navigation.replace("HomeDashboard");
//     } catch (error: any) {
//       let errorMessage = "Sign-up failed. Please try again.";
//       if (error.code === "auth/email-already-in-use") {
//         errorMessage = "This email is already in use.";
//       } else if (error.code === "auth/invalid-email") {
//         errorMessage = "Invalid email format.";
//       } else if (error.code === "auth/weak-password") {
//         errorMessage = "Password should be at least 6 characters.";
//       }
//       Alert.alert("Error", errorMessage);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {/* Logo */}
//       <Image source={require("../assets/logo.png")} style={styles.logo} />

//       {/* Full Name Field */}
//       <View style={styles.inputContainer}>
//         <TextInput
//           placeholder="Full Name"
//           placeholderTextColor="#008080"
//           value={fullName}
//           onChangeText={setFullName}
//           style={styles.input}
//         />
//       </View>

//       {/* Email Field */}
//       <View style={styles.inputContainer}>
//         <TextInput
//           placeholder="Email ID"
//           placeholderTextColor="#008080"
//           value={email}
//           onChangeText={setEmail}
//           keyboardType="email-address"
//           autoCapitalize="none"
//           style={styles.input}
//         />
//       </View>

//       {/* Phone Number Field */}
//       <View style={styles.inputContainer}>
//         <TextInput
//           placeholder="Phone Number"
//           placeholderTextColor="#008080"
//           value={phoneNumber}
//           onChangeText={handlePhoneNumberChange}
//           keyboardType="phone-pad"
//           style={styles.input}
//           maxLength={14} // (XXX) XXX-XXXX is 14 characters
//         />
//       </View>

//       {/* Password Field */}
//       <View style={styles.inputContainer}>
//         <TextInput
//           placeholder="Create Password"
//           placeholderTextColor="#008080"
//           value={password}
//           onChangeText={setPassword}
//           secureTextEntry
//           style={styles.input}
//         />
//       </View>

//       {/* Sign Up Button */}
//       <TouchableOpacity
//         style={styles.signUpButton}
//         onPress={handleSignUp}
//       >
//         <Text style={styles.signUpButtonText}>Sign Up</Text>
//       </TouchableOpacity>

//       <Text style={styles.Text}>Already have an account?</Text>

//       {/* Log In Button */}
//       <TouchableOpacity
//         style={styles.loginButton}
//         onPress={() => navigation.navigate("Login")}
//       >
//         <Text style={styles.loginButtonText}>Log In</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F8F5E9",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   logo: {
//     width: 200,
//     height: 200,
//     marginBottom: 80,
//   },
//   inputContainer: {
//     width: "75%",
//     marginBottom: 20,
//   },
//   input: {
//     borderBottomWidth: 2,
//     borderBottomColor: "#F6A800", // amber
//     padding: 10,
//     fontSize: 14,
//     color: "#008080", // teal
//   },
//   signUpButton: {
//     backgroundColor: "#008080", // teal
//     paddingVertical: 12,
//     paddingHorizontal: 100,
//     borderRadius: 25,
//     marginTop: 10,
//   },
//   signUpButtonText: {
//     color: "#FFFFFF", // white
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   loginButton: {
//     marginTop: 0,
//   },
//   loginButtonText: {
//     color: "#008080", // teal
//     fontSize: 14,
//     fontWeight: "bold",
//   },
//   Text: {
//     marginTop: 20,
//     color: "#008080", // teal
//     fontSize: 14,
//     fontWeight: "bold",
//   },
// });


// export default SignUpScreen;

// SignUpScreen.tsx 2

// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   StyleSheet,
//   Alert,
//   Platform,
// } from "react-native";
// import { Picker } from "@react-native-picker/picker";
// import { createUserWithEmailAndPassword } from "firebase/auth";
// import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
// import { auth, db } from "../config/firebaseConfig";
// import { useAuth } from "../context/AuthContext";


// const roles = [
//   { label: "Support Seeker", value: "Support Seeker" },
//   { label: "Volunteer", value: "Volunteer" },
//   { label: "Event Organizer", value: "Event Organizer" },
// ];


// const SignUpScreen: React.FC<Props> = ({ navigation }) => {
//   const [fullName, setFullName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [password, setPassword] = useState("");
//   const [role, setRole] = useState("Support Seeker");
//   const [loading, setLoading] = useState(false);
//   const { setUser } = useAuth();

//   const formatPhoneNumber = (input) => {
//     const digits = input.replace(/\D/g, "");
//     let formatted = digits;
//     if (digits.length >= 4) formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}`;
//     if (digits.length >= 7) formatted += `-${digits.slice(6, 10)}`;
//     return formatted;
//   };

//   const validatePhoneNumber = (phone) => phone.replace(/\D/g, "").length === 10;

//   const handlePhoneNumberChange = (text) => setPhoneNumber(formatPhoneNumber(text));

//   const handleSignUp = async () => {
//     if (!fullName || !email || !phoneNumber || !password || !role) {
//       Alert.alert("Error", "Please fill in all fields.");
//       return;
//     }

//     if (!validatePhoneNumber(phoneNumber)) {
//       Alert.alert("Error", "Phone number must contain exactly 10 digits.");
//       return;
//     }

//     try {
//       setLoading(true);
//       const digits = phoneNumber.replace(/\D/g, "");

//       // Check if phone number already exists
//       const q = query(collection(db, "users"), where("phoneNumber", "==", digits));
//       const snapshot = await getDocs(q);
//       if (!snapshot.empty) {
//         Alert.alert("Phone Number Exists", "This phone number is already registered. Please sign in or use a different number.");
//         setLoading(false);
//         return;
//       }

//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;
//       const approved = role === "Support Seeker";

//       await setDoc(doc(db, "users", user.uid), {
//         fullName,
//         email,
//         phoneNumber: digits,
//         role,
//         approved,
//         createdAt: new Date().toISOString(),
//       });

//       setUser(user);

//       if (!approved) {
//         Alert.alert("Account Pending", "Your account requires admin approval before access is granted.");
//       }
//     } catch (error) {
//       console.error(error);
//       Alert.alert("Error", error.message || "Sign-up failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Image source={require("../assets/logo.png")} style={styles.logo} />

//       <View style={styles.inputContainer}>
//         <TextInput
//           placeholder="Full Name"
//           placeholderTextColor="#008080"
//           value={fullName}
//           onChangeText={setFullName}
//           style={styles.input}
//         />
//       </View>

//       <View style={styles.inputContainer}>
//         <TextInput
//           placeholder="Email ID"
//           placeholderTextColor="#008080"
//           value={email}
//           onChangeText={setEmail}
//           keyboardType="email-address"
//           autoCapitalize="none"
//           style={styles.input}
//         />
//       </View>

//       <View style={styles.inputContainer}>
//         <TextInput
//           placeholder="Phone Number"
//           placeholderTextColor="#008080"
//           value={phoneNumber}
//           onChangeText={handlePhoneNumberChange}
//           keyboardType="phone-pad"
//           style={styles.input}
//           maxLength={14}
//         />
//       </View>

//       <View style={styles.inputContainer}>
//         <TextInput
//           placeholder="Create Password"
//           placeholderTextColor="#008080"
//           value={password}
//           onChangeText={setPassword}
//           secureTextEntry
//           style={styles.input}
//         />
//       </View>

//       <Text style={styles.label}>Select Role:</Text>
//       <Picker
//         selectedValue={role}
//         onValueChange={(itemValue) => setRole(itemValue)}
//         style={styles.picker}
//       >
//         {roles.map((r) => (
//           <Picker.Item key={r.value} label={r.label} value={r.value} />
//         ))}
//       </Picker>

//       <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
//         <Text style={styles.signUpButtonText}>Sign Up</Text>
//       </TouchableOpacity>

//       <Text style={styles.Text}>Already have an account?</Text>

//       <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate("Login")}>
//         <Text style={styles.loginButtonText}>Log In</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F8F5E9",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   logo: {
//     width: 200,
//     height: 200,
//     marginBottom: 80,
//   },
//   inputContainer: {
//     width: "75%",
//     marginBottom: 20,
//   },
//   input: {
//     borderBottomWidth: 2,
//     borderBottomColor: "#F6A800",
//     padding: 10,
//     fontSize: 14,
//     color: "#008080",
//   },
//   label: {
//     color: "#008080",
//     fontWeight: "bold",
//     marginBottom: 6,
//   },
//   picker: {
//     width: "75%",
//     marginBottom: 20,
//     color: "#008080",
//   },
//   signUpButton: {
//     backgroundColor: "#008080",
//     paddingVertical: 12,
//     paddingHorizontal: 100,
//     borderRadius: 25,
//     marginTop: 10,
//   },
//   signUpButtonText: {
//     color: "#FFFFFF",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   loginButton: {
//     marginTop: 0,
//   },
//   loginButtonText: {
//     color: "#008080",
//     fontSize: 14,
//     fontWeight: "bold",
//   },
//   Text: {
//     marginTop: 20,
//     color: "#008080",
//     fontSize: 14,
//     fontWeight: "bold",
//   },
// });

// export default SignUpScreen;


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
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { auth, db } from "../config/firebaseConfig";
import { useAuth } from "../context/AuthContext";

const roles = [
  { label: "Support Seeker", value: "Support Seeker" },
  { label: "Volunteer", value: "Volunteer" },
  { label: "Event Organizer", value: "Event Organizer" },
];

const SignUpScreen: React.FC<any> = ({ navigation }) => {
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

  const validatePhoneNumber = (phone: string) => phone.replace(/\D/g, "").length === 10;

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

  const handlePhoneNumberChange = (text: string) => setPhoneNumber(formatPhoneNumber(text));

  const handleSignUp = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const digits = phoneNumber.replace(/\D/g, "");

      // Check if phone number already exists
      const q = query(collection(db, "users"), where("phoneNumber", "==", digits));
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
        setErrors({ general: "Your account requires admin approval before access is granted." });
      } else {
        navigation.replace("HomeDashboard");
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#F8F5E9" }}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Image source={require("../assets/logo.png")} style={styles.logo} />

        {!!errors.general && (
          <Text style={[styles.errorText, { marginBottom: 10 }]}>{errors.general}</Text>
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
          {errors.fullName ? (
            <Text style={styles.errorText}>{errors.fullName}</Text>
          ) : null}
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
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
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
          {errors.phoneNumber ? (
            <Text style={styles.errorText}>{errors.phoneNumber}</Text>
          ) : null}
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
          {errors.password ? (
            <Text style={styles.errorText}>{errors.password}</Text>
          ) : null}
        </View>

        <Text style={styles.label}>Select Role:</Text>
        <View style={[styles.pickerContainer, errors.role && { borderColor: "#FF4D4D" }]}>
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
        {errors.role ? <Text style={styles.errorText}>{errors.role}</Text> : null}

        <TouchableOpacity
          style={[styles.signUpButton, loading && { opacity: 0.7 }]}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>

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
