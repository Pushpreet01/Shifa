import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
} from "react-native";
import HeroBox from "../../components/HeroBox";
import { Ionicons } from "@expo/vector-icons";

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
        <HeroBox title="Resources" showBackButton={true} customBackRoute="Home" />

        <Text style={styles.startDayText}>Start your day !</Text>

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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF", // Changed to white
  },
  container: {
    paddingBottom: 120,
    backgroundColor: "#FFFFFF",
  },
  startDayText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1B6B63",
    marginTop: 40,
    marginLeft: 34,
    marginBottom: 10,
  },
  contentOverlay: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 20,
    zIndex: 1,
    alignItems: "center",
  },
  resourceButton: {
    backgroundColor: "#1B6B63", // Teal
    marginVertical: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginRight:22,
    flexDirection: "row",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
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
