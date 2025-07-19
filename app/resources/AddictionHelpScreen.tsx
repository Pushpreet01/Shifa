import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Linking,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
import HeroBox from "../../components/HeroBox";
import { getUserResources, UserResource } from "../../services/resourceService";
import { Resource } from "../../services/adminResourceService";

const AddictionHelpScreen = () => {
  const [resources, setResources] = useState<UserResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndices, setExpandedIndices] = useState<number[]>([]);
  const [animations] = useState<Animated.Value[]>([]);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      const fetchedResources = await getUserResources("AddictionHelp");
      setResources(fetchedResources);

      // Initialize animations for each resource
      const newAnimations = fetchedResources.map(() => new Animated.Value(0));
      setAnimations(newAnimations);
    } catch (error) {
      console.error("Error loading addiction help resources:", error);
      Alert.alert("Error", "Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  const toggleCard = (index: number) => {
    const isExpanded = expandedIndices.includes(index);
    const newExpandedIndices = isExpanded
      ? expandedIndices.filter((i) => i !== index)
      : [...expandedIndices, index];

    setExpandedIndices(newExpandedIndices);

    Animated.timing(animations[index], {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const renderResourceContent = (resource: UserResource) => {
    if (resource.contentType === "image" && resource.fileUrl) {
      return (
        <Image
          source={{ uri: resource.fileUrl }}
          style={styles.resourceImage}
        />
      );
    }

    if (resource.contentType === "video" && resource.fileUrl) {
      return (
        <Video
          source={{ uri: resource.fileUrl }}
          style={styles.resourceVideo}
          useNativeControls
          resizeMode="contain"
        />
      );
    }

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

    return <Text style={styles.resourceContent}>{resource.content}</Text>;
  };

  const renderDetails = (resource: UserResource, index: number) => {
    const height = animations[index]?.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 100],
    });

    return (
      <Animated.View style={[styles.detailsContainer, { height }]}>
        {renderResourceContent(resource)}

        {resource.tags && resource.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {resource.tags.map((tag, tagIndex) => (
              <View key={tagIndex} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <HeroBox
          title="Addiction Help"
          showBackButton
          customBackRoute="Resources"
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
          customBackRoute="Resources"
        />

        {resources.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No resources available</Text>
            <Text style={styles.emptySubtext}>
              Check back later for helpful content
            </Text>
          </View>
        ) : (
          <View style={styles.cardSection}>
            {resources.map((resource, index) => (
              <TouchableOpacity
                key={resource.id}
                style={styles.card}
                onPress={() => toggleCard(index)}
                activeOpacity={0.7}
              >
                <View style={styles.cardContent}>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FDF6EC",
  },
  container: {
    flexGrow: 1,
    paddingBottom: 120,
  },
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
  cardSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  card: {
    backgroundColor: "#006666",
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
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
