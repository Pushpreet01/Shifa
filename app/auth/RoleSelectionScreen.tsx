import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

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

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, "RoleSelection">;
type RoleSelectionScreenRouteProp = RouteProp<AuthStackParamList, "RoleSelection">;

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
  const route = useRoute<RoleSelectionScreenRouteProp>();
  const { fullName, email, phoneNumber, password } = route.params;
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string>("");

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setRoleError("");
  };

  const handleContinue = () => {
    if (!selectedRole || !roles.some(r => r.id === selectedRole)) {
      setRoleError("Please select a valid role to continue.");
      return;
    }
    navigation.navigate("UserSettings", {
      role: selectedRole,
      fullName,
      email,
      phoneNumber,
      password,
    });
  };

  return (
    <View style={styles.container}>
      {/* Progress Tracker */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: "67%" }]} />
          <View style={[styles.progressBar, styles.inactiveBar, { width: "33%" }]} />
        </View>
        <View style={styles.circleContainer}>
          <View style={[styles.circle, styles.activeCircle]} />
          <View style={[styles.circle, styles.activeCircle, styles.enlargedCircle]}>
            <Text style={styles.circleText}>2</Text>
          </View>
          <View style={styles.circle} />
        </View>
        <Text style={styles.progressText}>Step 2 of 3</Text>
      </View>

      <Image source={require("../../assets/logo.png")} style={styles.logo} />

      <Text style={styles.title}>Choose Your Role</Text>
      <Text style={styles.subtitle}>Select how you'd like to use Shifa</Text>

      {roleError ? (
        <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>{roleError}</Text>
      ) : null}

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

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back</Text>
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
  logo: {
    width: 150,
    height: 150,
    alignSelf: "center",
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
    marginBottom: 10,
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
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: "#1B6B63",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default RoleSelectionScreen;