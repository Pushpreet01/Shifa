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
  Switch,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../../navigation/AppNavigator";
import DateTimePicker from "@react-native-community/datetimepicker";
import firebaseEventService from "../../services/firebaseEventService";
import firebaseOpportunityService from "../../services/FirebaseOpportunityService";
import { auth, db } from "../../config/firebaseConfig";
import { doc, getDoc, collection } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import KeyboardAwareWrapper from "../../components/KeyboardAwareWrapper";
import ProfanityFilterService from "../../services/profanityFilterService";
import HeroBox from "../../components/HeroBox";

type Props = NativeStackScreenProps<HomeStackParamList, "EventsForm">;

const MAX_WORD_LIMITS = {
  title: 10,
  location: 10,
  description: 250,
  volunteerDescription: 250,
  timings: 20,
  rewards: 20,
  refreshments: 20,
};

const EventsFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Use the selected date from route params if available, otherwise use today
  const initialDate = route.params?.selectedDate
    ? new Date(route.params.selectedDate)
    : today;
  // Ensure the date is valid and set to start of day
  if (isNaN(initialDate.getTime())) {
    initialDate.setTime(today.getTime());
  }
  initialDate.setHours(0, 0, 0, 0);

  console.log("[EventsFormScreen] Route params:", route.params);
  console.log("[EventsFormScreen] Initial date:", initialDate);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(initialDate);
  const [name, setName] = useState("");
  const [dateString, setDateString] = useState(
    initialDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  );
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(() => {
    const initialEndTime = new Date();
    initialEndTime.setHours(initialEndTime.getHours() + 1);
    return initialEndTime;
  });
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsVolunteers, setNeedsVolunteers] = useState(false);
  const [volunteersNeeded, setVolunteersNeeded] = useState(1);
  const [volunteerDescription, setVolunteerDescription] = useState("");
  const [timings, setTimings] = useState("");
  const [rewards, setRewards] = useState("");
  const [refreshments, setRefreshments] = useState("");

  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

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
    if (countWords(title) > MAX_WORD_LIMITS.title) {
      Alert.alert(
        "Error",
        `Event title exceeds word limit of ${MAX_WORD_LIMITS.title} words`
      );
      return false;
    }
    if (!location.trim()) {
      Alert.alert("Error", "Event location is required");
      return false;
    }
    if (countWords(location) > MAX_WORD_LIMITS.location) {
      Alert.alert(
        "Error",
        `Event location exceeds word limit of ${MAX_WORD_LIMITS.location} words`
      );
      return false;
    }
    if (countWords(description) > MAX_WORD_LIMITS.description) {
      Alert.alert(
        "Error",
        `Event description exceeds word limit of ${MAX_WORD_LIMITS.description} words`
      );
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

    if (needsVolunteers) {
      if (volunteersNeeded < 1 || volunteersNeeded > 50) {
        Alert.alert("Error", "Volunteers needed must be between 1 and 50");
        return false;
      }
      if (!volunteerDescription.trim()) {
        Alert.alert("Error", "Volunteer task description is required");
        return false;
      }
      if (countWords(volunteerDescription) > MAX_WORD_LIMITS.volunteerDescription) {
        Alert.alert(
          "Error",
          `Volunteer task description exceeds word limit of ${MAX_WORD_LIMITS.volunteerDescription} words`
        );
        return false;
      }
      if (!timings.trim()) {
        Alert.alert("Error", "Volunteer timings are required");
        return false;
      }
      if (countWords(timings) > MAX_WORD_LIMITS.timings) {
        Alert.alert(
          "Error",
          `Volunteer timings exceed word limit of ${MAX_WORD_LIMITS.timings} words`
        );
        return false;
      }
      if (countWords(rewards) > MAX_WORD_LIMITS.rewards) {
        Alert.alert(
          "Error",
          `Rewards exceed word limit of ${MAX_WORD_LIMITS.rewards} words`
        );
        return false;
      }
      if (countWords(refreshments) > MAX_WORD_LIMITS.refreshments) {
        Alert.alert(
          "Error",
          `Refreshments exceed word limit of ${MAX_WORD_LIMITS.refreshments} words`
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const fieldsToCheck = [
        { name: "title", value: title },
        { name: "location", value: location },
        { name: "description", value: description },
        {
          name: "volunteerDescription",
          value: volunteerDescription,
          check: needsVolunteers,
        },
        { name: "rewards", value: rewards, check: needsVolunteers },
        { name: "refreshments", value: refreshments, check: needsVolunteers },
      ];

      let hasAnyProfanity = false;
      for (const field of fieldsToCheck) {
        if (field.check === false || !field.value) continue;
        const hasProfanity = await ProfanityFilterService.hasProfanity(
          field.value
        );
        if (hasProfanity) {
          Alert.alert(
            "Inappropriate Content Detected",
            `Your input for "${field.name}" contains inappropriate language. Please revise it.`
          );
          setIsSubmitting(false);
          return;
        }
      }

      const eventData = {
        title: title,
        date,
        startTime: formatTime(startTime),
        endTime: formatTime(endTime),
        location: location,
        description: description,
        needsVolunteers,
        approvalStatus: "pending", // Require admin approval
      };

      console.log(
        "[EventsFormScreen] About to call addEvent with data:",
        eventData
      );
      let eventId: string | null = null;
      try {
        eventId = await firebaseEventService.addEvent(eventData);
        console.log("[EventsFormScreen] addEvent returned eventId:", eventId);
      } catch (eventError) {
        console.error("[EventsFormScreen] Error in addEvent call:", eventError);
        throw eventError;
      }

      console.log(
        "[EventsFormScreen] Checking if needsVolunteers and eventId:",
        needsVolunteers,
        eventId
      );
      if (needsVolunteers && eventId) {
        console.log("[EventsFormScreen] Creating volunteer opportunity...");
        const opportunityId = doc(collection(db, "opportunities")).id;
        const opportunityData = {
          opportunityId,
          eventId,
          title: title,
          noVolunteersNeeded: volunteersNeeded,
          description: volunteerDescription.trim(),
          timings: timings.trim(),
          location: location,
          rewards: rewards.trim() || null,
          refreshments: refreshments.trim() || null,
          approvalStatus: "pending", // Require admin approval
        };
        console.log(
          "[EventsFormScreen] Creating opportunity with:",
          opportunityData
        );
        try {
          await firebaseOpportunityService.createOpportunity(opportunityData);
          console.log("[EventsFormScreen] Opportunity created successfully");
        } catch (err) {
          console.log("[EventsFormScreen] Error creating opportunity:", err);
          throw err;
        }
      } else {
        console.log(
          "[EventsFormScreen] Skipping opportunity creation - needsVolunteers:",
          needsVolunteers,
          "eventId:",
          eventId
        );
      }

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
      <HeroBox title="Create Event" showBackButton={true} />
      <KeyboardAwareWrapper>
        <ScrollView
          style={styles.formContainer}
          keyboardShouldPersistTaps="handled"
        >
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
          <Text style={styles.wordCount}>
            {countWords(title)} / {MAX_WORD_LIMITS.title} words
          </Text>

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
            Events can only be scheduled for today or a future date
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
          <Text style={styles.wordCount}>
            {countWords(location)} / {MAX_WORD_LIMITS.location} words
          </Text>

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
          <Text style={styles.wordCount}>
            {countWords(description)} / {MAX_WORD_LIMITS.description} words
          </Text>

          <Text style={[styles.label, { marginTop: 25 }]}>
            Volunteers Needed
          </Text>
          <View style={styles.checkboxContainer}>
            <Switch
              value={needsVolunteers}
              onValueChange={setNeedsVolunteers}
              thumbColor={needsVolunteers ? "#F4A941" : "#f4f3f4"}
              trackColor={{ false: "#767577", true: "#F4A941" }}
            />
            <Text style={styles.checkboxLabel}>
              This event needs volunteers
            </Text>
          </View>

          {needsVolunteers && (
            <>
              <Text style={styles.helperText}>
                Specify the number of volunteers and their tasks.
              </Text>
              <Slider
                style={{ width: "100%", height: 40 }}
                minimumValue={1}
                maximumValue={50}
                step={1}
                value={volunteersNeeded}
                onValueChange={setVolunteersNeeded}
                minimumTrackTintColor="#F4A941"
                maximumTrackTintColor="#d3d3d3"
                thumbTintColor="#F4A941"
              />
              <Text style={styles.sliderValueText}>
                {volunteersNeeded} volunteer{volunteersNeeded === 1 ? "" : "s"}
              </Text>
              <Text style={styles.label}>Volunteer Task Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={volunteerDescription}
                onChangeText={setVolunteerDescription}
                placeholder="Enter description of tasks volunteers will perform"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
              <Text style={styles.wordCount}>
                {countWords(volunteerDescription)} / {MAX_WORD_LIMITS.volunteerDescription} words
              </Text>
              <Text style={styles.label}>Volunteer Timings</Text>
              <TextInput
                style={styles.input}
                value={timings}
                onChangeText={setTimings}
                placeholder="Enter volunteer schedule (e.g., 9 AM - 12 PM)"
                placeholderTextColor="#999"
              />
              <Text style={styles.wordCount}>
                {countWords(timings)} / {MAX_WORD_LIMITS.timings} words
              </Text>
              <Text style={styles.label}>Rewards (Optional)</Text>
              <TextInput
                style={styles.input}
                value={rewards}
                onChangeText={setRewards}
                placeholder="Enter rewards offered (e.g., certificates, t-shirts)"
                placeholderTextColor="#999"
              />
              <Text style={styles.wordCount}>
                {countWords(rewards)} / {MAX_WORD_LIMITS.rewards} words
              </Text>
              <Text style={styles.label}>Refreshments (Optional)</Text>
              <TextInput
                style={styles.input}
                value={refreshments}
                onChangeText={setRefreshments}
                placeholder="Enter refreshments provided (e.g., snacks, water)"
                placeholderTextColor="#999"
              />
              <Text style={styles.wordCount}>
                {countWords(refreshments)} / {MAX_WORD_LIMITS.refreshments} words
              </Text>
            </>
          )}

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
      </KeyboardAwareWrapper>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF6EC",
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
    padding: 20,
    paddingBottom: 100,
  },
  label: {
    marginTop: 16,
    marginBottom: 6,
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 12,
    fontSize: 16,
    color: "#2E2E2E",
  },
  wordCount: {
    alignSelf: "flex-end",
    fontSize: 12,
    color: "#1B6B63",
    marginBottom: 10,
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
    marginLeft: 2,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  dateSelector: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD",
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 12,
  },
  timeText: {
    fontSize: 16,
    color: "#2E2E2E",
  },
  sliderValueText: {
    fontSize: 16,
    color: "#2E2E2E",
    textAlign: "center",
    marginTop: 4,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: "#2E2E2E",
  },
  submitButton: {
    backgroundColor: "#1B6B63",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 30,
  },
  disabledButton: {
    backgroundColor: "#1B6B63",
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EventsFormScreen;