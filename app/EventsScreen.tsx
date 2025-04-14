// app/EventsScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import CalendarService, { CalendarEvent } from "../services/calendarService";
import JsonCalendarService from "../services/jsonCalendarService";
import Calendar from "../components/Calendar";
import EventCard from "../components/EventCard";

// Change this to true to use JSON data instead of mock data
const USE_JSON_SERVICE = true;

type Props = NativeStackScreenProps<RootStackParamList, "Events">;

const EventsScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 7, 17)); // August 17, 2025
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 7, 1)); // August 2025
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Choose which service to use
  const service = USE_JSON_SERVICE ? JsonCalendarService : CalendarService;

  // Function to navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  // Function to navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  // Function to handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  // Function to handle event registration
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

  // Fetch events for the current month
  useEffect(() => {
    const fetchEventsForMonth = async () => {
      setLoading(true);
      try {
        // Calculate first and last day of the month
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

        // Fetch events
        const fetchedEvents = await service.fetchEvents(firstDay, lastDay);
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventsForMonth();
  }, [currentMonth]);

  // Filter events for selected date
  const filteredEvents = events.filter(
    (event) =>
      event.date.getDate() === selectedDate?.getDate() &&
      event.date.getMonth() === selectedDate?.getMonth() &&
      event.date.getFullYear() === selectedDate?.getFullYear()
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button and Logo */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Events</Text>
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          {/* Replace with your actual logo */}
          <Text style={styles.logoPlaceholder}>NCM 🍎</Text>
        </View>
      </View>

      {/* Date Selection */}
      <View style={styles.dateSelectionContainer}>
        <View style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateText}>
            {selectedDate
              ? `${selectedDate.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}`
              : "Select date"}
          </Text>
          <TouchableOpacity style={styles.editIcon}>
            <Text>✏️</Text>
          </TouchableOpacity>
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
      </View>

      {/* Events List */}
      <ScrollView style={styles.eventsListContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9DC08B" />
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onRegister={handleRegister}
            />
          ))
        ) : (
          <View style={styles.noEventsContainer}>
            <Text style={styles.noEventsText}>No events for this date</Text>
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    fontSize: 16,
    color: "#3E7E45",
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
  },
  logoPlaceholder: {
    color: "#E34935",
  },
  dateSelectionContainer: {
    backgroundColor: "#E8F0E5",
    padding: 15,
  },
  selectedDateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3E7E45",
  },
  editIcon: {
    padding: 5,
  },
  eventsListContainer: {
    flex: 1,
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#3E7E45",
  },
  noEventsContainer: {
    padding: 20,
    alignItems: "center",
  },
  noEventsText: {
    color: "#666",
    fontSize: 16,
  }
});

export default EventsScreen;