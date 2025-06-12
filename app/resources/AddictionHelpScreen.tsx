import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import HeroBox from "../../components/HeroBox";

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
        <HeroBox title="Addiction Help" showBackButton customBackRoute="Resources" />
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
    backgroundColor: "#FDF6EC", // changed to white
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
    backgroundColor: "#006666", // light teal
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  cardTitle: {
    fontWeight: "bold",
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 6,
  },
  cardDescription: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
  },
});

export default AddictionHelpScreen;
