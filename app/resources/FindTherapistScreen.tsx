import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import HeroBox from "../../components/HeroBox";

const FindTherapistScreen = ({ navigation }) => {
  const topics = [
    {
      title: "Certified Therapists",
      description: "Search licensed professionals based on your needs and location.",
    },
    {
      title: "Online Consultations",
      description: "Connect virtually with verified therapists from your comfort zone.",
    },
    {
      title: "Affordable Care Options",
      description: "Explore low-cost or sliding-scale therapy sessions near you.",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <HeroBox
          title="Find a Therapist"
          showBackButton={true}
          onBackPress={() => navigation.navigate("ResourcesMain")}
        />

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
    backgroundColor: "#feb204",
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
    color: "#FFFFFF",
    marginBottom: 5,
    fontSize: 20,
  },
  cardDescription: {
    color: "#FFFFFF",
    fontSize: 13,
  },
});

export default FindTherapistScreen;
