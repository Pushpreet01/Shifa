import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Image,
} from "react-native";
import AdminHeroBox from "../../components/AdminHeroBox";
import { approveItem, denyItem } from "../../services/adminApprovalService";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { AdminStackParamList } from "../../navigation/AdminNavigator";
import { db } from "../../config/firebaseConfig";

type ApprovalDetailsScreenProps = {
  route: RouteProp<AdminStackParamList, "ApprovalDetails">;
  navigation: NativeStackNavigationProp<AdminStackParamList, "ApprovalDetails">;
};

const ApprovalDetailsScreen: React.FC<ApprovalDetailsScreenProps> = ({ route, navigation }) => {
  const { id, type } = route.params;
  const [event, setEvent] = useState<any>(null);
  const [opportunity, setOpportunity] = useState<any>(null);
  const [eventCreator, setEventCreator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      if (type === "event") {
        // Fetch event by ID directly from Firestore
        const eventDoc = await getDoc(doc(db, "events", id));
        if (eventDoc.exists()) {
          const eventData = eventDoc.data();
          setEvent({ id, ...eventData });

          // Fetch event creator details
          if (eventData.createdBy) {
            try {
              const userDoc = await getDoc(doc(db, "users", eventData.createdBy));
              if (userDoc.exists()) {
                setEventCreator({ id: userDoc.id, ...userDoc.data() });
              }
            } catch (error) {
              console.error("Error fetching event creator:", error);
            }
          }

          if (eventData.needsVolunteers) {
            // Fetch associated opportunity
            const q = query(
              collection(db, "opportunities"),
              where("eventId", "==", id)
            );
            const oppSnap = await getDocs(q);
            if (!oppSnap.empty) {
              setOpportunity({
                id: oppSnap.docs[0].id,
                ...oppSnap.docs[0].data(),
              });
            }
          }
        }
      }
      // Add similar logic for 'volunteer' and 'organizer' if needed
      setLoading(false);
    };
    fetchDetails();
  }, [id, type]);

  const handleApprove = async () => {
    try {
      await approveItem(event.id, "event");
      Alert.alert("Approved", "Event and opportunity approved.");
      navigation.goBack();
    } catch (error) {
      console.error("Error approving event:", error);
      Alert.alert("Error", "Failed to approve event.");
    }
  };

  const handleReject = () => {
    setRejectionReason("");
    setRejectionModalVisible(true);
  };

  const confirmReject = async () => {
    try {
      await denyItem(event.id, "event", rejectionReason);
      setRejectionModalVisible(false);
      Alert.alert("Rejected", "Event and opportunity rejected.");
      navigation.goBack();
    } catch (error) {
      console.error("Error rejecting event:", error);
      Alert.alert("Error", "Failed to reject event.");
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#FDF6EC",
        }}
      >
        <Text>Loading...</Text>
      </View>
    );
  }
  if (!event) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#FDF6EC",
        }}
      >
        <Text>Event not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <AdminHeroBox
        title="Approval Details"
        showBackButton
        customBackRoute="ApprovalManagement"
      />
      {/* Rejection Reason Modal */}
      <Modal
        visible={rejectionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectionModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center" }}>
          <View style={{ backgroundColor: "#fff", padding: 24, borderRadius: 12, width: 320 }}>
            <Text style={{ fontWeight: "bold", fontSize: 18, color: "#C44536", marginBottom: 12 }}>Rejection Reason</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: "#C44536", borderRadius: 8, padding: 10, minHeight: 60, color: "#333", marginBottom: 16 }}
              placeholder="Enter reason for rejection..."
              placeholderTextColor="#888"
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12 }}>
              <TouchableOpacity onPress={() => setRejectionModalVisible(false)} style={{ padding: 8 }}>
                <Text style={{ color: "#888", fontWeight: "bold" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmReject} style={{ backgroundColor: "#C44536", padding: 8, borderRadius: 6 }}>
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <View style={styles.card}>
        {/* Event Creator Card */}
        {eventCreator && (
          <View style={styles.eventCreatorCard}>
            <Image
              source={eventCreator.profileImage ? { uri: eventCreator.profileImage } : require('../../assets/aiplaceholder.png')}
              style={styles.eventCreatorImage}
            />
            <View style={styles.eventCreatorDetails}>
              <Text style={styles.eventCreatorName}>{eventCreator.fullName || eventCreator.displayName || "No Name"}</Text>
              <Text style={styles.eventCreatorEmail}>{eventCreator.email}</Text>
              <Text style={styles.eventCreatorRole}>Role: {eventCreator.role || "Unknown"}</Text>
            </View>
          </View>
        )}

        <Text style={styles.label}>Title:</Text>
        <Text style={styles.value}>{event.title}</Text>
        <Text style={styles.label}>Description:</Text>
        <Text style={styles.value}>{event.description}</Text>
        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>
          {event.date
            ? event.date.seconds
              ? new Date(event.date.seconds * 1000).toLocaleDateString()
              : new Date(event.date).toLocaleDateString()
            : ""}
        </Text>
        <Text style={styles.label}>Event Timings:</Text>
        <Text style={styles.value}>
          {event.startTime && event.endTime
            ? `${event.startTime} - ${event.endTime}`
            : "Not specified"
          }
        </Text>
        <Text style={styles.label}>Location:</Text>
        <Text style={styles.value}>{event.location}</Text>
        <Text style={styles.label}>Needs Volunteers:</Text>
        <Text style={styles.value}>{event.needsVolunteers ? "Yes" : "No"}</Text>
        {opportunity && (
          <>
            <Text style={styles.label}>Number of Volunteers Needed:</Text>
            <Text style={styles.value}>{opportunity.noVolunteersNeeded || "Not specified"}</Text>
            <Text style={styles.label}>Opportunity Description:</Text>
            <Text style={styles.value}>{opportunity.description}</Text>
            <Text style={styles.label}>Volunteer Timings:</Text>
            <Text style={styles.value}>{opportunity.timings}</Text>
            <Text style={styles.label}>Rewards:</Text>
            <Text style={styles.value}>{opportunity.rewards || "Not specified"}</Text>
            <Text style={styles.label}>Refreshments:</Text>
            <Text style={styles.value}>{opportunity.refreshments || "Not specified"}</Text>
          </>
        )}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.approveBtn]}
            onPress={handleApprove}
          >
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.rejectBtn]}
            onPress={handleReject}
          >
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDF6EC", paddingBottom: 100 },
  card: {
    backgroundColor: "#fff",
    margin: 20,
    marginBottom: 120,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },
  label: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#1B6B63",
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    marginTop: 4,
    color: "#333",
  },
  actions: {
    marginTop: 20,
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
  },
  button: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 120,
  },
  approveBtn: { backgroundColor: "#1B6B63" },
  rejectBtn: { backgroundColor: "#C44536" },
  buttonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  eventCreatorCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    padding: 15,
    backgroundColor: "#E0F2F7",
    borderRadius: 12,
  },
  eventCreatorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  eventCreatorDetails: {
    flex: 1,
  },
  eventCreatorName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#1B6B63",
  },
  eventCreatorEmail: {
    fontSize: 14,
    color: "#555",
  },
  eventCreatorRole: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
});

export default ApprovalDetailsScreen;
