import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  Platform,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../../navigation/AppNavigator";
import DateTimePicker from "@react-native-community/datetimepicker";
import firebaseEventService from "../../services/firebaseEventService";
import { auth, db } from "../../config/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

type Props = NativeStackScreenProps<HomeStackParamList, "EventsForm">;

const EventsFormScreen: React.FC<Props> = ({ navigation }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today);
  const [name, setName] = useState("");
  const [dateString, setDateString] = useState(
    today.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  );
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setName(userData.fullName || "");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, []);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      if (selectedDate < currentDate) {
        Alert.alert(
          "Invalid Date",
          "You cannot select a date in the past. Please choose today or a future date."
        );
        return;
      }

      setDate(selectedDate);
      setDateString(
        selectedDate.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      );
    }
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      setStartTime(selectedTime);
      // If end time is before start time, update end time
      if (selectedTime > endTime) {
        const newEndTime = new Date(selectedTime);
        newEndTime.setHours(selectedTime.getHours() + 1);
        setEndTime(newEndTime);
      }
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      if (selectedTime <= startTime) {
        Alert.alert("Invalid Time", "End time must be after start time");
        return;
      }
      setEndTime(selectedTime);
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Event title is required");
      return false;
    }
    if (!location.trim()) {
      Alert.alert("Error", "Event location is required");
      return false;
    }

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    if (date < currentDate) {
      Alert.alert("Error", "Event date cannot be in the past");
      return false;
    }

    if (endTime <= startTime) {
      Alert.alert("Error", "End time must be after start time");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const eventData = {
        title,
        date,
        startTime: formatTime(startTime),
        endTime: formatTime(endTime),
        location,
        description,
      };

      const eventId = await firebaseEventService.addEvent(eventData);

      if (eventId) {
        Alert.alert("Success", "Event has been added successfully", [
          { text: "OK", onPress: () => navigation.navigate("Events") },
        ]);
      } else {
        Alert.alert("Error", "Failed to add event. Please try again.");
      }
    } catch (error: unknown) {
      let errorMessage = "Failed to add event";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
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
          <Text style={styles.headerTitle}>Create Event</Text>
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

      <ScrollView style={styles.formContainer}>
        <Text style={styles.label}>Your Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: "#f0f0f0" }]}
          value={name}
          editable={false}
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Event Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter event title"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Event Date</Text>
        <TouchableOpacity
          style={styles.dateSelector}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>{dateString}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={today}
          />
        )}
        <Text style={styles.helperText}>
          Events can only be scheduled for today or future dates
        </Text>

        <View style={styles.timeContainer}>
          <View style={styles.timeField}>
            <Text style={styles.label}>Start Time</Text>
            <TouchableOpacity
              style={styles.timeSelector}
              onPress={() => setShowStartTimePicker(true)}
            >
              <Text style={styles.timeText}>{formatTime(startTime)}</Text>
            </TouchableOpacity>
            {showStartTimePicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                is24Hour={false}
                display="default"
                onChange={handleStartTimeChange}
              />
            )}
          </View>

          <View style={styles.timeField}>
            <Text style={styles.label}>End Time</Text>
            <TouchableOpacity
              style={styles.timeSelector}
              onPress={() => setShowEndTimePicker(true)}
            >
              <Text style={styles.timeText}>{formatTime(endTime)}</Text>
            </TouchableOpacity>
            {showEndTimePicker && (
              <DateTimePicker
                value={endTime}
                mode="time"
                is24Hour={false}
                display="default"
                onChange={handleEndTimeChange}
              />
            )}
          </View>
        </View>

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Enter event location"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter event description"
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? "Adding Event..." : "Add Event"}
          </Text>
        </TouchableOpacity>
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
  formContainer: {
    padding: 18,
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2E2E2E",
    marginBottom: 5,
    marginTop: 15,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 12,
    fontSize: 16,
    color: "#2E2E2E",
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
    marginLeft: 2,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  dateSelector: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 12,
    marginBottom: 5,
  },
  dateText: {
    fontSize: 16,
    color: "#2E2E2E",
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  timeField: {
    width: "48%",
  },
  timeSelector: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 12,
  },
  timeText: {
    fontSize: 16,
    color: "#2E2E2E",
  },
  submitButton: {
    backgroundColor: "#F4A941",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 30,
  },
  disabledButton: {
    backgroundColor: "#F4A941",
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default EventsFormScreen;
