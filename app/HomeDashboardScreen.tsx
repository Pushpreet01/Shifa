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
import { useNavigation, useFocusEffect, CompositeNavigationProp } from "@react-navigation/native";
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
import { db, auth } from "../config/firebaseConfig";
import { StackNavigationProp } from "@react-navigation/stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { HomeStackParamList, SettingsStackParamList, RootTabParamList } from "../navigation/AppNavigator";
import HeroBox from "../components/HeroBox";

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

type HomeDashboardScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<HomeStackParamList>,
  CompositeNavigationProp<
    BottomTabNavigationProp<RootTabParamList>,
    StackNavigationProp<SettingsStackParamList>
  >
>;

type DashboardButton = {
  label: string;
  color: string;
  route: keyof HomeStackParamList;
  icon: "people" | "pencil" | "calendar";
  description: string;
};

const dashboardButtons: DashboardButton[] = [
  {
    label: "Manage Volunteering",
    color: "#1B6B63",
    route: "VolunteerScreen",
    icon: "people",
    description: "Access volunteer opportunities"
  },
  { 
    label: "Journal",
    color: "#1B6B63",
    route: "JournalScreen",
    icon: "pencil",
    description: "Write and manage entries"
  },
  { 
    label: "Manage Events",
    color: "#1B6B63",
    route: "Events",
    icon: "calendar",
    description: "View upcoming events"
  }
];

