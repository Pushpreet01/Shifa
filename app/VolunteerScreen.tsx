import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../navigation/AppNavigator";

const VolunteerScreen: React.FC<NativeStackScreenProps<HomeStackParamList, any>> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heroBox}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonContainer}>
            <Ionicons name="chevron-back-outline" size={24} color="#1B6B63" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Volunteer</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.mainButton} onPress={() => navigation.navigate("Opportunities")}>
          <Text style={styles.mainButtonText}>Browse Upcoming Opportunities</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mainButton}>
          <Text style={styles.mainButtonText}>My Learnings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mainButton}>
          <Text style={styles.mainButtonText}>Volunteer Rewards</Text>
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>Registered For</Text>
        {/* Hard coded job posting cards*/}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Meal Delivery Driver</Text>
          <Text style={styles.cardSubtitle}>Caring Communities</Text>
          <Text style={styles.cardDetails}>2-4 hours weekly</Text>
          <TouchableOpacity style={styles.detailsButton}>
            <Text style={styles.detailsButtonText}>Details</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Community Garden Day</Text>
          <Text style={styles.cardSubtitle}>Mar 8, 2025 • 10:00 AM - 2:00 PM</Text>
          <Text style={styles.cardDetails}>Central Park</Text>
          <TouchableOpacity style={styles.detailsButton}>
            <Text style={styles.detailsButtonText}>Details</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  heroBox: {
    backgroundColor: "#FDF6EC",
    paddingTop: 40,
    paddingBottom: 18,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
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
    paddingLeft: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: 0,
  },
  backButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1B6B63",
    marginLeft: 8,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  mainButton: {
    backgroundColor: "#1B6B63",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  mainButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 17,
    textAlign: "center",
  },
  progressText: {
    color: "#2E2E2E",
    fontWeight: "bold",
    fontSize: 17,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E2E2E",
    marginTop: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: "#F4A941",
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 17,
    color: "#2E2E2E",
    marginBottom: 2,
  },
  cardSubtitle: {
    color: "#2E2E2E",
    fontSize: 15,
    marginBottom: 2,
  },
  cardDetails: {
    color: "#2E2E2E",
    fontSize: 14,
    marginBottom: 10,
  },
  detailsButton: {
    alignSelf: "flex-end",
    backgroundColor: "#1B6B63",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 18,
  },
  detailsButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
});

export default VolunteerScreen; 