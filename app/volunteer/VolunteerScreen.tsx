/**
 * VolunteerScreen.tsx
 * Main volunteer dashboard that displays available opportunities and provides access to
 * volunteer-related features like applications, rewards, and learning resources.
 * Manages the display and application process for volunteer opportunities.
 */

import React, { useState, useEffect, useCallback } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../../navigation/AppNavigator";
import { format } from "date-fns";
import FirebaseOpportunityService from "../../services/FirebaseOpportunityService";
import FirebaseVolunteerApplicationService from "../../services/FirebaseVolunteerApplicationService";
import { auth } from "../../config/firebaseConfig";
import { VolunteerOpportunity, VolunteerApplication } from "../../types/volunteer";
import HeroBox from "../../components/HeroBox";

type ApprovalStatus = "pending" | "approved" | "rejected";

/**
 * VolunteerScreen Component
 * Displays a grid of volunteer management options and a list of available opportunities
 * Handles opportunity application process and status tracking
 */
const VolunteerScreen: React.FC<
  NativeStackScreenProps<HomeStackParamList, "VolunteerScreen">
> = ({ navigation }) => {
  // State Management
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]); // List of available opportunities
  const [userApplications, setUserApplications] = useState<VolunteerApplication[]>([]); // User's existing applications
  const [loading, setLoading] = useState(true); // Loading state for data fetching
  const [error, setError] = useState<string | null>(null); // Error state for API failures
  const currentUser = auth.currentUser; // Current authenticated user

  /**
   * Fetches approved volunteer opportunities from Firebase
   * Filters opportunities to show only approved ones
   */
  const fetchApprovedOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      const allOpportunities = await FirebaseOpportunityService.getAllOpportunities();
      // getAllOpportunities already filters for approved status in the service
      setOpportunities(allOpportunities);
    } catch (err) {
      setError("Failed to load volunteer opportunities.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetches the current user's volunteer applications
   * Updates the userApplications state with the user's application history
   */
  const fetchUserApplications = useCallback(async () => {
    if (!currentUser) {
      setUserApplications([]);
      return;
    }
    try {
      const apps = await FirebaseVolunteerApplicationService.getApplicationsByUser(currentUser.uid);
      setUserApplications(apps);
    } catch (err) {
      console.error("Failed to load your applications", err);
    }
  }, [currentUser]);

  /**
   * Effect hook to load initial data
   * Fetches opportunities and applications if user is authenticated
   */
  useEffect(() => {
    if (currentUser) {
      fetchApprovedOpportunities();
      fetchUserApplications();
    } else {
      setLoading(false);
      setError("Please log in to view opportunities.");
    }
  }, [fetchApprovedOpportunities, fetchUserApplications, currentUser]);

  /**
   * Checks if the user has already applied to a specific opportunity
   * @param opportunityId - ID of the opportunity to check
   * @returns boolean indicating if user has applied
   */
  const hasApplied = (opportunityId: string) => {
    return userApplications.some((app) => app.opportunityId === opportunityId);
  };

  /**
   * Gets the status of user's application for a specific opportunity
   * @param opportunityId - ID of the opportunity to check
   * @returns Application status string or null if not applied
   */
  const getApplicationStatus = (opportunityId: string): string | null => {
    const app = userApplications.find((a) => a.opportunityId === opportunityId);
    return app ? app.status : null;
  };

  /**
   * Handles the apply button press for an opportunity
   * Validates user authentication and previous applications
   * Navigates to application form if eligible
   * @param opportunity - The opportunity to apply for
   */
  const handleApply = (opportunity: VolunteerOpportunity) => {
    if (!currentUser) {
      Alert.alert("Not logged in", "Please log in to apply.");
      return;
    }

    if (hasApplied(opportunity.opportunityId)) {
      Alert.alert("Already applied", "You have already applied for this opportunity.");
      return;
    }

    navigation.navigate("OpportunityApplicationForm", {
      opportunityId: opportunity.opportunityId,
      eventId: opportunity.eventId,
      title: opportunity.title,
      description: opportunity.description,
      timing: opportunity.timings,
      date: format(
        opportunity.createdAt instanceof Date
          ? opportunity.createdAt
          : opportunity.createdAt?.toDate?.() || new Date(),
        "MMM d, yyyy"
      ),
      location: opportunity.location,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with title and back button */}
      <HeroBox title="Volunteer" showBackButton={true} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Quick Access Grid - Navigation buttons for volunteer features */}
        <View style={styles.gridRow}>
          {/* Browse Opportunities Button */}
          <TouchableOpacity
            style={styles.gridButton}
            onPress={() => navigation.navigate("Opportunities")}
          >
            <Ionicons name="search-outline" size={32} color="#FFFFFF" style={styles.gridIcon} />
            <Text style={styles.gridButtonText}>Browse</Text>
          </TouchableOpacity>
          
          {/* Learning Resources Button */}
          <TouchableOpacity
            style={styles.gridButton}
            onPress={() => navigation.navigate("VolunteerLearnings")}
          >
            <Ionicons name="school-outline" size={32} color="#FFFFFF" style={styles.gridIcon} />
            <Text style={styles.gridButtonText}>My Learnings</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gridRow}>
          {/* Rewards Button */}
          <TouchableOpacity
            style={styles.gridButton}
            onPress={() => navigation.navigate("VolunteerRewards")}
          >
            <Ionicons name="trophy-outline" size={32} color="#FFFFFF" style={styles.gridIcon} />
            <Text style={styles.gridButtonText}>Rewards</Text>
          </TouchableOpacity>
          
          {/* My Applications Button */}
          <TouchableOpacity
            style={styles.gridButton}
            onPress={() => navigation.navigate("MyApplications")}
          >
            <Ionicons name="clipboard-outline" size={32} color="#FFFFFF" style={styles.gridIcon} />
            <Text style={styles.gridButtonText}>My Applications</Text>
          </TouchableOpacity>
        </View>

        {/* Available Events Section */}
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar-outline" size={20} color="black" />
          <Text style={styles.sectionTitle}>Available Events</Text>
        </View>

        {/* Conditional rendering based on loading and data state */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#1B6B63"
            style={styles.loader}
          />
        ) : error ? (
          <Text style={styles.noEventsText}>{error}</Text>
        ) : opportunities.length === 0 ? (
          <Text style={styles.noEventsText}>
            No opportunities available at the moment
          </Text>
        ) : (
          // Map through and render opportunity cards
          opportunities.map((opportunity) => {
            const applied = hasApplied(opportunity.opportunityId);
            const status = getApplicationStatus(opportunity.opportunityId);
            const createdAtDate =
              opportunity.createdAt instanceof Date
                ? opportunity.createdAt
                : typeof opportunity.createdAt?.toDate === "function"
                  ? opportunity.createdAt.toDate()
                  : new Date();

            return (
              <View key={opportunity.opportunityId} style={styles.card}>
                <Text style={styles.cardTitle}>{opportunity.title}</Text>
                <Text style={styles.cardSubtitle}>{opportunity.timings}</Text>
                <Text style={styles.cardDetails}>{opportunity.description}</Text>
                <Text style={styles.cardDetails}>
                  Needed Volunteers: {opportunity.noVolunteersNeeded}
                </Text>
                {opportunity.location && (
                  <Text style={styles.cardDetails}>Location: {opportunity.location}</Text>
                )}
                {applied ? (
                  <Text style={styles.appliedText}>
                    Application Status: {status?.toUpperCase()}
                  </Text>
                ) : (<Text></Text>)}
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() =>
                    navigation.navigate("OpportunityDetails", {
                      title: opportunity.title,
                      timing: opportunity.timings,
                      eventId: opportunity.eventId,
                      opportunityId: opportunity.opportunityId,
                      description: opportunity.description,
                      date: format(createdAtDate, "MMM d, yyyy"),
                      location: opportunity.location,
                    })
                  }
                >
                  <Text style={styles.detailsButtonText}>Details</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

/**
 * Styles for the VolunteerScreen component
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
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    paddingHorizontal: 20,
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
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  gridButton: {
    flex: 1,
    backgroundColor: '#1B6B63',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    paddingVertical: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  gridIcon: {
    marginBottom: 8,
  },
  gridButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E2E2E",
    marginLeft: 10,
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
  applyButton: {
    alignSelf: "flex-end",
    backgroundColor: "#1B6B63",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
  appliedText: {
    alignSelf: "flex-end",
    fontWeight: "bold",
    color: "#2E2E2E",
    fontSize: 15,
    marginBottom: 10,
  },
  loader: {
    marginVertical: 20,
  },
  noEventsText: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
    fontSize: 16,
  },
});

export default VolunteerScreen;