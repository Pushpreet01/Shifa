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
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  RoleSelection: undefined;
  UserSettings: { role: string };
};

type UserSettingsScreenRouteProp = RouteProp<AuthStackParamList, "UserSettings">;
type NavigationProp = NativeStackNavigationProp<AuthStackParamList, "UserSettings">;

const UserSettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<UserSettingsScreenRouteProp>();
  const { role } = route.params;

  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
  });
  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: "", phone: "" },
  ]);

  const handleAddContact = () => {
    setEmergencyContacts([...emergencyContacts, { name: "", phone: "" }]);
  };

  const handleContactChange = (index: number, field: "name" | "phone", value: string) => {
    const newContacts = [...emergencyContacts];
    newContacts[index][field] = value;
    setEmergencyContacts(newContacts);
  };

  const handleRemoveContact = (index: number) => {
    if (emergencyContacts.length > 1) {
      const newContacts = emergencyContacts.filter((_, i) => i !== index);
      setEmergencyContacts(newContacts);
    }
  };

  const handleComplete = () => {
    // Placeholder for future backend integration
    navigation.navigate("SignUp");
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>Customize your experience</Text>

        {/* Profile Picture Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Picture</Text>
          <TouchableOpacity style={styles.profilePictureContainer}>
            {profilePicture ? (
              <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
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
                  onChangeText={(value) => handleContactChange(index, "name", value)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  value={contact.phone}
                  onChangeText={(value) => handleContactChange(index, "phone", value)}
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
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddContact}
          >
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B6B63",
    textAlign: "center",
    marginTop: 20,
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
  completeButton: {
    backgroundColor: "#1B6B63",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  completeButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default UserSettingsScreen; 