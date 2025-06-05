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
import HeroBox from "../components/HeroBox";
import { Ionicons } from "@expo/vector-icons";

const ResourcesScreen = ({ navigation }) => {
  const resources = [
    { label: "Addiction Help", route: "AddictionHelp" },
    { label: "Find a Therapist", route: "FindTherapist" },
    { label: "Counselling", route: "Counselling" },
    { label: "Awareness", route: "Awareness" },
    { label: "Support System" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <HeroBox title="Resources" showBackButton={true} customBackRoute="Home" />

        <Text style={styles.startDayText}>Start your day</Text>

        <View style={styles.buttonSection}>
          {resources.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.resourceButton}
              onPress={() => item.route && navigation.navigate(item.route)}
              disabled={!item.route}
            >
              <Text style={styles.buttonText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <Ionicons name="people-outline" size={24} color="#1B6B63" />
        <Image source={require("../assets/logo.png")} style={styles.centerLogo} />
        <Ionicons name="settings-outline" size={24} color="#1B6B63" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FDF6EC",
  },
  container: {
    paddingBottom: 120,
  },
  startDayText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1B6B63",
    marginTop: 30,
    marginLeft: 34,
    marginBottom: 10,
  },
  buttonSection: {
    alignItems: "center",
    marginTop: 10,
  },
  resourceButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 12,
    width: "85%",
    backgroundColor: "#008080",
    borderRightWidth: 10,
    borderRightColor: "#F4A941",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: "#F4A941",
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
