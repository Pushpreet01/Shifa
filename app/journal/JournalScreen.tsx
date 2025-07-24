/**
 * JournalScreen.tsx
 * Landing screen for the journaling feature that provides access to create new entries
 * and view existing journal entries. Features a welcoming design with a journal cover image
 * and clear call-to-action buttons.
 */

import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { HomeStackParamList } from "../../navigation/AppNavigator";
import { Ionicons } from "@expo/vector-icons";
import HeroBox from "../../components/HeroBox";

/**
 * JournalScreen Component
 * Main entry point for the journaling feature
 * Provides navigation to create new entries or view existing ones
 */
const JournalScreen = () => {
  // Navigation hook for routing between screens
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with title and back button */}
      <HeroBox title="Journal" showBackButton={true} />

      {/* Main content container */}
      <View style={styles.content}>
        {/* Journal cover image */}
        <Image
          source={require("../../assets/journalcover.png")}
          style={styles.journalImage}
          resizeMode="contain"
        />

        {/* Section title */}
        <Text style={styles.label}>My Journal</Text>

        {/* Navigation buttons container */}
        <View style={styles.buttonArea}>
          {/* New Entry Button */}
          <TouchableOpacity
            style={styles.openButton}
            onPress={() => navigation.navigate("NewJournalEntryScreen")}
          >
            <Text style={styles.openButtonText}>New Entry</Text>
          </TouchableOpacity>

          {/* View Entries Button */}
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => navigation.navigate("MyJournalsScreen")}
          >
            <Text style={styles.viewButtonText}>View My Entries</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

/**
 * Styles for the JournalScreen component
 * Organized by section for easier maintenance
 */
const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: "#FDF6EC",
  },
  
  // Header styles
  heroBox: {
    backgroundColor: "#FDF6EC",
    paddingTop: 40,
    paddingBottom: 18,
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

  // Content styles
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20,
  },
  journalImage: {
    height: Dimensions.get("window").height * 0.45,
    width: Dimensions.get("window").width * 0.9,
    marginBottom: 20,
  },
  label: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    color: "#2E2E2E",
  },

  // Button styles
  buttonArea: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 20,
  },
  openButton: {
    backgroundColor: "#1B6B63",
    paddingVertical: 12,
    borderRadius: 30,
    width: "100%",
    marginBottom: 15,
    alignItems: "center",
  },
  openButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  viewButton: {
    backgroundColor: "#F4A941",
    paddingVertical: 12,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
  },
  viewButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default JournalScreen;
