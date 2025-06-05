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
<<<<<<< Updated upstream
    {
      label: "Manage Volunteering",
      color: "#9DC08B",
      route: "VolunteerScreen",
    },
    { label: "Journal", color: "#527754", route: "JournalScreen" },
    { label: "SOS Dial", color: "#527754", route: "SOSScreen" },
    { label: "Manage Events", color: "#9DC08B", route: "Events" },
=======
    { label: "Manage Volunteering" },
    { label: "Journal" },
    { label: "SOS Dial" },
    { label: "Manage Events" },
>>>>>>> Stashed changes
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroBox}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Home Dashboard</Text>
            <View style={styles.headerIcons}>
<<<<<<< Updated upstream
              <TouchableOpacity onPress={() => navigation.navigate('Announcements')}>
                <Ionicons name="notifications-outline" size={24} color="#C44536" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.sosWrapper}>
=======
              <Ionicons name="notifications-outline" size={24} color="#e5a54e" />
              <View style={styles.sosWrapper}>
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
            We're here to help you connect with events, resources, and
            volunteers dedicated to mental health and addiction recovery.
=======
            Connect with events, resources, and volunteers dedicated to mental health and addiction recovery.
>>>>>>> Stashed changes
          </Text>
        </View>

        <View style={styles.buttonGrid}>
          {dashboardButtons.map((item, i) => (
<<<<<<< Updated upstream
            <TouchableOpacity
              key={i}
              style={[styles.gridButton, { backgroundColor: item.color }]}
              onPress={() => navigation.navigate(item.route)}
            >
=======
            <TouchableOpacity key={i} style={styles.gridButton}>
>>>>>>> Stashed changes
              <Text style={styles.gridButtonText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

<<<<<<< Updated upstream
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => navigation.navigate("Events")}
        >
          <Ionicons name="calendar-outline" size={20} color="black" />
=======
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar-outline" size={20} color="#3f8390" />
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
            Need help? Dial 911 for immediate mental health assistance or browse our Resource
            Library for self-help guides and professional contacts. You are not alone 💚
=======
            Dial 911 for immediate help or explore the Resource Library for support options. You're not alone 💙
>>>>>>> Stashed changes
          </Text>
        </View>
      </ScrollView>

<<<<<<< Updated upstream
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
=======
      
>>>>>>> Stashed changes
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FDF6EC",
  },
  container: {
    paddingBottom: 120,
  },
  heroBox: {
    backgroundColor: "#FDF6EC",
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 6,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1B6B63",
    marginLeft: 10,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  sosWrapper: {
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "#F4A941",
    borderRadius: 50,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sosText: {
    color: "#F4A941",
    fontWeight: "bold",
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
    color: "#008080",
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
    backgroundColor: "#F4A941",
  },
  lineFixed: {
    flex: 1,
    height: 2,
    backgroundColor: "#F4A941",
    marginHorizontal: 8,
  },
  descriptionSection: {
    padding: 20,
    paddingTop: 10,
  },
  descriptionText: {
    color: "#2E2E2E",
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
    borderRadius: 10,
    backgroundColor: "#008080",
    marginBottom: 12,
    alignItems: "center",
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
    color: "#2E2E2E",
  },
  eventCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginBottom: 12,
    marginHorizontal: 20,
    overflow: "hidden",
  },
  eventStripe: {
    width: 6,
    backgroundColor: "#F4A941",
  },
  eventText: {
    padding: 10,
    flex: 1,
  },
  eventTitle: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#2E2E2E",
  },
  eventSubtitle: {
    fontSize: 13,
    color: "#555",
  },
  eventTime: {
    fontSize: 13,
    color: "#2E2E2E",
    marginTop: 4,
  },
  eventDate: {
    fontSize: 13,
    color: "#999",
  },
  supportBox: {
    marginTop: 10,
    marginHorizontal: 20,
    backgroundColor: "#FDF6EC",
    padding: 15,
    borderRadius: 10,
  },
  supportTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#E38933",
    marginBottom: 5,
  },
  supportText: {
    fontSize: 13,
    color: "#2E2E2E",
  },
  curvedNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
<<<<<<< Updated upstream
    height: 80,
    backgroundColor: "#D6EFC7",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
=======
    height: 100,
    backgroundColor: "#F4A941",
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
>>>>>>> Stashed changes
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