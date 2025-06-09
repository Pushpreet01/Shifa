import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import firebaseEventService from "../services/firebaseEventService";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";

interface EventData {
  id: string;
  title: string;
  description?: string;
  date: any; // Firebase Timestamp
  startTime: string;
}

interface ProcessedEventData {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  date: string;
}

const HomeDashboardScreen = () => {
  const navigation: any = useNavigation();
  const { user } = useAuth();
  const [events, setEvents] = useState<ProcessedEventData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRegisteredEvents = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Get user registrations first
      const registrations = await firebaseEventService.getUserRegistrations();
      const eventIds = registrations.map((reg) => reg.eventId);

      if (eventIds.length === 0) {
        setEvents([]);
        return;
      }

      // Get current date at midnight for more efficient querying
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      // Fetch events in chunks, but only filter by document ID
      const allEvents = [];
      for (const chunk of chunkArray(eventIds, 10)) {
        const eventsQuery = query(
          collection(db, "events"),
          where("__name__", "in", chunk)
        );
        const querySnapshot = await getDocs(eventsQuery);
        allEvents.push(...querySnapshot.docs);
      }

      // Process all events first
      const processedEvents = allEvents.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
      })) as EventData[];

      // Filter and sort the events
      const fetchedEvents = processedEvents
        .filter((event) => event.date >= now)
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, 3);

      // Format events for display
      const formattedEvents = fetchedEvents.map((event) => ({
        id: event.id,
        title: event.title,
        subtitle: event.description || "Event details",
        time: event.startTime,
        date: event.date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Helper function to chunk array
  const chunkArray = (array: any[], size: number) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  // Refresh events when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchRegisteredEvents();
    }, [fetchRegisteredEvents])
  );

  // Initial load and periodic refresh
  useEffect(() => {
    fetchRegisteredEvents();

    // Set up a refresh interval (optional, can be removed if not needed)
    const refreshInterval = setInterval(fetchRegisteredEvents, 60000); // Refresh every minute

    return () => {
      clearInterval(refreshInterval);
    };
  }, [fetchRegisteredEvents]);

  const dashboardButtons = [
    {
      label: "Manage Volunteering",
      color: "#008080",
      route: "VolunteerScreen",
    },
    { label: "Journal", color: "#008080", route: "JournalScreen" },
    { label: "SOS Dial", color: "#008080", route: "SOSScreen" },
    { label: "Manage Events", color: "#008080", route: "Events" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroBox}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Home Dashboard</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity onPress={() => navigation.navigate('Announcements')}>
                <Ionicons name="notifications-outline" size={24} color="#C44536" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.sosWrapper} onPress={() => navigation.navigate('Emergency')}>
                <Text style={styles.sosText}>SOS</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.avatarContainer}>
            <Image
              source={require("../assets/image.png")}
              style={styles.avatarImage}
            />
            <Text style={styles.avatarLabel}>User</Text>
          </View>
        </View>

        <View style={styles.separatorWrapper}>
          <View style={styles.circle} />
          <View style={styles.lineFixed} />
          <View style={styles.circle} />
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionText}>
            We're here to help you connect with events, resources, and
            volunteers dedicated to mental health and addiction recovery.
          </Text>
        </View>

        <View style={styles.buttonGrid}>
          {dashboardButtons.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.gridButton, { backgroundColor: item.color }]}
              onPress={() => navigation.navigate(item.route)}
            >
              <Text style={styles.gridButtonText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => navigation.navigate("Events")}
        >
          <Ionicons name="calendar-outline" size={20} color="black" />
          <Text style={styles.sectionTitle}> Upcoming Events</Text>
        </TouchableOpacity>

        {events.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={styles.eventCard}
            onPress={() => navigation.navigate("Events")}
          >
            <View style={styles.eventStripe} />
            <View style={styles.eventText}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventSubtitle}>{event.subtitle}</Text>
              <Text style={styles.eventTime}>{event.time}</Text>
              <Text style={styles.eventDate}>{event.date}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.supportBox}>
          <Text style={styles.supportTitle}>🔴 Emergency Support Reminder</Text>
          <Text style={styles.supportText}>
            Need help? Dial 911 for immediate mental health assistance or browse our Resource
            Library for self-help guides and professional contacts. You are not alone 💚
          </Text>
        </View>
      </ScrollView>

      <View style={styles.curvedNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#3A7D44" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Events")}
        >
          <Ionicons name="calendar-outline" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="settings-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF", 
  },
  container: {
    paddingBottom: 120,
  },
  heroBox: {
    backgroundColor: "#FDF6EC",
    paddingTop: 40,
    paddingBottom: 18,
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
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1B6B63",
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
  avatarContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  avatarImage: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  avatarLabel: {
    marginTop: 6,
    fontWeight: "600",
    color: "#007872", // teal text
  },
  separatorWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  circle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F6A800", // amber
  },
  lineFixed: {
    flex: 1,
    height: 2,
    backgroundColor: "#F6A800",
    marginHorizontal: 8,
  },
  descriptionSection: {
    padding: 20,
    paddingTop: 10,
  },
  descriptionText: {
    color: "#333",
    fontSize: 14,
    textAlign: "center",
  },
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  gridButton: {
    width: "48%",
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    backgroundColor: "#007872", // teal buttons
  },
  gridButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  eventCard: {
    flexDirection: "row",
    backgroundColor: "#FDF6EC",
    borderRadius: 10,
    marginBottom: 12,
    marginHorizontal: 20,
    overflow: "hidden",
    borderLeftWidth: 6,
    borderLeftColor: "#F6A800", // amber stripe
    padding: 10,
  },
  eventStripe: {
    width: 0, // hidden
  },
  eventText: {
    flex: 1,
  },
  eventTitle: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#1F6F55", // dark green
  },
  eventSubtitle: {
    fontSize: 13,
    color: "#555",
  },
  eventTime: {
    fontSize: 13,
    color: "#333",
    marginTop: 4,
  },
  eventDate: {
    fontSize: 13,
    color: "#999",
  },
  supportBox: {
    marginTop: 10,
    marginHorizontal: 20,
    backgroundColor: "#FFF0F0",
    padding: 15,
    borderRadius: 10,
  },
  supportTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#EA4335", // red
    marginBottom: 5,
  },
  supportText: {
    fontSize: 13,
    color: "#333",
  },
  curvedNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "#FDEBD0",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
    paddingBottom: 20,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },
});


export default HomeDashboardScreen;
