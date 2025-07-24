/**
 * SettingsScreen Component
 * 
 * A comprehensive settings interface for administrators to manage their account
 * and application preferences. Provides access to profile, privacy, security,
 * and notification settings.
 * 
 * Features:
 * - Account settings management
 * - Profile information access
 * - Sign out functionality
 * - Account deletion with confirmation
 * - Loading states for destructive actions
 * - Organized section-based layout
 * 
 * Navigation:
 * - Navigates to specific setting screens
 * - Handles authentication state changes
 * - Resets navigation on account deletion
 * 
 * States:
 * - deleting: Loading state for account deletion
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import HeroBox from "../../components/AdminHeroBox";
import { useAuth } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { SettingsStackParamList } from "../../navigation/AppNavigator";
import { deleteCurrentUserAndData } from '../../services/firebaseUserService';

// Navigation prop types
type SettingsScreenNavigationProp = StackNavigationProp<SettingsStackParamList & { Login: undefined }>;

const SettingsScreen = () => {
  const { signOut } = useAuth();
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [deleting, setDeleting] = React.useState(false);

  /**
   * Handles navigation to specific setting screens
   * @param option - Name of the setting screen to navigate to
   */
  const handleOptionPress = (option: string) => {
    switch (option) {
      case "Profile":
        navigation.navigate("Profile");
        break;
      default:
        console.log(`${option} pressed`);
    }
  };

  // Settings menu configuration
  const settingsOptions = [
    {
      title: "Account",
      icon: "person-circle-outline" as const,
      items: [
        {
          name: "Profile",
          icon: "person-outline" as const,
          description: "View and edit your profile information"
        },
        {
          name: "Privacy",
          icon: "shield-checkmark-outline" as const,
          description: "Manage your privacy settings"
        },
        {
          name: "Security",
          icon: "lock-closed-outline" as const,
          description: "Update your security preferences"
        },
        {
          name: "Notifications",
          icon: "notifications-outline" as const,
          description: "Customize your notification preferences"
        }
      ]
    }
  ];

  /**
   * Handles user sign out
   * Attempts to sign out and handles any errors
   */
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  /**
   * Handles account deletion
   * Shows confirmation dialog and manages deletion process
   */
  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteCurrentUserAndData();
              setDeleting(false);
              // Reset navigation stack to login screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              setDeleting(false);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <HeroBox title="Settings" showBackButton customBackRoute="Home" />

        {/* Settings Sections */}
        {settingsOptions.map((section, index) => (
          <View key={index} style={styles.section}>
            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <Ionicons name={section.icon} size={24} color="#1B6B63" />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {/* Section Items */}
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={styles.optionButton}
                onPress={() => handleOptionPress(item.name)}
              >
                <View style={styles.optionLeft}>
                  <Ionicons name={item.icon} size={22} color="#1B6B63" />
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>{item.name}</Text>
                    <Text style={styles.optionDescription}>{item.description}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward-outline" size={20} color="#1B6B63" />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Account Actions */}
        <View style={styles.accountActions}>
          {/* Sign Out Button */}
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

          {/* Delete Account Button */}
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={handleDeleteAccount} 
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
                <Text style={styles.deleteText}>Delete Account</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles: Defines the visual appearance of the settings screen
const styles = StyleSheet.create({
  // Container styles
  safeArea: {
    flex: 1,
    backgroundColor: "#FDF6EC", // Warm background color
  },
  container: {
    paddingBottom: 120, // Extra padding for comfortable scrolling
  },
  
  // Section styles
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B6B63", // Teal color for consistency
    marginLeft: 10,
  },
  
  // Option button styles
  optionButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 14,
    marginBottom: 12,
    // Button elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E2E2E",
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    color: "#666",
  },
  
  // Action button styles
  accountActions: {
    marginTop: 40,
    paddingHorizontal: 20,
    gap: 12,
  },
  signOutButton: {
    backgroundColor: "#C44536", // Danger color for sign out
    padding: 15,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  signOutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#C44536", // Danger color for delete
    padding: 15,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  deleteText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SettingsScreen;
