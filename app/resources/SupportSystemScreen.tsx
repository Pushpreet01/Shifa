/**
 * SupportSystemScreen Component
 * 
 * A resource interface that provides access to various support services including
 * women's helplines, family services, and transitional homes. Features an
 * interactive card-based layout with expandable information.
 * 
 * Features:
 * - Expandable resource cards
 * - Animated transitions
 * - External resource links
 * - Emergency access
 * - Notification integration
 * - Accessible navigation
 * 
 * States:
 * - expandedIndices: Tracks which cards are expanded
 * - animations: Animation values for smooth transitions
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const SupportSystemScreen = () => {
  const navigation = useNavigation();

  // Resource data configuration
  const supportResources = [
    {
      label: "Women's Helplines",
      icon: "woman",
      resourceUrl: "https://www.canada.ca/en/public-health/services/health-promotion/stop-family-violence/services.html",
    },
    {
      label: "Family and Youth Services",
      icon: "people",
      resourceUrl: "https://www.canada.ca/en/public-health/services/health-promotion/childhood-adolescence.html",
    },
    {
      label: "Transitional Homes",
      icon: "home",
      resourceUrl: "https://www.canada.ca/en/employment-social-development/services/homelessness.html",
    },
  ];

  // State Management
  const [expandedIndices, setExpandedIndices] = useState([]);
  const [animations] = useState(
    supportResources.map(() => new Animated.Value(0))
  );

  /**
   * Handles card expansion/collapse
   * Manages animation state for smooth transitions
   * @param index - Index of card to toggle
   */
  const toggleCard = (index) => {
    const isExpanded = expandedIndices.includes(index);
    const newExpandedIndices = isExpanded
      ? expandedIndices.filter((i) => i !== index)
      : [...expandedIndices, index];

    setExpandedIndices(newExpandedIndices);

    // Animate card expansion/collapse
    Animated.timing(animations[index], {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  /**
   * Shows resource label in alert dialog
   * @param label - Label of the resource
   */
  const showLabel = (label) => {
    Alert.alert("Resource", label, [{ text: "OK" }]);
  };

  /**
   * Renders expandable details section
   * Includes resource link with animation
   * @param resource - Resource data
   * @param index - Index for animation tracking
   */
  const renderDetails = (resource, index) => {
    const height = animations[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0, 40],
    });

    return (
      <Animated.View style={[styles.detailsContainer, { height }]}>
        <TouchableOpacity onPress={() => Linking.openURL(resource.resourceUrl)}>
          <Text style={[styles.buttonSubText, styles.resourceText]}>
            Go to Resources
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  /**
   * Handles navigation back to resources screen
   */
  const handleBack = () => {
    navigation.navigate("Resources");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Custom Header Section */}
      <View style={styles.heroBox}>
        <View style={styles.header}>
          {/* Left Header Section */}
          <View style={styles.leftSection}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="chevron-back-outline" size={24} color="#1B6B63" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Support System</Text>
          </View>

          {/* Right Header Section */}
          <View style={styles.rightSection}>
            <TouchableOpacity onPress={() => navigation.navigate("Announcements")}>
              <Ionicons name="notifications-outline" size={24} color="#C44536" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sosWrapper}
              onPress={() => navigation.navigate("Emergency")}
            >
              <Text style={styles.sosText}>SOS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Resource Cards Section */}
      <ScrollView contentContainerStyle={styles.container}>
        {supportResources.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.cardRow}
            onPress={() => toggleCard(index)}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              {/* Card Main Content */}
              <View style={styles.mainContent}>
                <TouchableOpacity onPress={() => showLabel(item.label)}>
                  <View style={styles.iconBox}>
                    <Ionicons name={item.icon} size={40} color="#1B6B63" />
                  </View>
                </TouchableOpacity>
                <View style={styles.textContainer}>
                  <Text style={styles.infoButtonText}>{item.label}</Text>
                  {renderDetails(item, index)}
                </View>
                {/* Expand/Collapse Indicator */}
                {!expandedIndices.includes(index) && (
                  <View style={styles.arrowButton}>
                    <Ionicons name="chevron-forward" size={20} color="#1B6B63" />
                  </View>
                )}
              </View>
              {/* Close Button for Expanded State */}
              {expandedIndices.includes(index) && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => toggleCard(index)}
                >
                  <Ionicons name="close-outline" size={20} color="#1B6B63" />
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles: Defines the visual appearance of the support system screen
const styles = StyleSheet.create({
  // Container styles
  safeArea: {
    flex: 1,
    backgroundColor: "#FDF6EC", // Warm background color
  },
  container: {
    paddingBottom: 100,
    alignItems: "center",
    paddingTop: 20,
  },
  
  // Header styles
  heroBox: {
    backgroundColor: "#FDF6EC",
    paddingTop: 40,
    paddingBottom: 18,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    // Header elevation
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
    justifyContent: "space-between",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B6B63", // Teal color for consistency
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  sosWrapper: {
    backgroundColor: "#C44536", // Emergency red color
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
  
  // Card styles
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12, // Reduced spacing for compactness
    width: "85%", // Reduced width for smaller tiles
    backgroundColor: "#A8D8C9", // Light teal background
    borderRadius: 20,
    // Card elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: "visible",
  },
  cardContent: {
    position: "relative",
    flexDirection: "column",
    width: "100%",
    paddingVertical: 10, // Reduced padding for smaller tiles
    paddingHorizontal: 14,
  },
  mainContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 40, // Reduced height to match smaller iconBox
  },
  
  // Icon styles
  iconBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 40, // Perfect circle
    padding: 12,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    // Icon box elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  
  // Text styles
  textContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  infoButtonText: {
    color: "#1B6B63",
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
  },
  buttonSubText: {
    fontSize: 14,
    color: "#1B6B63",
    marginTop: 4,
    lineHeight: 20,
    fontWeight: "500",
    textAlign: "center",
  },
  resourceText: {
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  
  // Animation container styles
  detailsContainer: {
    marginTop: 8,
    overflow: "hidden",
  },
  
  // Button styles
  closeButton: {
    position: "absolute",
    top: 5, // Positioned within tile
    right: 5,
    padding: 5,
  },
  arrowButton: {
    position: "absolute",
    right: 5,
    padding: 5,
    justifyContent: "center",
  },
});

export default SupportSystemScreen;