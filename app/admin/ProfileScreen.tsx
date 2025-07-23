import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SettingsStackParamList } from "../../navigation/AdminNavigator";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../config/firebaseConfig";
import * as ImagePicker from "expo-image-picker";
import KeyboardAwareWrapper from "../../components/KeyboardAwareWrapper";

type Props = NativeStackScreenProps<SettingsStackParamList, "Profile">;

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setName(userData.fullName || "");
        setEmail(userData.email || "");
        setPhone(userData.phone || "");
        setProfileImage(userData.profileImage || null);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

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

  const handlePhoneChange = (text: string) => {
    const formattedNumber = formatPhoneNumber(text);
    setPhone(formattedNumber);
  };

  const pickImage = async () => {
    try {
      // Request permission to access the photo library
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant permission to access your photos in your device settings to select a profile picture."
        );
        return;
      }

      // Launch the image picker with base64 enabled
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3, // Lower quality to keep base64 size manageable
        allowsMultipleSelection: false,
        base64: true, // Enable base64 encoding
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploading(true);

        try {
          const asset = result.assets[0];

          // Add a user-friendly file size check upfront
          if (asset.fileSize && asset.fileSize > 750 * 1024) {
            Alert.alert(
              "Image Too Large",
              "Please select an image smaller than 750KB."
            );
            setUploading(false);
            return;
          }

          const base64Data = asset.base64;

          if (!base64Data) {
            throw new Error("Failed to get image data");
          }

          const currentUser = auth.currentUser;
          if (!currentUser) {
            throw new Error("No user logged in");
          }

          // Create base64 image URL
          const base64ImageUrl = `data:image/jpeg;base64,${base64Data}`;

          console.log(
            "Image size (base64):",
            Math.round(base64Data.length * 0.75),
            "bytes"
          );

          // Check if image is too large (Firestore has 1MB document limit)
          if (base64Data.length > 1000000) {
            // ~750KB limit for safety
            Alert.alert(
              "Image Too Large",
              "Please select a smaller image. The current image is too large to store."
            );
            return;
          }

          // Update the local state
          setProfileImage(base64ImageUrl);

          // Update the user profile in Firestore with base64 data
          await updateDoc(doc(db, "users", currentUser.uid), {
            profileImage: base64ImageUrl,
            profileImageType: "base64",
            profileImageUpdated: new Date().toISOString(),
          });

          Alert.alert("Success", "Profile picture updated successfully!");
        } catch (error) {
          console.error("Error saving image:", error);

          let errorMessage =
            "Failed to save profile picture. Please try again.";

          if (error.message?.includes("permission")) {
            errorMessage =
              "Permission denied. Please check your Firestore rules.";
          } else if (error.message?.includes("quota")) {
            errorMessage =
              "Storage quota exceeded. Please try a smaller image.";
          }

          Alert.alert("Save Failed", errorMessage);
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(
        "Error",
        "Failed to access photo library. Please check your permissions and try again."
      );
      setUploading(false);
    }
  };

  const removeProfileImage = async () => {
    Alert.alert(
      "Remove Profile Picture",
      "Are you sure you want to remove your profile picture?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const currentUser = auth.currentUser;
              if (!currentUser) return;

              setUploading(true);

              // Update the user profile in Firestore to remove the profile image
              await updateDoc(doc(db, "users", currentUser.uid), {
                profileImage: null,
                profileImageType: null,
                profileImageUpdated: new Date().toISOString(),
              });

              // Update local state
              setProfileImage(null);

              Alert.alert("Success", "Profile picture removed successfully!");
            } catch (error) {
              console.error("Error removing profile image:", error);
              Alert.alert("Error", "Failed to remove profile picture");
            } finally {
              setUploading(false);
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      setLoading(true);
      await updateDoc(doc(db, "users", currentUser.uid), {
        fullName: name,
        phone: phone,
      });

      Alert.alert("Success", "Profile updated successfully");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1B6B63" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heroBox}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButtonContainer}
          >
            <Ionicons name="chevron-back-outline" size={24} color="#1B6B63" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
        </View>
      </View>

      <KeyboardAwareWrapper>
        <View style={styles.content}>
          <View style={styles.profileImageContainer}>
            <TouchableOpacity
              onPress={pickImage}
              onLongPress={profileImage ? removeProfileImage : undefined}
              disabled={uploading}
            >
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Ionicons name="person-outline" size={40} color="#666" />
                </View>
              )}
              {uploading ? (
                <ActivityIndicator
                  style={styles.uploadIndicator}
                  color="#1B6B63"
                />
              ) : (
                <View style={styles.editIconContainer}>
                  <Ionicons name="camera" size={20} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: "#f0f0f0" }]}
              value={email}
              editable={false}
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={handlePhoneChange}
              placeholder="Enter your phone number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.disabledButton]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareWrapper>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heroBox: {
    backgroundColor: "#FDF6EC",
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 3,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1B6B63",
    marginLeft: 8,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  sosWrapper: {
    backgroundColor: "#C44536",
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  sosText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileImageContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#1B6B63",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  uploadIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  formContainer: {
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2E2E2E",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 12,
    fontSize: 16,
    color: "#2E2E2E",
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: "#F4A941",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
