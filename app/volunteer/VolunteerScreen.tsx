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

const VolunteerScreen: React.FC<
  NativeStackScreenProps<HomeStackParamList, "VolunteerScreen">
> = ({ navigation }) => {
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [userApplications, setUserApplications] = useState<VolunteerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = auth.currentUser;

  // Fetch approved opportunities
  const fetchApprovedOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      const allOpportunities = await FirebaseOpportunityService.getAllOpportunities();
      const approved = allOpportunities.filter(
        (opp) => opp.approvalStatus === "approved"
      );
      setOpportunities(approved);
    } catch (err) {
      setError("Failed to load volunteer opportunities.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch current user's applications
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

  useEffect(() => {
    if (currentUser) {
      fetchApprovedOpportunities();
      fetchUserApplications();
    } else {
      setLoading(false);
      setError("Please log in to view opportunities.");
    }
  }, [fetchApprovedOpportunities, fetchUserApplications, currentUser]);

  // Check if user already applied
  const hasApplied = (opportunityId: string) => {
    return userApplications.some((app) => app.opportunityId === opportunityId);
  };

  // Get application status
  const getApplicationStatus = (opportunityId: string): string | null => {
    const app = userApplications.find((a) => a.opportunityId === opportunityId);
    return app ? app.status : null;
  };

  // Apply for opportunity
  const handleApply = async (opportunity: VolunteerOpportunity) => {
    if (!currentUser) {
      Alert.alert("Not logged in", "Please log in to apply.");
      return;
    }

    if (hasApplied(opportunity.opportunityId)) {
      Alert.alert("Already applied", "You have already applied for this opportunity.");
      return;
    }

    try {
      await FirebaseVolunteerApplicationService.applyForOpportunity({
        userId: currentUser.uid,
        opportunityId: opportunity.opportunityId,
        message: "",
      });
      Alert.alert("Success", "Your application has been submitted.");
      fetchUserApplications();
    } catch (err) {
      Alert.alert("Error", "Failed to submit application.");
      console.error(err);
    }
  };

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
        ) : error ? (
          <Text style={styles.noEventsText}>{error}</Text>
        ) : opportunities.length === 0 ? (
          <Text style={styles.noEventsText}>
            No opportunities available at the moment
          </Text>
        ) : (
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
                ) : (
                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={() => handleApply(opportunity)}
                    disabled={loading}
                  >
                    <Text style={styles.applyButtonText}>Apply</Text>
                  </TouchableOpacity>
                )}
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