import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AdminHeroBox from "../../components/AdminHeroBox";
import firebaseEventService from "../../services/firebaseEventService";
import { auth } from "../../config/firebaseConfig";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../../navigation/AppNavigator";

const MyEventsScreen: React.FC<NativeStackScreenProps<HomeStackParamList, any>> = ({ navigation }) => {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const currentUser = auth.currentUser;

    useEffect(() => {
        const fetchMyEvents = async () => {
            if (!currentUser) {
                setError("Please log in to view your events.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const myEvents = await firebaseEventService.getEventsByCreator(currentUser.uid);
                const toTime = (value: any): number => {
                    if (!value) return 0;
                    if (value instanceof Date) return value.getTime();
                    if (typeof value?.toDate === "function") return value.toDate().getTime();
                    const t = new Date(value).getTime();
                    return isNaN(t) ? 0 : t;
                };
                const sortedEvents = [...myEvents].sort((a, b) => {
                    const aTime = toTime(a?.createdAt) || toTime(a?.date);
                    const bTime = toTime(b?.createdAt) || toTime(b?.date);
                    return bTime - aTime;
                });
                setEvents(sortedEvents);
            } catch (err) {
                setError("Failed to load your events.");
            } finally {
                setLoading(false);
            }
        };
        fetchMyEvents();
    }, [currentUser]);

    return (
        <SafeAreaView style={styles.container}>
            <AdminHeroBox title="My Events" showBackButton customBackRoute={navigation.canGoBack() ? undefined : "Events"} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {loading ? (
                    <ActivityIndicator size="large" color="#1B6B63" style={styles.loader} />
                ) : error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : events.length === 0 ? (
                    <Text style={styles.noEventsText}>You have not posted any events yet.</Text>
                ) : (
                    events.map((event) => {
                        // Determine status string
                        let status = typeof event.approvalStatus === "string"
                            ? event.approvalStatus
                            : (event.approvalStatus && typeof event.approvalStatus.status === "string")
                                ? event.approvalStatus.status
                                : "UNKNOWN";
                        // Normalize for case-insensitive comparison
                        const statusLower = status.toLowerCase();
                        let borderColor = "#F4A941"; // default
                        if (statusLower === "approved") borderColor = "#1B6B63"; // green
                        else if (statusLower === "rejected") borderColor = "#C44536"; // red
                        else if (statusLower === "pending") borderColor = "#F4A941"; // orange

                        // Get rejection reason if present
                        let rejectionReason = null;
                        if (
                            (typeof event.approvalStatus === "object" && event.approvalStatus?.status === "Rejected" && event.approvalStatus.reason) ||
                            (typeof event.approvalStatus === "string" && event.approvalStatus === "Rejected" && event.reason)
                        ) {
                            rejectionReason = typeof event.approvalStatus === "object" ? event.approvalStatus.reason : event.reason;
                        }

                        return (
                            <View key={event.id} style={[styles.card, { borderLeftColor: borderColor }]}>
                                <Text style={styles.cardTitle}>{event.title}</Text>
                                {event.date && (
                                    <Text style={styles.cardDate}>
                                        Date: {event.date.toLocaleDateString ? event.date.toLocaleDateString() : String(event.date)}
                                    </Text>
                                )}
                                {(event.startTime || event.endTime) && (
                                    <Text style={styles.cardDate}>
                                        Time: {event.startTime || "-"} - {event.endTime || "-"}
                                    </Text>
                                )}
                                {event.location && (
                                    <Text style={styles.cardDate}>Location: {event.location}</Text>
                                )}
                                {event.description && (
                                    <Text style={styles.cardDetails}>Description: {event.description}</Text>
                                )}
                                {statusLower === "rejected" ? (
                                    <Text style={styles.cardStatus}>Rejected: {rejectionReason}</Text>
                                ) : (
                                    <Text style={styles.cardStatus}>Status: {status}</Text>
                                )}
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
        backgroundColor: "#FDF6EC",
    },
    // heroBox, header, backButtonContainer, headerTitle styles removed (now using AdminHeroBox)
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    loader: {
        marginVertical: 20,
    },
    errorText: {
        color: "#C44536",
        textAlign: "center",
        fontSize: 16,
        marginTop: 20,
    },
    noEventsText: {
        textAlign: "center",
        color: "#666",
        marginTop: 20,
        fontSize: 16,
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
    cardDate: {
        color: "#2E2E2E",
        fontSize: 15,
        marginBottom: 8,
    },
    cardDetails: {
        color: "#2E2E2E",
        fontSize: 15,
        marginBottom: 8,
    },
    cardStatus: {
        color: "#2E2E2E",
        fontSize: 15,
        marginBottom: 8,
    },
    rejectionReason: {
        color: "#C44536",
        fontSize: 15,
        marginBottom: 8,
        fontWeight: "bold",
    },
});

export default MyEventsScreen; 