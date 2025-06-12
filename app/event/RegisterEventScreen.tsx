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
import { HomeStackParamList } from "../../navigation/AppNavigator";
import { db, auth } from "../../config/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { CalendarEvent } from "../../services/calendarService";
import firebaseEventService from "../../services/firebaseEventService";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

type Props = NativeStackScreenProps<HomeStackParamList, "RegisterEvent">;

const RegisterEventScreen: React.FC<Props> = ({ route, navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const { eventId } = route.params;
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      console.log("Current user data:", currentUser); // Debug log
      if (currentUser) {
        console.log("User email:", currentUser.email);
        console.log("User displayName:", currentUser.displayName);
        console.log("User metadata:", currentUser.metadata);

        // Get the user's data from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("User data from Firestore:", userData);
            setName(userData.fullName); // Changed from name to fullName
          }
        } catch (error) {
          console.error("Error getting user data:", error);
          Alert.alert("Error", "Could not load user data. Please try again.");
          navigation.goBack();
        }

        setEmail(currentUser.email || "");
      } else {
        Alert.alert("Error", "You must be logged in to register for an event.");
        navigation.goBack();
      }
    };

    fetchUserData();
  }, [navigation]);

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
            source: "firebase",
          });
        } else {
          // Fallback to local JSON data
          try {
            const eventsData = await import("../event.json");
            const foundEvent = eventsData.events.find(
              (e: any) => e.id === eventId
            );

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
                source: "local",
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
    userId: string = auth.currentUser?.uid || "current-user" // Use authenticated user ID
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

  const handleRegister = async () => {
    if (!event) return;

    try {
      setIsRegistering(true);
      const success = await firebaseEventService.registerForEvent(
        event.id,
        phone
      );

      if (success) {
        setEvent((prevEvent) => {
          if (!prevEvent) return null;
          return { ...prevEvent, registered: true };
        });

        Alert.alert("Success", `You have registered for ${event.title}!`, [
          { text: "OK", onPress: () => navigation.navigate("Events") },
        ]);
      }
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
      const success = await firebaseEventService.cancelRegistration(event.id);

      if (success) {
        // Toggle the registered field in the event state back to false
        setEvent((prevEvent) => {
          if (prevEvent) {
            return { ...prevEvent, registered: false };
          }
          return prevEvent;
        });

        Alert.alert(
          "Registration Cancelled",
          `Your registration for ${event.title} has been cancelled.`,
          [
            {
              text: "OK",
              onPress: () =>
                navigation.navigate("Events", { refresh: Date.now() }),
            },
          ]
        );
      } else {
        Alert.alert(
          "Error",
          "Failed to cancel registration. Please try again."
        );
      }
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
        <ActivityIndicator size="large" color="#2E2E2E" />
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
      <View style={styles.heroBox}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButtonContainer}
          >
            <Ionicons name="chevron-back-outline" size={24} color="#1B6B63" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {event && event.registered
              ? "Your Registration"
              : "Register for Event"}
          </Text>
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
              style={[styles.input, { backgroundColor: "#f0f0f0" }]} // Grayed out background to indicate non-editable
              value={name}
              editable={false}
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[styles.input, { backgroundColor: "#f0f0f0" }]} // Grayed out background to indicate non-editable
              value={email}
              editable={false}
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
    backgroundColor: "#FFFFFF",
  },
  heroBox: {
    backgroundColor: "#FDF6EC",
    paddingTop: 40,
    paddingBottom: 16,
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
    color: "#2E2E2E",
    marginBottom: 15,
  },
  eventDetailsBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: "600",
    color: "#1B6B63",
    width: 80,
  },
  detailText: {
    flex: 1,
    color: "#2E2E2E",
  },
  descriptionContainer: {
    marginTop: 5,
  },
  descriptionText: {
    color: "#2E2E2E",
    marginTop: 5,
    lineHeight: 20,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1B6B63",
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2E2E2E",
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 12,
    fontSize: 16,
    color: "#2E2E2E",
    marginBottom: 10,
  },
  registerButton: {
    backgroundColor: "#1B6B63",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: "#F4A941",
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  registeredContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 5,
    borderLeftColor: "#F4A941",
  },
  registeredText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1B6B63",
    marginBottom: 20,
  },
  cancelButton: {
    backgroundColor: "#F4A941",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 10,
    color: "#2E2E2E",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#F4A941",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#1B6B63",
    borderRadius: 20,
    padding: 12,
    paddingHorizontal: 20,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

export default RegisterEventScreen;
