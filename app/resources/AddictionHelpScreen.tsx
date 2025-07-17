import React, { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import HeroBox from "../../components/HeroBox";

const AddictionHelpScreen = () => {
  const topics = [
    {
      title: "Crisis Helplines",
      description: "Access immediate support through Distress Centre (24/7) and 2-1-1 for mental health and community resources in Calgary.",
      phoneNumber: "403-266-4357", // Distress Centre
    },
    {
      title: "Domestic Violence Support",
      description: "Find support through Nisa Homes, Nisa Helpline, and Calgary Communities Against Sexual Abuse for women and children.",
      phoneNumber: "1-888-456-8043", // Nisa Homes
    },
    {
      title: "Suicide Prevention",
      description: "Get confidential support from Talk Suicide Canada and Kids Help Line, available 24/7.",
      phoneNumber: "1-833-456-4566", // Talk Suicide Canada
    },
  ];

  const [expandedIndices, setExpandedIndices] = useState<number[]>([]);
  const [animations] = useState(
    topics.map(() => new Animated.Value(0))
  );

  const toggleCard = (index) => {
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

  const showTitle = (title) => {
    Alert.alert("Resource", title, [{ text: "OK" }]);
  };

  const renderDetails = (topic, index) => {
    const height = animations[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0, 40],
    });

    return (
      <Animated.View style={[styles.detailsContainer, { height }]}>
        <TouchableOpacity onPress={() => Linking.openURL(`tel:${topic.phoneNumber}`)}>
          <Text style={[styles.buttonSubText, styles.resourceText]}>
            Call for Support
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <HeroBox title="Addiction Help" showBackButton customBackRoute="Resources" />

        <View style={styles.cardSection}>
          {topics.map((topic, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => toggleCard(index)}
              activeOpacity={0.7}
            >
              <View style={styles.cardContent}>
                <View style={styles.mainContent}>
                  <TouchableOpacity onPress={() => showTitle(topic.title)}>
                    <Ionicons name="person-outline" size={22} color="#FFFFFF" />
                  </TouchableOpacity>
                  <View style={styles.textContainer}>
                    <Text style={styles.cardTitle}>{topic.title}</Text>
                    <Text style={styles.cardDescription}>{topic.description}</Text>
                    {renderDetails(topic, index)}
                  </View>
                  {!expandedIndices.includes(index) && (
                    <View style={styles.arrowButton}>
                      <Ionicons name="chevron-forward" size={22} color="#FFFFFF" />
                    </View>
                  )}
                </View>
                {expandedIndices.includes(index) && (
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => toggleCard(index)}
                  >
                    <Ionicons name="close-outline" size={22} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
    fontSize: 15, // Updated heading size
    marginBottom: 6,
  },
  cardDescription: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  buttonSubText: {
    fontSize: 14, // Updated subheading size
    color: "#FFFFFF",
    marginTop: 4,
    lineHeight: 20,
    fontWeight: "500",
    textAlign: "left",
  },
  resourceText: {
    textDecorationLine: "underline",
    fontWeight: "600",
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