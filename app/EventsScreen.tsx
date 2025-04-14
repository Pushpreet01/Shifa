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

const USE_JSON_SERVICE = true;

type Props = NativeStackScreenProps<RootStackParamList, "Events">;

const EventsScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 7, 17));
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 7, 1));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const service = USE_JSON_SERVICE ? JsonCalendarService : CalendarService;

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
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
    navigation.navigate('RegisterEvent', { eventId });
  };

  useEffect(() => {
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
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventsForMonth();
  }, [currentMonth]);

  const filteredEvents = events.filter(
    (event) =>
      event.date.getDate() === selectedDate?.getDate() &&
      event.date.getMonth() === selectedDate?.getMonth() &&
      event.date.getFullYear() === selectedDate?.getFullYear()
  );

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
      </View>

      <View style={styles.dateSelectionContainer}>
        <View style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateText}>
            {selectedDate
              ? `${selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric"
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
              key={event.id}
              event={event}
              onRegister={handleRegister}
              onPress={() => handleEventClick(event.id)} // 👈 pass eventId
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
  // (unchanged styles from before)
});

export default EventsScreen;
