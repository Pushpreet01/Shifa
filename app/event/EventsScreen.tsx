/**
 * EventsScreen.tsx
 * Main events management screen that displays a calendar view of events and allows users
 * to view, register for, and (for event organizers) create new events.
 * Supports filtering by date and handles both local and Firebase events.
 */

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
import { HomeStackParamList } from "../../navigation/AppNavigator";
import CalendarService, { CalendarEvent } from "../../services/calendarService";
import firebaseEventService from "../../services/firebaseEventService";
import Calendar from "../../components/Calendar";
import EventCard from "../../components/EventCard";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { isDateValidForEvent } from "../../utils/dateUtils";
import { Ionicons } from "@expo/vector-icons";
import HeroBox from "../../components/HeroBox";

// Flag to toggle between Firebase and local calendar service
const USE_FIREBASE_SERVICE = true;

type Props = NativeStackScreenProps<HomeStackParamList, "Events">;

interface ApprovalStatusObject {
  status: string;
}

/**
 * EventsScreen Component
 * Provides calendar-based event management with date selection,
 * event registration, and event creation capabilities
 */
const EventsScreen: React.FC<Props> = ({ navigation, route }) => {
  // State Management
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today); // Currently selected date in calendar
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  ); // Current month being viewed
  const [events, setEvents] = useState<CalendarEvent[]>([]); // All events for the current month
  const [loading, setLoading] = useState(true); // Loading state for data fetching
  const { user } = useAuth(); // Current authenticated user
  const [refreshKey, setRefreshKey] = useState(0); // Key to force refresh of events

  // Service selection based on configuration
  const service = USE_FIREBASE_SERVICE ? firebaseEventService : CalendarService;

  /**
   * Effect hook to handle refresh requests from navigation params
   */
  useEffect(() => {
    if (route.params && "refresh" in route.params && route.params.refresh) {
      setRefreshKey((prev) => prev + 1);
    }
  }, [route.params]);

  /**
   * Effect hook to fetch events when screen is focused or month changes
   * - Fetches events for the entire month
   * - Filters out past and unapproved events
   * - Marks events user has registered for
   */
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

          console.log(
            `[EventsScreen] Fetched ${fetchedEvents.length} total events`
          );
          console.log(
            `[EventsScreen] Events with approval status:`,
            fetchedEvents.map((e) => ({
              id: e.id,
              title: e.title,
              approvalStatus: e.approvalStatus,
            }))
          );

          // Filter out past events, only show approved, and mark registered ones
          const validEvents = fetchedEvents
            .filter((event) => {
              if (!isDateValidForEvent(event.date)) return false;
              if (!event.approvalStatus) return false;
              
              const approvalStatus = event.approvalStatus as string | ApprovalStatusObject;
              const status = typeof approvalStatus === 'string'
                ? approvalStatus
                : approvalStatus.status;
                
              return status.toLowerCase() === 'approved';
            })
            .map((event) => ({
              ...event,
              registered: registeredEventIds.includes(event.id),
            }));

          console.log(
            `[EventsScreen] After filtering, ${validEvents.length} approved events remain`
          );
          setEvents(validEvents);
        } catch (error) {
          console.error("Error fetching events:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchEventsForMonth();
    }, [currentMonth, refreshKey])
  );

  /**
   * Handles navigation to previous month
   * Prevents viewing past months
   */
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

  /**
   * Handles navigation to next month
   */
  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  /**
   * Handles date selection in calendar
   * Prevents selecting past dates
   * @param date - The date selected by the user
   */
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

  /**
   * Handles event registration process
   * Validates user authentication and navigates to registration screen
   * @param eventId - ID of the event to register for
   */
  const handleRegister = async (eventId: string) => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to register for events.");
      return;
    }

    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    navigation.navigate("RegisterEvent", { eventId });
  };

  /**
   * Handles event click/selection
   * Validates user authentication and navigates to event details
   * @param eventId - ID of the event that was clicked
   */
  const handleEventClick = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    if (!user) {
      Alert.alert("Error", "You must be logged in to view event details.");
      return;
    }

    navigation.navigate("RegisterEvent", { eventId });
  };

  /**
   * Handles navigation to event creation form
   * Only available to event organizers
   */
  const handleAddEvent = () => {
    console.log(
      "[EventsScreen] Navigating to EventsForm with selectedDate:",
      selectedDate
    );
    navigation.navigate("EventsForm", { selectedDate });
  };

  /**
   * Filters events to show only those on the selected date
   */
  const filteredEvents = events.filter(
    (event) =>
      event.date.getDate() === selectedDate?.getDate() &&
      event.date.getMonth() === selectedDate?.getMonth() &&
      event.date.getFullYear() === selectedDate?.getFullYear()
  );

  /**
   * Effect hook to ensure current month is not in the past
   */
  useEffect(() => {
    const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    if (currentMonth < todayMonth) {
      setCurrentMonth(todayMonth);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with title and back button */}
      <HeroBox title="Events" showBackButton={true} />

      {/* Date Selection and Calendar Section */}
      <View style={styles.dateSelectionContainer}>
        {/* Selected Date Display */}
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          marginBottom: 15,
        }}>
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

        {/* Calendar Component */}
        <Calendar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          events={events}
          currentMonth={currentMonth}
          onNextMonth={goToNextMonth}
          onPrevMonth={goToPreviousMonth}
        />

        {/* My Events Button - Only visible to event organizers */}
        <View style={{ alignItems: "flex-end", marginTop: 10 }}>
          {user?.role === "Event Organizer" && (
            <TouchableOpacity
              style={styles.myEventsButton}
              onPress={() => navigation.navigate("MyEvents")}
            >
              <Text style={styles.myEventsButtonText}>My Events</Text>
              <Ionicons
                name="list-outline"
                size={20}
                color="#FFFFFF"
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Events List Section */}
      <ScrollView style={styles.eventsListContainer}>
        {loading ? (
          // Loading spinner
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F4A941" />
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        ) : filteredEvents.length > 0 ? (
          // Map and render event cards
          filteredEvents.map((event) => {
            console.log("[EventsScreen] Rendering event:", {
              id: event.id,
              title: event.title,
              startTime: event.startTime,
              endTime: event.endTime,
              startTimeType: typeof event.startTime,
              endTimeType: typeof event.endTime,
            });
            return (
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
            );
          })
        ) : (
          // Empty state with optional add event button
          <View style={styles.noEventsContainer}>
            <Text style={styles.noEventsText}>No events for this date</Text>
            {user?.role === "Event Organizer" && (
              <TouchableOpacity
                style={styles.addEventSmallButton}
                onPress={handleAddEvent}
              >
                <Text style={styles.addEventSmallButtonText}>Add Event</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

/**
 * Styles for the EventsScreen component
 * Organized by section for easier maintenance
 */
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
    borderLeftColor: "#F4A941",
  },
  firebaseEvent: {
    // backgroundColor: '#FDF6EC',
    borderLeftWidth: 4,
    borderLeftColor: "#F4A941",
  },
  myEventsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B6B63",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  myEventsButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
});

export default EventsScreen;