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
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../../navigation/AppNavigator";
import { format } from "date-fns";
import FirebaseOpportunityService from "../../services/FirebaseOpportunityService";
import FirebaseVolunteerApplicationService from "../../services/FirebaseVolunteerApplicationService";
import { auth, db } from "../../config/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { VolunteerOpportunity, VolunteerApplication } from "../../types/volunteer";
import HeroBox from "../../components/HeroBox";
import KeyboardAwareWrapper from "../../components/KeyboardAwareWrapper";

type Props = NativeStackScreenProps<HomeStackParamList, "OpportunityDetails">;

const OpportunityDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { title, timing, eventId, opportunityId, description, date, location } = route.params;
  const currentUser = auth.currentUser;

  const [opportunityDetails, setOpportunityDetails] = useState<VolunteerOpportunity | null>(null);
  const [isApplied, setIsApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [checkingApplication, setCheckingApplication] = useState(true);
  const [loadingOpportunity, setLoadingOpportunity] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    aboutYourself: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    fetchOpportunityDetails();
    fetchUserData();
    checkApplicationStatus();
  }, []);

  // If not approved, show a message and do not allow application
  const isOpportunityApproved = opportunityDetails?.approvalStatus === 'approved';

  if (!loadingOpportunity && opportunityDetails && !isOpportunityApproved) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FDF6EC' }}>
        <Text style={{ color: '#C44536', fontSize: 18, textAlign: 'center', margin: 20 }}>
          This opportunity is not available. It may be pending admin approval or has been rejected.
        </Text>
      </SafeAreaView>
    );
  }

  const fetchOpportunityDetails = async () => {
    try {
      setLoadingOpportunity(true);
      const opportunity = await FirebaseOpportunityService.getOpportunity(opportunityId, eventId);
      if (opportunity) {
        setOpportunityDetails(opportunity);
      } else {
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

  const fetchUserData = async () => {
    if (!currentUser) {
      setFetchingUser(false);
      return;
    }
    try {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setFormData({
          ...formData,
          fullName: userData.fullName || "",
          email: userData.email || currentUser.email || "",
        });
      } else {
        setFormData({
          ...formData,
          fullName: "",
          email: currentUser.email || "",
        });
        console.warn("[OpportunityDetails] User document not found, using auth email.");
      }
    } catch (error) {
      console.error("[OpportunityDetails] Error fetching user data:", error);
      Alert.alert("Error", "Failed to load user data.");
    } finally {
      setFetchingUser(false);
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
      setApplicationId(app ? app.id : null);
    } catch (error) {
      console.error("Error checking application status:", error);
    } finally {
      setCheckingApplication(false);
    }
  };

  const validateForm = () => {
    if (!formData.aboutYourself.trim()) {
      Alert.alert("Error", "Please provide a description about yourself.");
      return false;
    }
    return true;
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
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await FirebaseVolunteerApplicationService.applyForOpportunity({
        userId: currentUser.uid,
        opportunityId,
        message: formData.aboutYourself,
      });
      Alert.alert("Success", "Your application has been submitted.");
      setIsApplied(true);
      setApplicationStatus("PENDING");
      setFormData({ ...formData, aboutYourself: "" });
      await checkApplicationStatus();
    } catch (error) {
      console.error("[OpportunityDetails] Error submitting application:", error);
      Alert.alert("Error", "Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!currentUser) {
      Alert.alert("Not logged in", "Please log in to cancel.");
      return;
    }
    if (!applicationId) {
      Alert.alert("Error", "No application found to cancel.");
      return;
    }
    setCanceling(true);
    try {
      await FirebaseVolunteerApplicationService.deleteApplication(applicationId);
      Alert.alert("Success", "Your application has been canceled.");
      setIsApplied(false);
      setApplicationStatus(null);
      setApplicationId(null);
    } catch (error) {
      console.error("[OpportunityDetails] Error canceling application:", error);
      Alert.alert("Error", "Failed to cancel application. Please try again.");
    } finally {
      setCanceling(false);
    }
  };

  const getFormattedDate = (createdAt: Date | { toDate: () => Date }): string => {
    const dateObj = createdAt instanceof Date ? createdAt : createdAt.toDate();
    return format(dateObj, "MMMM d, yyyy");
  };

  if (loadingOpportunity || fetchingUser) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E2E2E" />
        <Text style={styles.loadingText}>Loading opportunity details...</Text>
      </SafeAreaView>
    );
  }

  if (!opportunityDetails) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Opportunity not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <HeroBox title="Opportunity Details" showBackButton={true} />
      <KeyboardAwareWrapper>
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.eventInfoContainer}>
            <Text style={styles.eventTitle}>{opportunityDetails.title}</Text>

            <View style={styles.eventDetailsBox}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailText}>
                  {getFormattedDate(opportunityDetails.createdAt)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Time:</Text>
                <Text style={styles.detailText}>{opportunityDetails.timings}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Location:</Text>
                <Text style={styles.detailText}>
                  {opportunityDetails.location || "No location specified"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Volunteers:</Text>
                <Text style={styles.detailText}>
                  {opportunityDetails.noVolunteersNeeded}
                </Text>
              </View>

              <View style={styles.descriptionContainer}>
                <Text style={styles.detailLabel}>Description:</Text>
                <Text style={styles.descriptionText}>
                  {opportunityDetails.description || "No description available"}
                </Text>
              </View>

              {opportunityDetails.rewards && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.detailLabel}>Rewards:</Text>
                  <Text style={styles.descriptionText}>{opportunityDetails.rewards}</Text>
                </View>
              )}

              {opportunityDetails.refreshments && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.detailLabel}>Refreshments:</Text>
                  <Text style={styles.descriptionText}>{opportunityDetails.refreshments}</Text>
                </View>
              )}
            </View>
          </View>

          {checkingApplication ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2E2E2E" />
            </View>
          ) : isApplied ? (
            <View style={styles.registeredContainer}>
              <Text style={styles.registeredText}>
                Application Status: {applicationStatus}
              </Text>
              <TouchableOpacity
                style={[styles.cancelButton, canceling && styles.disabledButton]}
                onPress={handleCancel}
                disabled={canceling}
              >
                <Text style={styles.buttonText}>
                  {canceling ? "Canceling..." : "Cancel Registration"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Apply for Opportunity</Text>

              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: "#f0f0f0" }]}
                value={formData.fullName}
                editable={false}
                placeholder="Name not available"
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[styles.input, { backgroundColor: "#f0f0f0" }]}
                value={formData.email}
                editable={false}
                placeholder="Email not available"
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Tell us about Yourself</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Give us a short description about yourself."
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={formData.aboutYourself}
                onChangeText={(text) => setFormData({ ...formData, aboutYourself: text })}
                placeholderTextColor="#999"
              />

              <TouchableOpacity
                style={[styles.registerButton, submitting && styles.disabledButton]}
                onPress={handleApply}
                disabled={submitting}
              >
                <Text style={styles.buttonText}>
                  {submitting ? "Submitting..." : "Submit Application"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAwareWrapper>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF6EC",
  },
  heroBox: {
    backgroundColor: "#FDF6EC",
    paddingTop: 40,
    paddingBottom: 16,
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
  scrollContainer: {
    flex: 1,
    padding: 20,
    marginBottom: 100,
  },
  eventInfoContainer: {
    marginBottom: 20,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E2E2E",
    marginBottom: 15,
  },
  eventDetailsBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: "600",
    color: "#1B6B63",
    width: 100,
  },
  detailText: {
    flex: 1,
    color: "#2E2E2E",
  },
  descriptionContainer: {
    marginTop: 5,
  },
  descriptionText: {
    color: "#2E2E2E",
    marginTop: 5,
    lineHeight: 20,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 100,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1B6B63",
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2E2E2E",
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 12,
    fontSize: 16,
    color: "#2E2E2E",
    marginBottom: 10,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  registerButton: {
    backgroundColor: "#1B6B63",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: "center",
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: "#C44536",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: "center",
    marginTop: 15,
  },
  disabledButton: {
    backgroundColor: "#F4A941",
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  registeredContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 5,
    borderLeftColor: "#F4A941",
    marginBottom: 20,
  },
  registeredText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1B6B63",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 10,
    color: "#2E2E2E",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#F4A941",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#1B6B63",
    borderRadius: 20,
    padding: 12,
    paddingHorizontal: 20,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

export default OpportunityDetailsScreen;