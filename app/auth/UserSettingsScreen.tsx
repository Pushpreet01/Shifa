/**
 * UserSettingsScreen Component
 * 
 * Final step of the signup process where users complete their profile setup.
 * This screen handles:
 * 1. Profile picture upload
 * 2. Notification preferences
 * 3. Emergency contacts
 * 4. Firebase user creation
 * 5. Email verification initiation
 * 
 * Features:
 * - Image picker for profile photo
 * - Multiple notification channels (push, email, SMS)
 * - Dynamic emergency contact list
 * - Progress indicator showing step 3 of 3
 * - Firebase authentication integration
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Switch,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebaseConfig";

/**
 * Type definitions for navigation parameters
 * Defines the structure of data passed between auth screens
 */
type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  RoleSelection: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
  };
  UserSettings: {
    role: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
  };
  EmailVerification: {
    email: string;
    password: string;
    fullName: string;
    phoneNumber: string;
    role: string;
    profileImage: string | null;
    notifications: any;
    emergencyContacts: any;
  };
};

type UserSettingsScreenRouteProp = RouteProp<
  AuthStackParamList,
  "UserSettings"
>;
type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "UserSettings"
>;

/**
 * UserSettings component that handles the final step of user registration
 * Collects additional user preferences and creates the user account
 */
const UserSettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<UserSettingsScreenRouteProp>();
  const { role, fullName, email, phoneNumber, password } = route.params;

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
  });
  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: "", phone: "" },
  ]);
  const [inlineMessage, setInlineMessage] = useState<{ type: 'success' | 'error' | null, text: string }>({ type: null, text: '' });

  const handleAddContact = () => {
    setEmergencyContacts([...emergencyContacts, { name: "", phone: "" }]);
  };

  /**
   * Formats phone number to (XXX) XXX-XXXX pattern
   * @param text - Raw phone number input
   * @returns Formatted phone number string
   */
  const formatPhoneNumber = (text: string) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/\D/g, "");

    // Format as (XXX) XXX-XXXX
    if (cleaned.length >= 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6,
        10
      )}`;
    } else if (cleaned.length > 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6
      )}`;
    } else if (cleaned.length > 3) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else if (cleaned.length > 0) {
      return `(${cleaned}`;
    }
    return "";
  };

  /**
   * Handles changes to emergency contact information
   * @param index - Index of the contact being modified
   * @param field - Field being updated (name or phone)
   * @param value - New value for the field
   */
  const handleContactChange = (
    index: number,
    field: "name" | "phone",
    value: string
  ) => {
    const newContacts = [...emergencyContacts];
    if (field === "phone") {
      newContacts[index][field] = formatPhoneNumber(value);
    } else {
      newContacts[index][field] = value;
    }
    setEmergencyContacts(newContacts);
  };

  const handleRemoveContact = (index: number) => {
    if (emergencyContacts.length > 1) {
      const newContacts = emergencyContacts.filter((_, i) => i !== index);
      setEmergencyContacts(newContacts);
    }
  };

  /**
   * Handles profile picture selection using expo-image-picker
   * Includes:
   * - Permission checking
   * - Image compression
   * - Size validation
   * - Base64 conversion
   */
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant permission to access your photos to select a profile picture."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const base64Data = result.assets[0].base64;
      if (base64Data) {
        if (base64Data.length > 1000000) {
          Alert.alert(
            "Image Too Large",
            "Please select a smaller image. The current image is too large to store."
          );
          return;
        }
        const base64ImageUrl = `data:image/jpeg;base64,${base64Data}`;
        setProfileImage(base64ImageUrl);
      }
    }
  };

  /**
   * Completes the user registration process
   * Steps:
   * 1. Validates required fields
   * 2. Creates Firebase Auth user
   * 3. Stores additional user data in Firestore
   * 4. Sets approval status based on role
   * 5. Navigates to email verification
   * 
   * Error handling:
   * - Firebase Auth errors (email in use, weak password)
   * - Firestore permission errors
   * - Missing required fields
   */
  const handleComplete = async () => {
    setLoading(true);
    try {
      // Validate required fields
      if (!fullName.trim()) {
        throw new Error("Full name is required");
      }
      if (!email.trim()) {
        throw new Error("Email is required");
      }
      if (!role) {
        throw new Error("Role is required");
      }
      if (!phoneNumber.trim()) {
        throw new Error("Phone number is required");
      }

      // 1. Create the Firebase Auth user
      console.log("[UserSettings] Creating Firebase Auth user...");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("[UserSettings] Firebase Auth user created:", user.uid);

      // 2. Add user data to Firestore with emailVerified: false, using UID
      const cleanedPhoneNumber = phoneNumber.replace(/\D/g, "");
      // Set approvalStatus based on role
      let approvalStatus;
      if (role === "Support Seeker") {
        approvalStatus = { status: "Approved" };
      } else {
        approvalStatus = { status: "Pending" };
      }
      const userData = {
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: cleanedPhoneNumber,
        role,
        profileImage,
        notifications,
        emergencyContacts,
        approvalStatus, // <-- new field
        createdAt: new Date().toISOString(),
        emailVerified: false,
      };

      console.log("[UserSettings] User data to store:", userData);
      console.log("[UserSettings] Storing user data in Firestore...");

      await setDoc(doc(db, "users", user.uid), userData);
      console.log("[UserSettings] User data stored successfully in Firestore");

      setLoading(false);
      navigation.navigate("EmailVerification", {
        email,
        password,
        fullName,
        phoneNumber,
        role,
        profileImage,
        notifications,
        emergencyContacts,
      });
    } catch (error: any) {
      console.error("[UserSettings] Error in handleComplete:", error);
      console.error("[UserSettings] Error code:", error.code);
      console.error("[UserSettings] Error message:", error.message);
      setLoading(false);

      let errorMessage = "Failed to save user data. Please try again.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please choose a stronger password.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Error", errorMessage);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B6B63" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Progress Tracker */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: "100%" }]} />
          </View>
          <View style={styles.circleContainer}>
            <View style={[styles.circle, styles.activeCircle]} />
            <View style={[styles.circle, styles.activeCircle]} />
            <View
              style={[
                styles.circle,
                styles.activeCircle,
                styles.enlargedCircle,
              ]}
            >
              <Text style={styles.circleText}>3</Text>
            </View>
          </View>
          <Text style={styles.progressText}>Step 3 of 3</Text>
        </View>

        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>Customize your experience</Text>
        {inlineMessage.type && (
          <Text style={inlineMessage.type === 'success' ? styles.successText : styles.errorText}>
            {inlineMessage.text}
          </Text>
        )}

        {/* Profile Picture Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Picture</Text>
          <TouchableOpacity
            style={styles.profilePictureContainer}
            onPress={pickImage}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profilePicture}
              />
            ) : (
              <View style={styles.profilePicturePlaceholder}>
                <Ionicons name="person" size={40} color="#1B6B63" />
              </View>
            )}
            <Text style={styles.uploadText}>Tap to upload photo</Text>
          </TouchableOpacity>
        </View>

        {/* Notification Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceText}>Push Notifications</Text>
            <Switch
              value={notifications.push}
              onValueChange={(value) =>
                setNotifications({ ...notifications, push: value })
              }
              trackColor={{ false: "#E0E0E0", true: "#1B6B63" }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceText}>Email Notifications</Text>
            <Switch
              value={notifications.email}
              onValueChange={(value) =>
                setNotifications({ ...notifications, email: value })
              }
              trackColor={{ false: "#E0E0E0", true: "#1B6B63" }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceText}>SMS Notifications</Text>
            <Switch
              value={notifications.sms}
              onValueChange={(value) =>
                setNotifications({ ...notifications, sms: value })
              }
              trackColor={{ false: "#E0E0E0", true: "#1B6B63" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Emergency Contacts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          {emergencyContacts.map((contact, index) => (
            <View key={index} style={styles.contactContainer}>
              <View style={styles.contactInputs}>
                <TextInput
                  style={styles.input}
                  placeholder="Contact Name"
                  value={contact.name}
                  onChangeText={(value) =>
                    handleContactChange(index, "name", value)
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  value={contact.phone}
                  onChangeText={(value) =>
                    handleContactChange(index, "phone", value)
                  }
                  keyboardType="phone-pad"
                />
              </View>
              {emergencyContacts.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveContact(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#C44536" />
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
            <Ionicons name="add-circle" size={24} color="#1B6B63" />
            <Text style={styles.addButtonText}>Add Another Contact</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleComplete}
        >
          <Text style={styles.completeButtonText}>Complete Setup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F5E9",
  },
  scrollView: {
    flex: 1,
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
    width: 301,
    position: "absolute",
    top: 0,
    left: 26,
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B6B63",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#2E2E2E",
    textAlign: "center",
    marginBottom: 30,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1B6B63",
    marginBottom: 16,
  },
  profilePictureContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FDF6EC",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1B6B63",
    borderStyle: "dashed",
  },
  completeButton: {
    backgroundColor: "#1B6B63",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  completeButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    marginBottom: 60,
  },
  backButtonText: {
    color: "#1B6B63",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  uploadText: {
    color: "#1B6B63",
    marginTop: 8,
    fontSize: 14,
  },
  preferenceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  preferenceText: {
    fontSize: 16,
    color: "#2E2E2E",
  },
  contactContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  contactInputs: {
    flex: 1,
  },
  input: {
    backgroundColor: "#F8F5E9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 16,
    color: "#2E2E2E",
  },
  removeButton: {
    marginLeft: 8,
    padding: 4,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  addButtonText: {
    color: "#1B6B63",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F5E9",
  },
  successText: {
    color: '#4CAF50',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default UserSettingsScreen;
