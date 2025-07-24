/**
 * ResourcesScreen Component
 * 
 * A screen that provides access to various mental health and support resources.
 * Displays a list of resource categories that users can explore, including
 * addiction help, therapy, counseling, awareness, and support systems.
 * 
 * Props:
 * - navigation: React Navigation prop for screen navigation
 * 
 * Features:
 * - Clean, accessible UI with icon-based navigation
 * - Consistent styling with the app's theme
 * - Responsive layout with scrollable content
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import HeroBox from "../../components/HeroBox";

const ResourcesScreen = ({ navigation }) => {
  // Resource categories configuration
  // Each resource has a label, navigation route, and associated icon
  const resources = [
    { label: "Addiction Help", route: "AddictionHelp", icon: "heart-circle-outline" },
    { label: "Find a Therapist", route: "FindTherapist", icon: "person-search-outline" },
    { label: "Counselling", route: "Counselling", icon: "chatbubbles-outline" },
    { label: "Awareness", route: "Awareness", icon: "bulb-outline" },
    { label: "Support System", route: "SupportSystem", icon: "people-outline" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Component with back navigation */}
        <HeroBox title="Resources" showBackButton={true} customBackRoute="Home" />

        {/* Section Title */}
        <Text style={styles.headerText}>Explore Your Resources</Text>

        {/* Resource Buttons Container */}
        <View style={styles.buttonContainer}>
          {resources.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.resourceButton}
              onPress={() => item.route && navigation.navigate(item.route)}
              activeOpacity={0.7} // Feedback opacity when pressed
            >
              <View style={styles.buttonContent}>
                <View style={styles.iconContainer}>
                  <Icon
                    name={item.icon}
                    size={24}
                    color="#FFFFFF"
                    style={styles.buttonIcon}
                  />
                </View>
                <Text style={styles.buttonText}>{item.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles: Defines the visual appearance of the resources screen
const styles = StyleSheet.create({
  // Container styles
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F1E9", // Warm, calming background color
  },
  container: {
    flexGrow: 1,
    paddingBottom: 100, // Extra padding for comfortable scrolling
    backgroundColor: "#F8F1E9",
  },
  
  // Header styles
  headerText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1B6B63",
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 20,
    alignSelf: "flex-start",
  },
  
  // Resource buttons container
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 20,
    alignItems: "flex-start", // Align buttons to the left to match header text
  },
  
  // Individual resource button styles
  resourceButton: {
    backgroundColor: "#1B6B63",
    marginVertical: 8,
    borderRadius: 12,
    width: "100%",
    // Elevation and shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 24,
    alignItems: "center",
    marginRight: 12,
  },
  buttonIcon: {
    // Icon styling handled by Icon component props
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    letterSpacing: 0.5, // Improved readability
  },
});

export default ResourcesScreen;