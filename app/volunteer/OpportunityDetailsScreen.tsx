import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../../navigation/AppNavigator";
import { format } from "date-fns";
import FirebaseOpportunityService from "../../services/FirebaseOpportunityService";
import FirebaseVolunteerApplicationService from "../../services/FirebaseVolunteerApplicationService";
import { auth } from "../../config/firebaseConfig";
import { VolunteerOpportunity, VolunteerApplication } from "../../types/volunteer";

type Props = NativeStackScreenProps<HomeStackParamList, "OpportunityDetails">;

const OpportunityDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { title, timing, eventId, opportunityId, description, date, location } = route.params;
  const currentUser = auth.currentUser;

  // State for opportunity details
  const [opportunityDetails, setOpportunityDetails] = useState<VolunteerOpportunity | null>(null);
  const [isApplied, setIsApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(true);
  const [loadingOpportunity, setLoadingOpportunity] = useState(true);

  useEffect(() => {
    fetchOpportunityDetails();
    checkApplicationStatus();
  }, []);

  const fetchOpportunityDetails = async () => {
    try {
      setLoadingOpportunity(true);
      const opportunity = await FirebaseOpportunityService.getOpportunity(opportunityId, eventId);
      if (opportunity) {
        setOpportunityDetails(opportunity);
      } else {
        // Fallback to route.params if opportunity not found or not approved
        setOpportunityDetails({
          opportunityId,
          eventId,
          title,
          noVolunteersNeeded: 0,
          description,
          approvalStatus: "approved",
          timings: timing,
          location: location || undefined,
          createdAt: date ? new Date(date) : new Date(),
          createdBy: "",
        });
        console.log("[fetchOpportunityDetails] Using route.params fallback");
        Alert.alert("Warning", "Unable to load full opportunity details. Showing available information.");
      }
    } catch (error) {
      console.error("Failed to fetch opportunity details", error);
      setOpportunityDetails({
        opportunityId,
        eventId,
        title,
        noVolunteersNeeded: 0,
        description,
        approvalStatus: "approved",
        timings: timing,
        location: location || undefined,
        createdAt: date ? new Date(date) : new Date(),
        createdBy: "",
      });
      Alert.alert("Warning", "Unable to load full opportunity details. Showing available information.");
    } finally {
      setLoadingOpportunity(false);
    }
  };

  const checkApplicationStatus = async () => {
    if (!currentUser) {
      setIsApplied(false);
      setCheckingApplication(false);
      return;
    }
    try {
      const apps = await FirebaseVolunteerApplicationService.getApplicationsByUser(currentUser.uid);
      const app = apps.find((a) => a.opportunityId === opportunityId);
      setIsApplied(!!app);
      setApplicationStatus(app ? app.status.toUpperCase() : null);
    } catch (error) {
      console.error("Error checking application status:", error);
    } finally {
      setCheckingApplication(false);
    }
  };

  const handleApply = async () => {
    if (!currentUser) {
      Alert.alert("Not logged in", "Please log in to apply.");
      return;
    }

    if (isApplied) {
      Alert.alert("Already applied", "You have already applied for this opportunity.");
      return;
    }

    setLoading(true);
    try {
      await FirebaseVolunteerApplicationService.applyForOpportunity({
        userId: currentUser.uid,
        opportunityId,
        message: "",
      });
      setIsApplied(true);
      setApplicationStatus("PENDING");
      Alert.alert("Success", "Your application has been submitted.");
    } catch (error) {
      Alert.alert("Error", "Failed to submit application. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Type guard for createdAt
  const getFormattedDate = (createdAt: Date | { toDate: () => Date }): string => {
    const dateObj = createdAt instanceof Date ? createdAt : createdAt.toDate();
    return format(dateObj, "MMM d, yyyy");
  };

  if (loadingOpportunity) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B6B63" />
      </View>
    );
  }

  if (!opportunityDetails) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.fontSize16Red}>
          Opportunity details not available.
        </Text>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Opportunity Details</Text>
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

      <ScrollView style={styles.content}>
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{opportunityDetails.title}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                {getFormattedDate(opportunityDetails.createdAt)}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Time</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>{opportunityDetails.timings}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                {opportunityDetails.location || "No location specified"}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Volunteers Needed</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                {opportunityDetails.noVolunteersNeeded}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                {opportunityDetails.description || "No description available"}
              </Text>
            </View>
          </View>

          {opportunityDetails.rewards && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rewards</Text>
              <View style={styles.sectionContent}>
                <Text style={styles.sectionText}>{opportunityDetails.rewards}</Text>
              </View>
            </View>
          )}

          {opportunityDetails.refreshments && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Refreshments</Text>
              <View style={styles.sectionContent}>
                <Text style={styles.sectionText}>{opportunityDetails.refreshments}</Text>
              </View>
            </View>
          )}

          {checkingApplication ? (
            <ActivityIndicator
              size="large"
              color="#1B6B63"
              style={styles.loader}
            />
          ) : isApplied ? (
            <Text style={styles.applicationStatus}>
              Application Status: {applicationStatus}
            </Text>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.applyButton]}
              onPress={handleApply}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.actionButtonText}>Apply for Opportunity</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
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
  content: {
    flex: 1,
    marginBottom: 100,
  },
  detailsContainer: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E2E2E",
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  section: {
    marginBottom: 20,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E2E2E",
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
  },
  sectionText: {
    fontSize: 16,
    color: "#2E2E2E",
    lineHeight: 24,
  },
  actionButton: {
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 35,
    marginTop: 15,
    marginBottom: 40,
    alignItems: "center",
    width: "80%",
  },
  applyButton: {
    backgroundColor: "#1B6B63",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  applicationStatus: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E2E2E",
    marginTop: 15,
    marginBottom: 40,
    textAlign: "center",
  },
  loader: {
    marginVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fontSize16Red: {
    fontSize: 16,
    color: "#C44536",
  }
});

export default OpportunityDetailsScreen;