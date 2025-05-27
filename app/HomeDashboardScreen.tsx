import React from "react"; 
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

const HomeDashboardScreen = () => {
  const navigation: any = useNavigation();

  const events = [
    {
      id: "1",
      title: "Community Wellness Center",
      subtitle: "Mental Health & Addiction Workshop",
      time: "Today - 6:00 PM",
      date: "Monday, March 4",
    },
    {
      id: "2",
      title: "Shifa Community Hall",
      subtitle: "Volunteer Orientation Session",
      time: "In 2 Days - 5:30 PM",
      date: "Wednesday, March 6",
    },
  ];

  type DashboardButton = {
  label: string;
  color: string;
  route: string;
};

const dashboardButtons: DashboardButton[] = [
  { label: "Manage Volunteering", color: "#9DC08B", route: "VolunteerScreen" },
  { label: "Journal", color: "#527754", route: "JournalScreen" },
  { label: "SOS Dial", color: "#527754", route: "SOSScreen" },
  { label: "Manage Events", color: "#9DC08B", route: "EventsFormScreen" },
];


  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroBox}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Home Dashboard</Text>
            <View style={styles.headerIcons}>
              <Ionicons name="notifications-outline" size={24} color="#C44536" />
              <View style={styles.sosWrapper}>
                <Text style={styles.sosText}>SOS</Text>
              </View>
            </View>
          </View>
          <View style={styles.avatarContainer}>
            <Image source={require("../assets/image.png")} style={styles.avatarImage} />
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
            We’re here to help you connect with events, resources, and volunteers dedicated to mental health and addiction recovery.
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

        <View style={styles.sectionHeader}>
          <Ionicons name="calendar-outline" size={20} color="black" />
          <Text style={styles.sectionTitle}> Upcoming Events</Text>
        </View>

        {events.map((event) => (
          <View key={event.id} style={styles.eventCard}>
            <View style={styles.eventStripe} />
            <View style={styles.eventText}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventSubtitle}>{event.subtitle}</Text>
              <Text style={styles.eventTime}>{event.time}</Text>
              <Text style={styles.eventDate}>{event.date}</Text>
            </View>
          </View>
        ))}

        <View style={styles.supportBox}>
          <Text style={styles.supportTitle}>🔴 Emergency Support Reminder</Text>
          <Text style={styles.supportText}>
            Need help? Dial 911 for immediate mental health assistance or browse our Resource
            Library for self-help guides and professional contacts. You are not alone 💙
          </Text>
        </View>
      </ScrollView>
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
    height: 100,
    backgroundColor: "#D6EFC7",
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
  },
});

export default HomeDashboardScreen;
