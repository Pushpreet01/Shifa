import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../navigation/AppNavigator";
import FirebaseEventService from "../services/firebaseEventService";
import { format } from "date-fns";

interface Event {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  createdBy: string;
}

const VolunteerScreen: React.FC<
  NativeStackScreenProps<HomeStackParamList, any>
> = ({ navigation }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Fetch events for the next 6 months
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 6);

        const fetchedEvents = await FirebaseEventService.fetchEvents(
          startDate,
          endDate
        );
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
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
          <Text style={styles.headerTitle}>Volunteer</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Announcements")}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#C44536"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sosWrapper}
              onPress={() => navigation.navigate("Emergency")}
            >
              <Text style={styles.sosText}>SOS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => navigation.navigate("Opportunities")}
        >
          <Text style={styles.mainButtonText}>
            Browse Upcoming Opportunities
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => navigation.navigate("VolunteerLearnings")}
        >
          <Text style={styles.mainButtonText}>My Learnings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => navigation.navigate("VolunteerRewards")}
        >
          <Text style={styles.mainButtonText}>Volunteer Rewards</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Available Events</Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#1B6B63"
            style={styles.loader}
          />
        ) : events.length === 0 ? (
          <Text style={styles.noEventsText}>
            No events available at the moment
          </Text>
        ) : (
          events.map((event) => (
            <View key={event.id} style={styles.card}>
              <Text style={styles.cardTitle}>{event.title}</Text>
              <Text style={styles.cardSubtitle}>
                {format(event.date, "MMM d, yyyy")} • {event.startTime} -{" "}
                {event.endTime}
              </Text>
              <Text style={styles.cardDetails}>{event.location}</Text>
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() =>
                  navigation.navigate("OpportunityDetails", {
                    title: event.title,
                    date: format(event.date, "MMM d, yyyy"),
                    timing: `${event.startTime} - ${event.endTime}`,
                    location: event.location,
                    description: event.description,
                    eventId: event.id,
                  })
                }
              >
                <Text style={styles.detailsButtonText}>Details</Text>
              </TouchableOpacity>
            </View>
          ))
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  mainButton: {
    backgroundColor: "#1B6B63",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  mainButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 17,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E2E2E",
    marginTop: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: "#F4A941",
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 17,
    color: "#2E2E2E",
    marginBottom: 2,
  },
  cardSubtitle: {
    color: "#2E2E2E",
    fontSize: 15,
    marginBottom: 2,
  },
  cardDetails: {
    color: "#2E2E2E",
    fontSize: 14,
    marginBottom: 10,
  },
  detailsButton: {
    alignSelf: "flex-end",
    backgroundColor: "#1B6B63",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 18,
  },
  detailsButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
  loader: {
    marginTop: 20,
  },
  noEventsText: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
    fontSize: 16,
  },
});

export default VolunteerScreen;
