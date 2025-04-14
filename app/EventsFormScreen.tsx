import React, { useState } from "react";
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
import { RootStackParamList } from "../navigation/AppNavigator";
// Comment out the problematic import temporarily
// import DateTimePicker from "@react-native-community/datetimepicker";
import firebaseEventService from "../services/firebaseEventService";
import { db } from "../firebaseConfig";

type Props = NativeStackScreenProps<RootStackParamList, "EventsForm">;

const EventsFormScreen: React.FC<Props> = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [dateString, setDateString] = useState(new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }));
  const [startTime, setStartTime] = useState("9:00 AM");
  const [endTime, setEndTime] = useState("10:00 AM");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  // Removed showDatePicker state since we're not using the DateTimePicker component
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Alternative method for date selection (temporary)
  const handleDateInput = (text: string) => {
    try {
      const parsedDate = new Date(text);
      if (!isNaN(parsedDate.getTime())) {
        setDate(parsedDate);
        setDateString(parsedDate.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        }));
      }
    } catch (error) {
      // Invalid date format, keep the current date
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
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Format the startTime and endTime
      const formattedStartTime = startTime; // In real app, format this properly
      const formattedEndTime = endTime; // In real app, format this properly

      const eventData = {
        title,
        date,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
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
    } catch (error) {
      console.error("Error adding event:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButtonContainer}
        >
          <Text style={styles.backButton}>←</Text>
          <Text style={styles.headerTitle}>Add New Event</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.formContainer}>
        <Text style={styles.label}>Event Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter event title"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Event Date</Text>
        {/* Replace DateTimePicker with a simple TextInput temporarily */}
        <TextInput
          style={styles.input}
          value={dateString}
          onChangeText={handleDateInput}
          placeholder="Enter date (MM/DD/YYYY)"
          placeholderTextColor="#999"
        />
        <Text style={styles.helperText}>Format: Month/Day/Year (e.g., 8/17/2025)</Text>

        <View style={styles.timeContainer}>
          <View style={styles.timeField}>
            <Text style={styles.label}>Start Time</Text>
            <TextInput
              style={styles.timeInput}
              value={startTime}
              onChangeText={setStartTime}
              placeholder="e.g., 9:00 AM"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.timeField}>
            <Text style={styles.label}>End Time</Text>
            <TextInput
              style={styles.timeInput}
              value={endTime}
              onChangeText={setEndTime}
              placeholder="e.g., 5:00 PM"
              placeholderTextColor="#999"
            />
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
  backButton: {
    fontSize: 24,
    color: "#3A7D44",
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#3A7D44",
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#3A7D44",
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
    color: "#333",
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
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeField: {
    width: "48%",
  },
  timeInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#3A7D44",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 30,
  },
  disabledButton: {
    backgroundColor: "#9DC08B",
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default EventsFormScreen;