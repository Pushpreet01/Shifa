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
  TextInput,
  Modal,
  Image,
} from "react-native";
import {
  Swipeable,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import AdminHeroBox from "../../components/AdminHeroBox";
import { useNavigation } from "@react-navigation/native";
import { fetchApprovals, approveItem, denyItem, ApprovalType, ApprovalItem } from "../../services/adminApprovalService";

const ApprovalManagementScreen = () => {
  const [activeTab, setActiveTab] = useState<ApprovalType>("event");
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const navigation = useNavigation<any>();
  const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [pendingDenyId, setPendingDenyId] = useState<string | null>(null);

  // Fetch pending approvals using the service
  useEffect(() => {
    const loadApprovals = async () => {
      setLoading(true);
      try {
        const approvalsData = await fetchApprovals(activeTab);
        setApprovals(approvalsData);
      } catch (error) {
        console.error(`[ApprovalManagement] Error loading ${activeTab} approvals:`, error);
        Alert.alert("Error", "Failed to load approvals. Please try again.");
        setApprovals([]);
      } finally {
        setLoading(false);
      }
    };

    loadApprovals();
  }, [activeTab]);

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      await approveItem(id, activeTab);
      setApprovals(approvals.filter((item) => item.id !== id));
      Alert.alert("Approved", "User has been approved.");
    } catch (error) {
      console.error("Error approving item:", error);
      Alert.alert("Error", "Failed to approve user.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeny = (id: string) => {
    setPendingDenyId(id);
    setRejectionReason("");
    setRejectionModalVisible(true);
  };

  const confirmDeny = async () => {
    if (!pendingDenyId) return;
    setActionLoading(true);
    try {
      await denyItem(pendingDenyId, activeTab, rejectionReason);
      setApprovals(approvals.filter((item) => item.id !== pendingDenyId));
      setRejectionModalVisible(false);
      setPendingDenyId(null);
      setRejectionReason("");
      Alert.alert("Denied", "User has been denied.");
    } catch (error) {
      console.error("Error denying item:", error);
      Alert.alert("Error", "Failed to deny user.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCardPress = (item: ApprovalItem) => {
    navigation.navigate("ApprovalDetails", {
      id: item.id,
      type: activeTab, // 'event', 'volunteer', or 'organizer'
      userData: activeTab !== "event" ? item : undefined, // Pass user data for non-event items
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
                <TouchableOpacity onPress={confirmDeny} style={{ backgroundColor: "#C44536", padding: 8, borderRadius: 6 }}>
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
              onPress={() => setActiveTab(type as ApprovalType)}
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
                  {activeTab === "event" ? (
                    <>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>
                          {item.title || item.name || "No Title"}
                        </Text>
                      </View>
                      <Text style={styles.cardDesc}>{item.description || ""}</Text>
                      <Text style={styles.cardDetail}>
                        {item.date
                          ? `Date: ${item.date.seconds
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
                    </>
                  ) : (
                    <View style={styles.userCardLayout}>
                      <View style={styles.profileImageContainer}>
                        <Image
                          source={item.profileImage ? { uri: item.profileImage } : require('../../assets/aiplaceholder.png')}
                          style={styles.profileImage}
                          resizeMode="cover"
                        />
                      </View>
                      <View style={styles.userDetailsContainer}>
                        <Text style={styles.cardTitle}>
                          {item.fullName || item.displayName || "No Name"}
                        </Text>
                        <Text style={styles.cardDesc}>
                          Role: {item.role || "Unknown"}
                        </Text>
                        <Text style={styles.cardDetail}>
                          Email: {item.email || "N/A"}
                        </Text>
                        <Text style={styles.cardDetail}>
                          Phone: {item.phone || "N/A"}
                        </Text>
                        <Text style={styles.cardDetail}>
                          Registration Date: {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString()
                            : "N/A"
                          }
                        </Text>
                      </View>
                    </View>
                  )}
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
  borderLeftWidth: 4,
  borderLeftColor: "#F4A941", 
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
  userCardLayout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  profileImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
    backgroundColor: '#eee',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  userDetailsContainer: {
    flex: 1,
  },
});

export default ApprovalManagementScreen;
