/**
 * AdminDashboardScreen Component
 * 
 * A dashboard interface for administrators to access and manage various aspects of the application.
 * Provides quick access to user management, approvals, events, and resources.
 * 
 * Navigation: Uses React Navigation for routing between admin screens
 * Layout: Implements a grid-based card layout with a hero section and reminder footer
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const AdminDashboardScreen = () => {
  // Navigation hook for routing between screens
  const navigation = useNavigation<any>();

  // Dashboard items configuration
  // Each item represents a major administrative function with its metadata
  const dashboardItems = [
    {
      title: "Users",
      count: 120,
      icon: "person-outline",
      route: "UserManagement",
      description: "Manage user accounts and roles",
    },
    {
      title: "Approvals",
      count: 45,
      icon: "people-outline",
      route: "ApprovalManagement",
      description: "Review pending volunteer requests",
    },
    {
      title: "Events",
      count: 8,
      icon: "calendar-outline",
      route: "Events",
      description: "Create and manage community events",
    },
    {
      title: "Resources",
      count: 30,
      icon: "book-outline",
      route: "ResourceManagement",
      description: "Update help resources and guides",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Hero Section: Displays admin welcome message and profile avatar */}
        <View style={styles.heroBox}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <View style={styles.avatarContainer}>
            <Image
              source={require("../../assets/image.png")}
              style={styles.avatarImage}
            />
            <Text style={styles.avatarLabel}>Welcome, Admin!</Text>
          </View>
        </View>

        {/* Dashboard Grid: Displays administrative function cards */}
        <View style={styles.grid}>
          {dashboardItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => item.route && navigation.navigate(item.route)}
            >
              <Ionicons name={item.icon as any} size={28} color="#1B6B63" />
              <Text style={styles.title}>{item.title}</Text>
              <View style={styles.descriptionContainer}>
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color="#666"
                />
                <Text style={styles.description}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Motivational Reminder Section: Displays encouraging message for admins */}
        <View style={styles.reminderContainer}>
          <Ionicons name="heart" size={24} color="#1B6B63" />
          <Text style={styles.reminderText}>
            Your dedication makes a difference in our community.{"\n"}
            Remember to take breaks and stay energized!{"\n"}
            Together, we create positive change.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles: Defines the visual appearance of the dashboard
const styles = StyleSheet.create({
  // Container styles
  safeArea: {
    flex: 1,
    backgroundColor: "#FDF6EC", // Warm background color for comfortable viewing
  },
  container: {
    paddingBottom: 120, // Extra padding for scrolling content
  },
  
  // Hero section styles
  heroBox: {
    backgroundColor: "#FDF6EC",
    paddingTop: 40,
    paddingBottom: 18,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
    // Shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1B6B63",
    marginBottom: 10,
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 4,
    marginBottom: 10,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E0E0E0",
  },
  avatarLabel: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 30,
  },
  card: {
    backgroundColor: "#E0F2F1",
    width: "47%",
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  count: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B6B63",
    marginTop: 10,
  },
  title: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#1B6B63",
    marginTop: 10,
  },
  descriptionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 5,
  },
  description: {
    fontSize: 12,
    color: "#000000",
    marginLeft: 4,
    textAlign: "center",
    flex: 1,
  },
  reminderContainer: {
    marginTop: 30,
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: "#FDF6EC",
    alignItems: "center",
  },
  reminderText: {
    marginTop: 10,
    fontSize: 14,
    color: "#000000",
    textAlign: "center",
    lineHeight: 22,
  },
});

export default AdminDashboardScreen;