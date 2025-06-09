import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../navigation/AppNavigator";
import FirebaseEventService from "../services/firebaseEventService";

type Props = NativeStackScreenProps<HomeStackParamList, "OpportunityDetails">;

export type OpportunityDetailsParams = {
  title: string;
  date: string;
  timing: string;
  location: string;
  description: string;
  eventId: string;
};

const OpportunityDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { title, date, timing, location, description, eventId } =
    route.params as OpportunityDetailsParams;
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);

  useEffect(() => {
    checkRegistrationStatus();
  }, []);

  const checkRegistrationStatus = async () => {
    try {
      const status = await FirebaseEventService.checkRegistration(eventId);
      setIsRegistered(status);
    } catch (error) {
      console.error("Error checking registration:", error);
    } finally {
      setCheckingRegistration(false);
    }
  };

  const handleRegistration = async () => {
    setLoading(true);
    try {
      const success = await FirebaseEventService.registerForEvent(eventId);
      if (success) {
        setIsRegistered(true);
        Alert.alert(
          "Success",
          "You have successfully registered for this event!",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", "You are already registered for this event.", [
          { text: "OK" },
        ]);
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to register for the event. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    setLoading(true);
    try {
      const success = await FirebaseEventService.cancelRegistration(eventId);
      if (success) {
        setIsRegistered(false);
        Alert.alert("Success", "Your registration has been cancelled.", [
          { text: "OK" },
        ]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to cancel registration. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heroBox}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButtonContainer}
          >
            <Ionicons name="chevron-back-outline" size={24} color="#1B6B63" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Details</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Announcements")}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#C44536"
              />
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

      <ScrollView style={styles.content}>
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>{date}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Time</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>{timing}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>{location}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                {description || "No description available for this event."}
              </Text>
            </View>
          </View>

          {checkingRegistration ? (
            <ActivityIndicator
              size="large"
              color="#1B6B63"
              style={styles.loader}
            />
          ) : (
            <TouchableOpacity
              style={[
                styles.actionButton,
                isRegistered ? styles.cancelButton : styles.registerButton,
              ]}
              onPress={
                isRegistered ? handleCancelRegistration : handleRegistration
              }
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.actionButtonText}>
                  {isRegistered ? "Cancel Registration" : "Register for Event"}
                </Text>
              )}
            </TouchableOpacity>
          )}
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
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
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
  content: {
    flex: 1,
  },
  detailsContainer: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E2E2E",
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  section: {
    marginBottom: 20,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E2E2E",
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
  },
  sectionText: {
    fontSize: 16,
    color: "#2E2E2E",
    lineHeight: 24,
  },
  actionButton: {
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 35,
    marginTop: 15,
    marginBottom: 40,
    alignItems: "center",
    width: "80%",
  },
  registerButton: {
    backgroundColor: "#1B6B63",
  },
  cancelButton: {
    backgroundColor: "#C44536",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  loader: {
    marginVertical: 20,
  },
});

export default OpportunityDetailsScreen;
