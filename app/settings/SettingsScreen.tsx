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
import HeroBox from "../../components/HeroBox";
import { useAuth } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { SettingsStackParamList } from "../../navigation/AppNavigator";

type SettingsScreenNavigationProp = StackNavigationProp<SettingsStackParamList>;

const SettingsScreen = () => {
  const { signOut } = useAuth();
  const navigation = useNavigation<SettingsScreenNavigationProp>();

  const handleOptionPress = (option: string) => {
    switch (option) {
      case "Profile":
        navigation.navigate("Profile");
        break;
      case "Feedback":
        navigation.navigate("Feedback");
        break;
      default:
        console.log(`${option} pressed`);
    }
  };

  const settingsOptions = [
    {
      title: "Account",
      icon: "person-outline" as const,
      items: ["Profile", "Privacy", "Security"],
    },
    {
      title: "Preferences",
      icon: "settings-outline" as const,
      items: ["Notifications", "Language", "Theme"],
    },
    {
      title: "Support",
      icon: "help-circle-outline" as const,
      items: ["Feedback", "Help Center", "About"],
    },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        <HeroBox title="Settings" showBackButton customBackRoute="Home" />

        {settingsOptions.map((section, index) => (
          <View key={index} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name={section.icon} size={24} color="#1B6B63" />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={styles.optionButton}
                onPress={() => handleOptionPress(item)}
              >
                <Text style={styles.optionText}>{item}</Text>
                <Ionicons
                  name="chevron-forward-outline"
                  size={20}
                  color="#1B6B63"
                />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FDF6EC",
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
    color: "#1B6B63",
    marginLeft: 10,
  },
  optionButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 14,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: "#F4A941",
  },
  optionText: {
    fontSize: 16,
    color: "#2E2E2E",
  },
  signOutButton: {
    marginTop: 40,
    marginHorizontal: 20,
    backgroundColor: "#C44536",
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  signOutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SettingsScreen;
