import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import HeroBox from "../components/HeroBox";

const AddictionHelpScreen = () => {
  const topics = [
    {
      title: "Crisis Helplines",
      description:
        "If you're in crisis, call the local helpline or talk to someone immediately.",
    },
    {
      title: "Domestic Violence Support",
      description:
        "Support services and shelters are available. You are not alone.",
    },
    {
      title: "Suicide Prevention",
      description:
        "Get confidential support from trained professionals anytime.",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <HeroBox title="Addiction Help" />

        <View style={styles.cardSection}>
          {topics.map((topic, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>{topic.title}</Text>
              <Text style={styles.cardDescription}>{topic.description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F5E9",
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
    backgroundColor: "#CEEBC2", // lighter green
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  cardTitle: {
    fontWeight: "bold",
    color: "#1f4e2a",
    marginBottom: 5,
    fontSize: 16,
  },
  cardDescription: {
    color: "#333",
    fontSize: 13,
  },
});

export default AddictionHelpScreen;
