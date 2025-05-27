import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../navigation/AppNavigator";
import CalendarService, { CalendarEvent } from "../services/calendarService";
import firebaseEventService from "../services/firebaseEventService";
import Calendar from "../components/Calendar";
import EventCard from "../components/EventCard";
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from "../context/AuthContext";
import { isDateValidForEvent } from "../utils/dateUtils";

const USE_FIREBASE_SERVICE = true;

type Props = NativeStackScreenProps<HomeStackParamList, "Events">;

const EventsScreen: React.FC<Props> = ({ navigation }) => {
  // Set to current date instead of hardcoded value
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const service = USE_FIREBASE_SERVICE ? firebaseEventService : CalendarService;

  useFocusEffect(
    useCallback(() => {
      const fetchEventsForMonth = async () => {
        setLoading(true);
        try {
          const firstDay = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            1
          );
          const lastDay = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() + 1,
            0
          );
          const fetchedEvents = await service.fetchEvents(firstDay, lastDay);
          
          // Filter out past events
          const validEvents = fetchedEvents.filter(event => isDateValidForEvent(event.date));
          setEvents(validEvents);
        } catch (error) {
          console.error("Error fetching events:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchEventsForMonth();
    }, [currentMonth])
  );

  const goToPreviousMonth = () => {
    // Don't allow navigating to past months
    const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    if (previousMonth.getMonth() < today.getMonth() && previousMonth.getFullYear() <= today.getFullYear()) {
      Alert.alert("Cannot view past months", "Only current and future months are available");
      return;
    }
    setCurrentMonth(previousMonth);
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleDateSelect = (date: Date) => {
    // Prevent selecting dates in the past
    if (isDateValidForEvent(date)) {
      setSelectedDate(date);
    } else {
      Alert.alert("Invalid Date", "You can only view events for today and future dates");
    }
  };

  const handleRegister = async (eventId: string) => {
    try {
      const event = events.find((e) => e.id === eventId);
      if (event) {
        let success;
        if (event.registered) {
          success = await service.cancelRegistration(eventId);
        } else {
          success = await service.registerForEvent(eventId);
        }

        if (success) {
          setEvents(
            events.map((event) =>
              event.id === eventId
                ? { ...event, registered: !event.registered }
                : event
            )
          );
        }
      }
    } catch (error) {
      console.error("Error updating registration:", error);
    }
  };

  const handleEventClick = (eventId: string) => {
    navigation.navigate("RegisterEvent", { eventId });
  };

  const handleAddEvent = () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to create events");
      navigation.navigate("Login");
      return;
    }
    navigation.navigate("EventsForm");
  };

  const filteredEvents = events.filter(
    (event) =>
      event.date.getDate() === selectedDate?.getDate() &&
      event.date.getMonth() === selectedDate?.getMonth() &&
      event.date.getFullYear() === selectedDate?.getFullYear()
  );

  // Adjust currentMonth if it's in the past
  useEffect(() => {
    const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    if (currentMonth < todayMonth) {
      setCurrentMonth(todayMonth);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButtonContainer}
        >
          <Text style={styles.backButton}>←</Text>
          <Text style={styles.headerTitle}>Events</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleAddEvent}
          style={styles.addEventButton}
        >
          <Text style={styles.addEventButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dateSelectionContainer}>
        <View style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateText}>
            {selectedDate
              ? `${selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}`
              : "Select date"}
          </Text>
        </View>

        <Calendar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          events={events}
          currentMonth={currentMonth}
          onNextMonth={goToNextMonth}
          onPrevMonth={goToPreviousMonth}
        />
      </View>

      <ScrollView style={styles.eventsListContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3A7D44" />
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <EventCard
              key={`${event.source}-${event.id}`}
              event={event}
              onRegister={handleRegister}
              onPress={() => handleEventClick(event.id)}
              style={event.source === 'local' ? styles.localEvent : styles.firebaseEvent}
            />
          ))
        ) : (
          <View style={styles.noEventsContainer}>
            <Text style={styles.noEventsText}>No events for this date</Text>
            <TouchableOpacity
              style={styles.addEventSmallButton}
              onPress={handleAddEvent}
            >
              <Text style={styles.addEventSmallButtonText}>Add Event</Text>
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
    justifyContent: "space-between",
    alignItems: "flex-end",
    flexDirection: "row",
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
  addEventButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3A7D44",
    justifyContent: "center",
    alignItems: "center",
  },
  addEventButtonText: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  dateSelectionContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  selectedDateContainer: {
    marginBottom: 15,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3A7D44",
  },
  eventsListContainer: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#3A7D44",
    fontSize: 16,
  },
  noEventsContainer: {
    padding: 20,
    alignItems: "center",
  },
  noEventsText: {
    color: "#666",
    fontSize: 16,
    marginBottom: 15,
  },
  addEventSmallButton: {
    backgroundColor: "#3A7D44",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  addEventSmallButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  localEvent: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  firebaseEvent: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
});

export default EventsScreen;