import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import HeroBox from "../../components/HeroBox";

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
    backgroundColor: "#FDF6EC", // Unified background color
  },
  container: {
    paddingBottom: 120,
    backgroundColor: "#FDF6EC", // Make scroll area match
  },
  startDayText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1B6B63",
    marginTop: 30,
    marginLeft: 34,
    marginBottom: 10,
  },
  contentOverlay: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 30, // Moved slightly lower
    alignItems: "center",
  },
  resourceButton: {
    backgroundColor: "#1B6B63",
    marginVertical: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
});

export default ResourcesScreen;