const HomeDashboardScreen = () => {
  const navigation = useNavigation<HomeDashboardScreenNavigationProp>();
  const { user } = useAuth();
  const [events, setEvents] = useState<ProcessedEventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

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

  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
      fetchRegisteredEvents();
    }, [fetchRegisteredEvents])
  );

  const fetchUserProfile = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserName(userData.fullName || "User");
        setProfileImage(userData.profileImage || null);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const handleProfilePress = () => {
    // @ts-ignore - Ignoring type check for cross-stack navigation
    navigation.navigate("Settings", { screen: "Profile" });
  };

  const handleNavigation = (route: keyof HomeStackParamList) => {
    // Using a more specific type assertion for the navigation object
    (navigation as unknown as { navigate: (screen: string) => void }).navigate(route);
  };

  // Helper function to chunk array
  const chunkArray = (array: any[], size: number) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  // Initial load and periodic refresh
  useEffect(() => {
    fetchRegisteredEvents();

    // Set up a refresh interval (optional, can be removed if not needed)
    const refreshInterval = setInterval(fetchRegisteredEvents, 60000); // Refresh every minute

    return () => {
      clearInterval(refreshInterval);
    };
  }, [fetchRegisteredEvents]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.customHeroBox}>
          <View style={styles.customHeader}>
            <Text style={styles.customHeaderTitle}>Home Dashboard</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity onPress={() => navigation.navigate("Announcements")}>
                <Ionicons name="notifications-outline" size={24} color="#C44536" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.sosWrapper} onPress={() => navigation.navigate("Emergency")}>
                <Text style={styles.sosText}>SOS</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Profile Section */}
        <TouchableOpacity onPress={handleProfilePress} style={styles.profileCard}>
          <View style={styles.profileContent}>
            <View style={styles.profileInfo}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{userName}</Text>
            </View>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person-outline" size={24} color="rgba(255, 255, 255, 0.8)" />
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Quick Access Section */}
        <View style={[styles.quickAccessContainer, { overflow: 'visible' }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name="grid" size={18} color="#F4A941" />
              </View>
              <Text style={styles.sectionTitle}>Quick Access</Text>
            </View>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickAccessScroll}
            decelerationRate="fast"
            snapToInterval={196} // panel width (180) + margin right (16)
            snapToAlignment="start"
            onMomentumScrollEnd={(event) => {
              const position = event.nativeEvent.contentOffset.x;
              const newIndex = position > 196 ? 1 : 0; // Only 2 positions: 0 and 1
              setActiveIndex(newIndex);
            }}
          >
            {dashboardButtons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.quickAccessPanel,
                  index === dashboardButtons.length - 1 && { marginRight: 20 }
                ]}
                onPress={() => handleNavigation(button.route)}
              >
                <View style={styles.quickAccessContent}>
                  <View style={styles.iconContainer}>
                    <Ionicons name={button.icon} size={24} color="#1B6B63" />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.quickAccessTitle}>{button.label}</Text>
                    <Text style={styles.quickAccessDescription}>{button.description}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.paginationDots}>
            {[0, 1].map((index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === activeIndex && styles.paginationDotActive
                ]}
              />
            ))}
          </View>
        </View>

        {/* SOS Button */}
        <TouchableOpacity
          style={styles.sosButton}
          onPress={() => handleNavigation("Emergency")}
        >
          <View style={styles.sosContent}>
            <View style={styles.sosIconContainer}>
              <Ionicons name="alert-circle" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.sosTextContainer}>
              <Text style={styles.sosButtonText}>SOS Emergency</Text>
              <Text style={styles.sosDescription}>Get immediate help</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#FFFFFF" style={styles.sosArrow} />
          </View>
        </TouchableOpacity>

        {/* Events Section */}
        <View style={styles.eventsContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name="calendar" size={18} color="#F4A941" />
              </View>
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
            </View>
          </View>

          {events.length === 0 ? (
            <View style={styles.noEventsContainer}>
              <View style={styles.noEventsIconContainer}>
                <Ionicons name="calendar" size={40} color="#1B6B63" />
              </View>
              <Text style={styles.noEventsTitle}>No Upcoming Events</Text>
              <Text style={styles.noEventsSubtext}>
                Join our supportive community events and connect with others on
                their journey to wellness.
              </Text>
              <TouchableOpacity
                style={styles.joinEventButton}
                onPress={() => handleNavigation("Events")}
              >
                <Text style={styles.joinEventButtonText}>Explore Events</Text>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color="#FFFFFF"
                  style={styles.buttonIcon}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.eventsList}>
              {events.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventCard}
                  onPress={() => handleNavigation("Events")}
                >
                  <View style={styles.eventText}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventSubtitle}>{event.subtitle}</Text>
                    <Text style={styles.eventTime}>{event.time}</Text>
                    <Text style={styles.eventDate}>{event.date}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Description Section with Modern Divider */}
        <View style={styles.descriptionContainer}>
          <View style={styles.modernDivider}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerIcon}>
              <Ionicons name="heart" size={20} color="#F6A800" />
            </View>
            <View style={styles.dividerLine} />
          </View>
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionText}>
              We're here to help you connect with events, resources, and
              volunteers dedicated to mental health and addiction recovery.
            </Text>
          </View>
        </View>

        {/* Support Box */}
        <View style={styles.supportBox}>
          <Text style={styles.supportTitle}>🔴 Emergency Support Reminder</Text>
          <Text style={styles.supportText}>
            Need help? Dial 911 for immediate mental health assistance or browse
            our Resource Library for self-help guides and professional contacts.
            You are not alone 💚
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FDF6EC",
  },
  container: {
    paddingBottom: 100,
    backgroundColor: "#FDF6EC",
  },
  profileCard: {
    backgroundColor: '#1B6B63',
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent white border
  },
  profileImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Semi-transparent white
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent white border
  },
  quickAccessContainer: {
    marginTop: 16,
    marginBottom: 20,
  },
  quickAccessScroll: {
    paddingLeft: 20,
    paddingVertical: 4,
  },
  quickAccessPanel: {
    width: 180,
    height: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginRight: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  quickAccessContent: {
    flex: 1,
    height: '100%',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(27, 107, 99, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginTop: 12,
  },
  quickAccessTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2E2E2E',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  quickAccessDescription: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
    letterSpacing: -0.2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4A4A4A", // Changed to a dark grey for better readability
    letterSpacing: -0.3,
  },
  titleUnderline: {
    display: 'none', // Remove the underline
  },
  descriptionContainer: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  modernDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(246, 168, 0, 0.3)', // Lighter orange
    maxWidth: '30%',
  },
  dividerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(246, 168, 0, 0.1)', // Very light orange
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#F6A800',
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#2E2E2E',
    textAlign: 'left',
    fontWeight: '500',
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
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(244, 169, 65, 0.1)', // Changed to match new color scheme
    justifyContent: 'center',
    alignItems: 'center',
  },
  noEventsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  noEventsIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  noEventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  noEventsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  joinEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B6B63',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  joinEventButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  eventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  eventStripe: {
    width: 0, // hidden
  },
  eventText: {
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#F6A800",
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B6B63",
    marginBottom: 4,
  },
  eventSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  eventTime: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  eventDate: {
    fontSize: 13,
    color: "#999",
    marginTop: 2,
  },
  supportBox: {
    backgroundColor: '#FFF0F0',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#C44536",
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
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
  sosButton: {
    backgroundColor: '#C44536',
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  sosContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sosIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  sosButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sosDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  sosArrow: {
    marginLeft: 12,
    opacity: 0.8,
  },
  eventsContainer: {
    marginTop: 20,
  },
  eventsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  customHeroBox: {
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
  customHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  customHeaderTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1B6B63", // Changed back to teal
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
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
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#1B6B63',
    width: 24,
    borderRadius: 4,
  },
});

export default HomeDashboardScreen;
