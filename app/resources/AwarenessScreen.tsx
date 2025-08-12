import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Animated,
  Linking,
} from "react-native";
import HeroBox from "../../components/HeroBox";
import { Ionicons } from "@expo/vector-icons";

const AwarenessScreen = ({ navigation }) => {
  const resources = [
    {
      title: "Suicide Awareness",
      articleUrl: "https://www.canada.ca/en/public-health/services/suicide-prevention.html",
    },
    {
      title: "Toolkits & Guides",
      articleUrl: "https://www.mentalhealthcommission.ca/toolkits-and-guides/",
    },
    {
      title: "Parenting and Youth Support",
      articleUrl: "https://www.canada.ca/en/public-health/services/health-promotion/childhood-adolescence.html",
    },
    {
      title: "About Mental Health",
      articleUrl: "https://www.canada.ca/en/public-health/services/mental-health-services.html",
    },
  ];

  const [expandedIndices, setExpandedIndices] = useState([]);
  const [animations] = useState(
    resources.map(() => new Animated.Value(0))
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

  const renderDetails = (resource, index) => {
    const height = animations[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0, 40],
    });

    return (
      <Animated.View style={[styles.detailsContainer, { height }]}>
        <TouchableOpacity onPress={() => Linking.openURL(resource.articleUrl)}>
          <Text style={[styles.buttonSubText, styles.articleText]}>
            Go to Articles
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <HeroBox
          title="Awareness"
          showBackButton={true}
          customBackRoute="Resources"
        />

        {/* Image Section */}
        <View style={styles.imageWrapper}>
          <Image
            source={require("../../assets/awareness-placeholder.png")}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Intro Text Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>View our Educational Resources</Text>
        </View>

        {/* Resource Buttons */}
        {resources.map((resource, index) => (
          <TouchableOpacity
            key={index}
            style={styles.resourceButton}
            onPress={() => toggleCard(index)}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              <View style={styles.mainContent}>
                <View style={styles.textContainer}>
                  <Text style={styles.buttonText}>{resource.title}</Text>
                  {renderDetails(resource, index)}
                </View>
                {!expandedIndices.includes(index) && (
                  <View style={styles.arrowButton}>
                    <Ionicons name="chevron-forward" size={20} color="#1B6B63" />
                  </View>
                )}
              </View>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FDF6EC",
  },
  container: {
    paddingBottom: 100,
    alignItems: "center",
  },
  imageWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 2,
    marginTop: 20,
    width: "75%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#E0F2F1",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 20,
  },
  infoBox: {
    backgroundColor: "#E0F2F1",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginTop: 30,
    width: "85%",
    alignItems: "center",
   
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1B6B63",
    textAlign: "center",
  },
  resourceButton: {
    backgroundColor: "#FCE9C8",
    marginTop: 20,
    width: "85%",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    minHeight: 40, // Ensures consistent height for vertical centering
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#1B6B63",
  },
  buttonSubText: {
    fontSize: 14,
    color: "#1B6B63",
    marginTop: 4,
    lineHeight: 20,
    fontWeight: "500",
  },
  articleText: {
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  detailsContainer: {
    marginTop: 8,
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: -10,
    right: -10,
    padding: 5,
  },
  arrowButton: {
    position: "absolute",
    right: -10, // Removed top offset for vertical centering
    padding: 5,
    justifyContent: "center", // Centers icon vertically
  },
});

export default AwarenessScreen;