/**
 * AddictionHelpScreen Component
 * 
 * A comprehensive screen that provides addiction-related resources and support materials.
 * Displays various types of content including text, images, videos, and documents in an
 * expandable card format with smooth animations.
 * 
 * Features:
 * - Dynamic resource loading from backend
 * - Multiple content type support (text, images, videos, documents)
 * - Animated expandable cards
 * - Tag-based categorization
 * - Loading and empty states
 * 
 * States:
 * - resources: Array of addiction help resources
 * - loading: Loading state indicator
 * - expandedIndices: Tracks which cards are expanded
 * - animations: Animated values for smooth card transitions
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import HeroBox from "../../components/HeroBox";
import { getUserResources, UserResource } from "../../services/resourceService";

const AddictionHelpScreen = () => {
  // State Management
  const [resources, setResources] = useState<UserResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndices, setExpandedIndices] = useState<number[]>([]);

  // Load resources on component mount
  useEffect(() => {
    loadResources();
  }, []);

  /**
   * Fetches addiction help resources from the backend
   * Initializes animation values for each resource card
   */
  const loadResources = async () => {
    try {
      setLoading(true);
      const fetchedResources = await getUserResources("AddictionHelp");
      setResources(fetchedResources);
    } catch (error) {
      console.error("Error loading addiction help resources:", error);
      Alert.alert("Error", "Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles the expansion/collapse of resource cards
   * Manages both the expanded state and animation
   * @param index - Index of the card to toggle
   */
  const toggleCard = (index: number) => {
    const isExpanded = expandedIndices.includes(index);
    setExpandedIndices(
      isExpanded
        ? expandedIndices.filter((i) => i !== index)
        : [...expandedIndices, index]
    );
  };

  /**
   * Renders appropriate content based on resource type
   * Supports images, videos, documents, and text content
   * @param resource - The resource object containing content and metadata
   */
  const renderResourceContent = (resource: UserResource) => {
    // Image content renderer
    if (resource.contentType === "image" && resource.fileUrl) {
      return (
        <Image
          source={{ uri: resource.fileUrl }}
          style={styles.resourceImage}
        />
      );
    }

    // Video content renderer
    if (resource.contentType === "video" && resource.fileUrl) {
      return (
        <Video
          source={{ uri: resource.fileUrl }}
          style={styles.resourceVideo}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
        />
      );
    }

    // Document content renderer with download link
    if (resource.contentType === "document" && resource.fileUrl) {
      return (
        <TouchableOpacity
          style={styles.documentPreview}
          onPress={() => Linking.openURL(resource.fileUrl!)}
        >
          <Ionicons name="document-outline" size={24} color="#1B6B63" />
          <Text style={styles.documentName}>
            {resource.fileName || "Download Document"}
          </Text>
        </TouchableOpacity>
      );
    }

    // Default text content renderer
    return <Text style={styles.resourceContent}>{resource.content}</Text>;
  };

  /**
   * Renders the expandable details section of a resource card
   * Includes content and tags with animated height
   * @param resource - The resource to display
   * @param index - Index for animation tracking
   */
  const renderDetails = (resource: UserResource, index: number) => {
    const isExpanded = expandedIndices.includes(index);
    if (!isExpanded) return null;

    return (
      <View style={styles.detailsContainer}>
        {renderResourceContent(resource)}

        {/* Tags section */}
        {resource.tags && resource.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {resource.tags.map((tag, tagIndex) => (
              <View key={tagIndex} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  // Loading state renderer
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <HeroBox
          title="Addiction Help"
          showBackButton
          customBackRoute="ResourcesList"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1B6B63" />
          <Text style={styles.loadingText}>Loading resources...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <HeroBox
          title="Addiction Help"
          showBackButton
          customBackRoute="ResourcesList"
        />

        {/* Empty state display */}
        {resources.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No resources available</Text>
            <Text style={styles.emptySubtext}>
              Check back later for helpful content
            </Text>
          </View>
        ) : (
          // Resource cards section
          <View style={styles.cardSection}>
            {resources.map((resource, index) => (
              <TouchableOpacity
                key={resource.id}
                style={styles.card}
                onPress={() => toggleCard(index)}
                activeOpacity={0.7}
              >
                <View style={styles.cardContent}>
                  {/* Main card content */}
                  <View style={styles.mainContent}>
                    <TouchableOpacity
                      onPress={() => Alert.alert("Resource", resource.title)}
                    >
                      <Ionicons
                        name="heart-outline"
                        size={22}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>
                    <View style={styles.textContainer}>
                      <Text style={styles.cardTitle}>{resource.title}</Text>
                      <Text style={styles.cardDescription}>
                        {resource.description}
                      </Text>
                      {renderDetails(resource, index)}
                    </View>
                    {/* Expand/collapse indicator */}
                    {!expandedIndices.includes(index) && (
                      <View style={styles.arrowButton}>
                        <Ionicons
                          name="chevron-forward"
                          size={22}
                          color="#FFFFFF"
                        />
                      </View>
                    )}
                  </View>
                  {/* Close button for expanded cards */}
                  {expandedIndices.includes(index) && (
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => toggleCard(index)}
                    >
                      <Ionicons
                        name="close-outline"
                        size={22}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles: Defines the visual appearance of the addiction help screen
const styles = StyleSheet.create({
  // Container styles
  safeArea: {
    flex: 1,
    backgroundColor: "#FDF6EC", // Warm, calming background color
  },
  container: {
    flexGrow: 1,
    paddingBottom: 120, // Extra padding for comfortable scrolling
  },
  
  // Loading state styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 16,
  },
  
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: "#666",
    fontWeight: "600",
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#999",
  },
  
  // Card section styles
  cardSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  card: {
    backgroundColor: "#006666", // Calming teal color
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    // Card elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
    overflow: "visible",
  },
  cardContent: {
    position: "relative",
    flexDirection: "column",
  },
  mainContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 40,
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  cardTitle: {
    fontWeight: "bold",
    color: "#FFFFFF",
    fontSize: 15,
    marginBottom: 6,
  },
  cardDescription: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  resourceContent: {
    fontSize: 14,
    color: "#FFFFFF",
    marginTop: 8,
    lineHeight: 20,
    fontWeight: "500",
    textAlign: "left",
  },
  resourceImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginTop: 8,
  },
  resourceVideo: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginTop: 8,
  },
  documentPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  documentName: {
    marginLeft: 8,
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  tag: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  detailsContainer: {
    marginTop: 8,
    overflow: "hidden",
  },
  arrowButton: {
    position: "absolute",
    right: 0,
    padding: 5,
    justifyContent: "center",
  },
  closeButton: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 5,
  },
});

export default AddictionHelpScreen;
