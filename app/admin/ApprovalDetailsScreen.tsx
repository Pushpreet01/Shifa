import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import AdminHeroBox from "../../components/AdminHeroBox";
import adminEventService from "../../services/adminEventService";
import FirebaseOpportunityService from "../../services/FirebaseOpportunityService";
import FirebaseEventService from "../../services/firebaseEventService";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";

const ApprovalDetailsScreen = ({ route, navigation }) => {
  const { id, type } = route.params;
  const [event, setEvent] = useState<any>(null);
  const [opportunity, setOpportunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      if (type === "event") {
        const eventData = await adminEventService.getEventById(id);
        if (eventData) {
          setEvent({ id, ...eventData });
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
    if (event) {
      await adminEventService.updateEvent(event.id, {
        approvalStatus: "approved",
      });

      // Broadcast the event approval (announcements and notifications)
      try {
        await FirebaseEventService.broadcastEventApproval(event.id);
      } catch (broadcastError) {
        console.log("Error broadcasting event approval:", broadcastError);
        // Don't fail the approval if broadcast fails
      }
    }
    if (opportunity) {
      await FirebaseOpportunityService.updateOpportunity(opportunity.id, {
        approvalStatus: "approved",
      });
    }
    Alert.alert("Approved", "Event and opportunity approved.");
    navigation.goBack();
  };

  const handleReject = async () => {
    if (event) {
      await adminEventService.updateEvent(event.id, {
        approvalStatus: "rejected",
      });
    }
    if (opportunity) {
      await FirebaseOpportunityService.updateOpportunity(opportunity.id, {
        approvalStatus: "rejected",
      });
    }
    Alert.alert("Rejected", "Event and opportunity rejected.");
    navigation.goBack();
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
      <View style={styles.card}>
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
        <Text style={styles.label}>Location:</Text>
        <Text style={styles.value}>{event.location}</Text>
        <Text style={styles.label}>Needs Volunteers:</Text>
        <Text style={styles.value}>{event.needsVolunteers ? "Yes" : "No"}</Text>
        {opportunity && (
          <>
            <Text style={styles.label}>Opportunity Description:</Text>
            <Text style={styles.value}>{opportunity.description}</Text>
            <Text style={styles.label}>Timings:</Text>
            <Text style={styles.value}>{opportunity.timings}</Text>
            <Text style={styles.label}>Rewards:</Text>
            <Text style={styles.value}>{opportunity.rewards}</Text>
            <Text style={styles.label}>Refreshments:</Text>
            <Text style={styles.value}>{opportunity.refreshments}</Text>
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
  container: { flex: 1, backgroundColor: "#FDF6EC" },
  card: {
    backgroundColor: "#fff",
    margin: 20,
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
});

export default ApprovalDetailsScreen;
