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

  const [expandedIndices, setExpandedIndices] = useState([]);
  const [animations] = useState(
    supportResources.map(() => new Animated.Value(0))
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

  const showLabel = (label) => {
    Alert.alert("Resource", label, [{ text: "OK" }]);
  };

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

  const handleBack = () => {
    navigation.navigate("Resources");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Unified Header styled like HeroBox */}
      <View style={styles.heroBox}>
        <View style={styles.header}>
          <View style={styles.leftSection}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="chevron-back-outline" size={24} color="#1B6B63" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Support System</Text>
          </View>

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

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.container}>
        {supportResources.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.cardRow}
            onPress={() => toggleCard(index)}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
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
  heroBox: {
    backgroundColor: "#FDF6EC",
    paddingTop: 40,
    paddingBottom: 18,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
    color: "#1B6B63",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
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
  container: {
    paddingBottom: 100,
    alignItems: "center",
    paddingTop: 20,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12, // Reduced from 16 for compactness
    width: "85%", // Reduced from 90% for smaller tiles
    backgroundColor: "#A8D8C9",
    borderRadius: 20,
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
    paddingVertical: 10, // Reduced from 14 for smaller tiles
    paddingHorizontal: 14, // Reduced from 18
  },
  mainContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 40, // Reduced from 60 to match smaller iconBox
  },
  iconBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 40, // Half of 80 for a perfect circle
    padding: 12, // Reduced from 16
    width: 80, // Reduced from 120
    height: 80, // Reduced from 120
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 8, // Reduced from 10
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
  detailsContainer: {
    marginTop: 8,
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 5, // Changed from -10 to stay within tile
    right: 5, // Changed from -10
    padding: 5,
  },
  arrowButton: {
    position: "absolute",
    right: 5, // Changed from -10
    padding: 5,
    justifyContent: "center",
  },
});

export default SupportSystemScreen;