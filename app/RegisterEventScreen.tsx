// screens/RegisterEventScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { CalendarEvent } from "../services/calendarService";
import firebaseEventService from "../services/firebaseEventService";
import eventsData from "../event.json";

type Props = NativeStackScreenProps<RootStackParamList, "RegisterEvent">;

const RegisterEventScreen: React.FC<Props> = ({ route, navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const { eventId } = route.params;

  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      try {
        // First try to fetch from Firestore
        const eventRef = doc(db, "events", eventId);
        const eventSnapshot = await getDoc(eventRef);

        if (eventSnapshot.exists()) {
          const eventData = eventSnapshot.data();
          // Check registration status for current user
          // In a real app, you'd use authenticated user ID instead of 'current-user'
          const isRegistered = await checkRegistration(eventSnapshot.id);

          setEvent({
            id: eventSnapshot.id,
            title: eventData.title,
            date: new Date(eventData.date),
            startTime: eventData.startTime,
            endTime: eventData.endTime,
            location: eventData.location,
            description: eventData.description || "",
            registered: isRegistered,
          });
        } else {
          // Fallback to local JSON data
          try {
            // For development purposes, we're using the imported JSON directly
            // In production, you'd make an API call to fetch event data
            const eventsData = await import("../event.json");
            const foundEvent = eventsData.events.find((e: any) => e.id === eventId);

            if (foundEvent) {
              setEvent({
                id: foundEvent.id,
                title: foundEvent.title,
                date: new Date(foundEvent.date),
                startTime: foundEvent.startTime,
                endTime: foundEvent.endTime,
                location: foundEvent.location,
                description: foundEvent.description || "",
                registered: foundEvent.registered || false,
              });
            } else {
              Alert.alert("Error", "Event not found");
              navigation.goBack();
            }
          } catch (jsonError) {
            console.error("Error loading JSON data:", jsonError);
            Alert.alert("Error", "Failed to load event details");
            navigation.goBack();
          }
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
        Alert.alert("Error", "Could not load event details. Please try again.");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId, navigation]);

  // Helper function to check registration status
  const checkRegistration = async (
    eventId: string,
    userId: string = "current-user"
  ) => {
    try {
      const q = query(
        collection(db, "registrations"),
        where("eventId", "==", eventId),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking registration:", error);
      return false;
    }
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return false;
    }
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    if (!event) return;

    setIsRegistering(true);
    try {
      // Add registration to Firestore
      await addDoc(collection(db, "registrations"), {
        eventId: event.id,
        userId: "current-user", // In a real app, use authenticated user ID
        name,
        email,
        phone,
        timestamp: new Date().toISOString(),
      });

      // Register for the event using firebaseEventService
      await firebaseEventService.registerForEvent(event.id);

      Alert.alert(
        "Registration Successful",
        `You have registered for ${event.title}!`,
        [{ text: "OK", onPress: () => navigation.navigate("Events") }]
      );
    } catch (error) {
      console.error("Error registering for event:", error);
      Alert.alert("Error", "Failed to register. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!event) return;

    setIsRegistering(true);
    try {
      // Cancel registration in Firestore
      await firebaseEventService.cancelRegistration(event.id);

      Alert.alert(
        "Registration Cancelled",
        `Your registration for ${event.title} has been cancelled.`,
        [{ text: "OK", onPress: () => navigation.navigate("Events") }]
      );
    } catch (error) {
      console.error("Error cancelling registration:", error);
      Alert.alert("Error", "Failed to cancel registration. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3A7D44" />
        <Text style={styles.loadingText}>Loading event details...</Text>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Event not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButtonContainer}
        >
          <Text style={styles.backButtonIcon}>←</Text>
          <Text style={styles.headerTitle}>
            {event.registered ? "Your Registration" : "Register for Event"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.eventInfoContainer}>
          <Text style={styles.eventTitle}>{event.title}</Text>

          <View style={styles.eventDetailsBox}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailText}>
                {event.date.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time:</Text>
              <Text style={styles.detailText}>
                {event.startTime} - {event.endTime}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location:</Text>
              <Text style={styles.detailText}>{event.location}</Text>
            </View>

            <View style={styles.descriptionContainer}>
              <Text style={styles.detailLabel}>Description:</Text>
              <Text style={styles.descriptionText}>{event.description}</Text>
            </View>
          </View>
        </View>

        {event.registered ? (
          <View style={styles.registeredContainer}>
            <Text style={styles.registeredText}>
              You are registered for this event!
            </Text>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelRegistration}
              disabled={isRegistering}
            >
              <Text style={styles.buttonText}>
                {isRegistering ? "Cancelling..." : "Cancel Registration"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Registration Details</Text>

            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Phone Number (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />

            <TouchableOpacity
              style={[
                styles.registerButton,
                isRegistering && styles.disabledButton,
              ]}
              onPress={handleRegister}
              disabled={isRegistering}
            >
              <Text style={styles.buttonText}>
                {isRegistering ? "Registering..." : "Register Now"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F0",
  },
  header: {
    height: 80,
    paddingHorizontal: 20,
    justifyContent: "flex-end",
    paddingBottom: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonIcon: {
    fontSize: 24,
    color: "#3A7D44",
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#3A7D44",
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  eventInfoContainer: {
    marginBottom: 20,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3A7D44",
    marginBottom: 15,
  },
  eventDetailsBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: "600",
    color: "#3A7D44",
    width: 80,
  },
  detailText: {
    flex: 1,
    color: "#333",
  },
  descriptionContainer: {
    marginTop: 5,
  },
  descriptionText: {
    color: "#333",
    marginTop: 5,
    lineHeight: 20,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3A7D44",
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3A7D44",
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 12,
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  registerButton: {
    backgroundColor: "#3A7D44",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: "#9DC08B",
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  registeredContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  registeredText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3A7D44",
    marginBottom: 20,
  },
  cancelButton: {
    backgroundColor: "#E74C3C",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    width: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F0",
  },
  loadingText: {
    marginTop: 10,
    color: "#3A7D44",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F0",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#E74C3C",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#3A7D44",
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 20,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

export default RegisterEventScreen;
