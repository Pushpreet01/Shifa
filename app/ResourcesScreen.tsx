import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from "react-native";
import HeroBox from "../components/HeroBox";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const ResourcesScreen = ({ navigation }) => {
  const resources = [
    { label: "Addiction Help", route: "AddictionHelp" },
    { label: "Find a Therapist", route: "FindTherapist" },
    { label: "Counselling", route: "Counselling" },
    { label: "Awareness", route: "Awareness" },
    { label: "Support System", route: "SupportSystem" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <HeroBox title="Resources" />
        <Text style={styles.startDayText}>Start your day</Text>

        <View style={styles.backgroundWrapper}>
          <Image
            source={require("../assets/flower.png")}
            style={styles.backgroundImage}
            resizeMode="contain"
          />
          <View style={styles.contentOverlay}>
            {resources.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.resourceButton}
                onPress={() => item.route && navigation.navigate(item.route)}
              >
                <Text style={styles.buttonText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <Ionicons name="people-outline" size={24} color="#3A7D44" />
        <Image
          source={require("../assets/logo.png")}
          style={styles.centerLogo}
        />
        <Ionicons name="settings-outline" size={24} color="#3A7D44" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F5E9",
  },
  container: {
    paddingBottom: 120,
  },
  startDayText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2B5A32",
    marginTop: 40,
    marginLeft: 34,
    marginBottom: 10,
  },
  backgroundWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    paddingVertical: 127,
  },
  backgroundImage: {
    position: "absolute",
    width: 480,
    height: 480,
    opacity: 0.7,
    bottom: 37,
    alignSelf: "center",
  },
  contentOverlay: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 20,
    zIndex: 1,
    alignItems: "center",
  },
  resourceButton: {
    backgroundColor: "#CEEBC2",
    opacity: 0.8,
    marginRight: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
    marginTop: 10,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    color: "#2B5A32",
    fontWeight: "bold",
    fontSize: 14,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: "#D6EFC7",
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  centerLogo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
});

export default ResourcesScreen;
