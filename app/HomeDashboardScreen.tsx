import React, { useState, useEffect } from "react";
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
import { useNavigation } from "@react-navigation/native";
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
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";

interface EventData {
  id: string;
  title: string;
  description?: string;
  date: any; // Firebase Timestamp
  startTime: string;
}

const HomeDashboardScreen = () => {
  const navigation: any = useNavigation();
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      if (user) {
        try {
          setLoading(true);
          // Get user registrations first
          const registrations =
            await firebaseEventService.getUserRegistrations();
          const eventIds = registrations.map((reg) => reg.eventId);

          if (eventIds.length === 0) {
            setEvents([]);
            setLoading(false);
            return;
          }

          // Split eventIds into chunks of 10 (Firebase's limit for 'in' queries)
          const chunks = [];
          for (let i = 0; i < eventIds.length; i += 10) {
            chunks.push(eventIds.slice(i, i + 10));
          }

          // Fetch events for each chunk
          const allEvents = [];
          for (const chunk of chunks) {
            const eventsQuery = query(
              collection(db, "events"),
              where("__name__", "in", chunk)
            );
            const querySnapshot = await getDocs(eventsQuery);
            allEvents.push(...querySnapshot.docs);
          }

          const now = new Date();
          const fetchedEvents = allEvents
            .map(
              (doc) =>
                ({
                  id: doc.id,
                  ...doc.data(),
                } as EventData)
            )
            .map((event) => ({
              ...event,
              date: event.date.toDate(),
            }))
            .filter((event) => event.date >= now) // Filter future events
            .sort((a, b) => a.date - b.date) // Sort by date ascending
            .slice(0, 3); // Take only the 3 closest events

          setEvents(
            fetchedEvents.map((event) => ({
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
            }))
          );
        } catch (error) {
          console.error("Error:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchRegisteredEvents();

    // Set up a refresh interval
    const refreshInterval = setInterval(fetchRegisteredEvents, 30000); // Refresh every 30 seconds

    return () => {
      clearInterval(refreshInterval);
    };
  }, [user]);

  const dashboardButtons = [
    {
      label: "Manage Volunteering",
      color: "#9DC08B",
      route: "VolunteerScreen",
    },
    { label: "Journal", color: "#527754", route: "JournalScreen" },
    { label: "SOS Dial", color: "#527754", route: "SOSScreen" },
    { label: "Manage Events", color: "#9DC08B", route: "Events" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroBox}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Home Dashboard</Text>
            <View style={styles.headerIcons}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#C44536"
              />
              <TouchableOpacity style={styles.sosWrapper}>
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
            Need help? Dial 911 for immediate mental health assistance or browse
            our Resource Library for self-help guides and professional contacts.
            You are not alone 💙
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
    backgroundColor: "#F8F5E9",
  },
  container: {
    paddingBottom: 120,
  },
  heroBox: {
    backgroundColor: "#F8F5E9",
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
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
    color: "#3A7D44",
    marginLeft: 10,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  sosWrapper: {
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "#C44536",
    borderRadius: 50,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sosText: {
    color: "#C44536",
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
    color: "#3A7D44",
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
    backgroundColor: "#3A7D44",
  },
  lineFixed: {
    flex: 1,
    height: 2,
    backgroundColor: "#3A7D44",
    marginHorizontal: 8,
  },
  descriptionSection: {
    padding: 20,
    paddingTop: 10,
  },
  descriptionText: {
    color: "#2B5A32",
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
    color: "black",
  },
  eventCard: {
    flexDirection: "row",
    backgroundColor: "#E7F1E6",
    borderRadius: 10,
    marginBottom: 12,
    marginHorizontal: 20,
    overflow: "hidden",
  },
  eventStripe: {
    width: 6,
    backgroundColor: "#C44536",
  },
  eventText: {
    padding: 10,
    flex: 1,
  },
  eventTitle: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#3A7D44",
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
    color: "#B00020",
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
    backgroundColor: "#D6EFC7",
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
