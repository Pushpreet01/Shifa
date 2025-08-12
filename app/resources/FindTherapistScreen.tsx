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

const FindTherapistScreen = ({ navigation }) => {
  const topics = [
    {
      title: "Certified Therapists",
      description: "Search licensed Muslim professionals in Alberta, including psychologists and social workers.",
      resourceUrl: "https://www.psychologytoday.com/ca/therapists/alberta?category=islam",
    },
    {
      title: "Online Consultations",
      description: "Connect virtually with Islamically integrated counselling services across Canada.",
      resourceUrl: "https://canadianmuslimcounselling.janeapp.com/",
    },
    {
      title: "Affordable Care Options",
      description: "Explore low-cost or sliding-scale therapy sessions in Calgary and Edmonton.",
      resourceUrl: "https://onlineintake.calgarycounselling.com/",
    },
  ];

  const [expandedIndices, setExpandedIndices] = useState([]);
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
        <TouchableOpacity onPress={() => Linking.openURL(topic.resourceUrl)}>
          <Text style={[styles.buttonSubText, styles.resourceText]}>
            Go to Resources
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <HeroBox
          title="Find a Therapist"
          showBackButton={true}
          onBackPress={() => navigation.navigate("Resources")}
        />

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
                    <Ionicons name="person-outline" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                  <View style={styles.textContainer}>
                    <Text style={styles.cardTitle}>{topic.title}</Text>
                    <Text style={styles.cardDescription}>{topic.description}</Text>
                    {renderDetails(topic, index)}
                  </View>
                  {!expandedIndices.includes(index) && (
                    <View style={styles.arrowButton}>
                      <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                    </View>
                  )}
                </View>
                {expandedIndices.includes(index) && (
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => toggleCard(index)}
                  >
                    <Ionicons name="close-outline" size={20} color="#FFFFFF" />
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
    backgroundColor: "#1B6B63",
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
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
    marginBottom: 5,
  },
  cardDescription: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  buttonSubText: {
    fontSize: 14,
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
    right: 5,
    padding: 5,
    justifyContent: "center",
  },
  closeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    padding: 5,
  },
});

export default FindTherapistScreen;