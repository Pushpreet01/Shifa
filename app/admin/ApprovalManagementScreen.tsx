import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  Swipeable,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import AdminHeroBox from "../../components/AdminHeroBox";
import { db } from "../../config/firebaseConfig";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import FirebaseOpportunityService from "../../services/FirebaseOpportunityService";
import FirebaseEventService from "../../services/firebaseEventService";

const ApprovalManagementScreen = () => {
  const [activeTab, setActiveTab] = useState<
    "event" | "volunteer" | "organizer"
  >("event");
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const navigation = useNavigation<any>();

  // Fetch pending approvals from Firestore
  useEffect(() => {
    const fetchApprovals = async () => {
      setLoading(true);
      let q;
      if (activeTab === "event") {
        q = query(
          collection(db, "events"),
          where("approvalStatus", "==", "pending")
        );
      } else if (activeTab === "volunteer") {
        q = query(
          collection(db, "opportunities"),
          where("approvalStatus", "==", "pending")
        );
      } else {
        q = query(
          collection(db, "organizerRequests"),
          where("approvalStatus", "==", "pending")
        );
      }
      const snapshot = await getDocs(q);
      setApprovals(
        snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
      );
      setLoading(false);
    };
    fetchApprovals();
  }, [activeTab]);

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    let col =
      activeTab === "event"
        ? "events"
        : activeTab === "volunteer"
        ? "opportunities"
        : "organizerRequests";
    try {
      await updateDoc(doc(db, col, id), { approvalStatus: "approved" });

      // If approving an event, broadcast the approval and approve associated opportunity (if any)
      if (activeTab === "event") {
        // Broadcast the event approval (announcements and notifications)
        try {
          await FirebaseEventService.broadcastEventApproval(id);
        } catch (broadcastError) {
          console.log("Error broadcasting event approval:", broadcastError);
          // Don't fail the approval if broadcast fails
        }

        // Approve associated opportunity (if any)
        const q = query(
          collection(db, "opportunities"),
          where("eventId", "==", id)
        );
        const oppSnap = await getDocs(q);
        if (!oppSnap.empty) {
          for (const oppDoc of oppSnap.docs) {
            await FirebaseOpportunityService.updateOpportunity(oppDoc.id, {
              approvalStatus: "approved",
            });
          }
        }
      }

      setApprovals(approvals.filter((item) => item.id !== id));
      Alert.alert("Approved", "Item has been approved.");
    } catch (err) {
      console.log("Error approving item:", err);
      Alert.alert("Error", "Failed to approve item.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeny = async (id: string) => {
    setActionLoading(true);
    let col =
      activeTab === "event"
        ? "events"
        : activeTab === "volunteer"
        ? "opportunities"
        : "organizerRequests";
    try {
      await updateDoc(doc(db, col, id), { approvalStatus: "rejected" });
      // If denying an event, also reject associated opportunity (if any)
      if (activeTab === "event") {
        const q = query(
          collection(db, "opportunities"),
          where("eventId", "==", id)
        );
        const oppSnap = await getDocs(q);
        if (!oppSnap.empty) {
          for (const oppDoc of oppSnap.docs) {
            await FirebaseOpportunityService.updateOpportunity(oppDoc.id, {
              approvalStatus: "rejected",
            });
          }
        }
      }
      setApprovals(approvals.filter((item) => item.id !== id));
      Alert.alert("Denied", "Item has been denied.");
    } catch (err) {
      console.log("Error denying item:", err);
      Alert.alert("Error", "Failed to deny item.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCardPress = (item: any) => {
    navigation.navigate("ApprovalDetails", {
      id: item.id,
      type: activeTab, // 'event', 'volunteer', or 'organizer'
    });
  };

  const renderRightActions = (id: string) => (
    <View style={styles.verticalSwipeActions}>
      <TouchableOpacity
        style={[styles.swipeButton, styles.approveBtn]}
        onPress={() => handleApprove(id)}
      >
        <Ionicons name="checkmark-outline" size={20} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.swipeButton, styles.denyBtn]}
        onPress={() => handleDeny(id)}
      >
        <Ionicons name="close-outline" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {actionLoading && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
              backgroundColor: "rgba(255,255,255,0.6)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator size="large" color="#1B6B63" />
          </View>
        )}
        <AdminHeroBox
          title="Approvals"
          showBackButton
          customBackRoute="AdminDashboard"
        />

        <View style={styles.tabContainer}>
          {["event", "volunteer", "organizer"].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.tab, activeTab === type && styles.activeTab]}
              onPress={() => setActiveTab(type as any)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === type && styles.activeTabText,
                ]}
              >
                {type === "event"
                  ? "Events"
                  : type === "volunteer"
                  ? "Volunteers"
                  : "Event Organizers"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.content}>
          {loading ? (
            <Text style={styles.emptyText}>Loading...</Text>
          ) : approvals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No pending approvals</Text>
            </View>
          ) : (
            approvals.map((item) => (
              <Swipeable
                key={item.id}
                renderRightActions={() => renderRightActions(item.id)}
              >
                <TouchableOpacity
                  onPress={() => !actionLoading && handleCardPress(item)}
                  style={styles.approvalCard}
                  disabled={actionLoading}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>
                      {item.title || item.name || "No Title"}
                    </Text>
                  </View>
                  <Text style={styles.cardDesc}>{item.description || ""}</Text>
                  <Text style={styles.cardDetail}>
                    {item.date
                      ? `Date: ${
                          item.date.seconds
                            ? new Date(
                                item.date.seconds * 1000
                              ).toLocaleDateString()
                            : new Date(item.date).toLocaleDateString()
                        }`
                      : ""}
                  </Text>
                  <Text style={styles.cardDetail}>
                    Location: {item.location || "N/A"}
                  </Text>
                  <Text style={styles.cardDetail}>
                    Needs Volunteers: {item.needsVolunteers ? "Yes" : "No"}
                  </Text>
                </TouchableOpacity>
              </Swipeable>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDF6EC" },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#FDF6EC",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#1B6B63",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  content: { flex: 1, paddingTop: 12 },
  approvalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1B6B63",
  },
  timestamp: {
    fontSize: 13,
    color: "#666",
  },
  userName: {
    fontSize: 14,
    color: "#444",
  },
  verticalSwipeActions: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  swipeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginVertical: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  approveBtn: {
    backgroundColor: "#1B6B63",
  },
  denyBtn: {
    backgroundColor: "#C44536",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  cardDesc: {
    fontSize: 14,
    color: "#444",
    marginTop: 4,
    marginBottom: 2,
  },
  cardDetail: {
    fontSize: 13,
    color: "#1B6B63",
    marginTop: 2,
  },
});

export default ApprovalManagementScreen;
