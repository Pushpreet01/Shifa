import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  RoleSelection: undefined;
  UserSettings: { role: string };
};

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, "RoleSelection">;

const roles = [
  {
    id: "Support Seeker",
    title: "Support Seeker",
    description: "Access mental health resources, connect with volunteers, and find support in your community.",
    icon: "🤝",
  },
  {
    id: "Volunteer",
    title: "Volunteer",
    description: "Offer your time and skills to support others, participate in events, and make a difference.",
    icon: "❤️",
  },
  {
    id: "Event Organizer",
    title: "Event Organizer",
    description: "Create and manage community events, workshops, and support group sessions.",
    icon: "📅",
  },
];

const RoleSelectionScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
  };

  const handleContinue = () => {
    if (selectedRole) {
      navigation.navigate("UserSettings", { role: selectedRole });
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/logo.png")} style={styles.logo} />
      
      <Text style={styles.title}>Choose Your Role</Text>
      <Text style={styles.subtitle}>Select how you'd like to use Shifa</Text>

      <ScrollView style={styles.rolesContainer}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[
              styles.roleCard,
              selectedRole === role.id && styles.selectedRoleCard,
            ]}
            onPress={() => handleRoleSelect(role.id)}
          >
            <Text style={styles.roleIcon}>{role.icon}</Text>
            <View style={styles.roleContent}>
              <Text style={styles.roleTitle}>{role.title}</Text>
              <Text style={styles.roleDescription}>{role.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.continueButton,
          !selectedRole && styles.disabledButton,
        ]}
        onPress={handleContinue}
        disabled={!selectedRole}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F5E9",
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 20,
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
  rolesContainer: {
    flex: 1,
  },
  roleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: "#F4A941",
  },
  selectedRoleCard: {
    borderLeftColor: "#1B6B63",
    backgroundColor: "#FDF6EC",
  },
  roleIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  roleContent: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1B6B63",
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: "#2E2E2E",
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: "#1B6B63",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: "#F4A941",
    opacity: 0.7,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default RoleSelectionScreen; 