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
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { isDateValidForEvent } from "../utils/dateUtils";
import { Ionicons } from "@expo/vector-icons";

const USE_FIREBASE_SERVICE = true;

type Props = NativeStackScreenProps<HomeStackParamList, "Events">;

const EventsScreen: React.FC<Props> = ({ navigation, route }) => {
  // Set to current date instead of hardcoded value
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const service = USE_FIREBASE_SERVICE ? firebaseEventService : CalendarService;

  // Handle refresh from route params
  useEffect(() => {
    if (route.params?.refresh) {
      setRefreshKey((prev) => prev + 1);
    }
  }, [route.params?.refresh]);

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

          // Get user registrations to mark registered events
          const registrations = await service.getUserRegistrations();
          const registeredEventIds = registrations.map(
            (reg: { eventId: string }) => reg.eventId
          );

          // Filter out past events and mark registered ones
          const validEvents = fetchedEvents
            .filter((event) => isDateValidForEvent(event.date))
            .map((event) => ({
              ...event,
              registered: registeredEventIds.includes(event.id),
            }));

          setEvents(validEvents);
        } catch (error) {
          console.error("Error fetching events:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchEventsForMonth();
    }, [currentMonth, refreshKey]) // Add refreshKey to dependencies
  );

  const goToPreviousMonth = () => {
    // Don't allow navigating to past months
    const previousMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1
    );
    if (
      previousMonth.getMonth() < today.getMonth() &&
      previousMonth.getFullYear() <= today.getFullYear()
    ) {
      Alert.alert(
        "Cannot view past months",
        "Only current and future months are available"
      );
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
      Alert.alert(
        "Invalid Date",
        "You can only view events for today and future dates"
      );
    }
  };

  const handleRegister = async (eventId: string) => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to register for events.");
      return;
    }

    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    navigation.navigate("RegisterEvent", { eventId });
  };

  const handleEventClick = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    if (!user) {
      Alert.alert("Error", "You must be logged in to view event details.");
      return;
    }

    navigation.navigate("RegisterEvent", { eventId });
  };

  const handleAddEvent = () => {
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
      <View style={styles.heroBox}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButtonContainer}
          >
            <Ionicons name="chevron-back-outline" size={24} color="#1B6B63" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Events</Text>
        </View>
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
            <ActivityIndicator size="large" color="#F4A941" />
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <EventCard
              key={`${event.source}-${event.id}`}
              event={event}
              onRegister={handleRegister}
              onPress={() => handleEventClick(event.id)}
              style={
                event.source === "local"
                  ? styles.localEvent
                  : styles.firebaseEvent
              }
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
  addEventButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F4A941",
    justifyContent: "center",
    alignItems: "center",
  },
  addEventButtonText: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  dateSelectionContainer: {
    // backgroundColor: "#FFFFFF",
    padding: 20,
  },
  selectedDateContainer: {
    marginBottom: 15,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E2E2E",
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
    color: "#2E2E2E",
    fontSize: 16,
  },
  noEventsContainer: {
    padding: 20,
    alignItems: "center",
  },
  noEventsText: {
    color: "#2E2E2E",
    fontSize: 16,
    marginBottom: 15,
  },
  addEventSmallButton: {
    backgroundColor: "#F4A941",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  addEventSmallButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  localEvent: {
    // backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    borderLeftColor: '#F4A941',
  },
  firebaseEvent: {
    // backgroundColor: '#FDF6EC',
    borderLeftWidth: 4,
    borderLeftColor: '#F4A941',
  },
});

export default EventsScreen;
