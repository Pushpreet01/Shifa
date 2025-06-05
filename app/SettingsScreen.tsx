// app/SettingsScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import HeroBox from "../components/HeroBox";
import { useAuth } from "../context/AuthContext";

const SettingsScreen = () => {
  const { signOut } = useAuth();

  const settingsOptions = [
    {
      title: "Account",
      icon: "person" as const,
      items: ["Profile", "Privacy", "Security"],
    },
    {
      title: "Preferences",
      icon: "settings-outline" as const,
      items: ["Notifications", "Language", "Theme"],
    },
    {
      title: "Support",
      icon: "help-circle" as const,
      items: ["Help Center", "Contact Us", "About"],
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <HeroBox title="Settings" />

        {settingsOptions.map((section, index) => (
          <View key={index} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name={section.icon} size={24} color="#3A7D44" />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity key={itemIndex} style={styles.optionButton}>
                <Text style={styles.optionText}>{item}</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F5E9",
  },
  container: {
    paddingBottom: 120,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3A7D44",
    marginLeft: 10,
  },
  optionButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  signOutButton: {
    marginTop: 40,
    marginHorizontal: 20,
    backgroundColor: "#C44536",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  signOutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SettingsScreen;
