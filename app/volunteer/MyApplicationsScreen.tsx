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
import FirebaseVolunteerApplicationService from "../../services/FirebaseVolunteerApplicationService";
import FirebaseOpportunityService from "../../services/FirebaseOpportunityService";
import { auth } from "../../config/firebaseConfig";
import { VolunteerApplication, VolunteerOpportunity } from "../../types/volunteer";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../../navigation/AppNavigator";

const MyApplicationsScreen: React.FC<NativeStackScreenProps<HomeStackParamList, any>> = ({ navigation }) => {
    const [applications, setApplications] = useState<VolunteerApplication[]>([]);
    const [opportunityMap, setOpportunityMap] = useState<{ [id: string]: VolunteerOpportunity | null }>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const currentUser = auth.currentUser;

    useEffect(() => {
        const fetchApplicationsAndOpportunities = async () => {
            if (!currentUser) {
                setError("Please log in to view your applications.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const apps = await FirebaseVolunteerApplicationService.getApplicationsByUser(currentUser.uid);
                setApplications(apps);
                // Fetch all related opportunities
                const oppMap: { [id: string]: VolunteerOpportunity | null } = {};
                for (const app of apps) {
                    if (!oppMap[app.opportunityId]) {
                        try {
                            const opp = await FirebaseOpportunityService.getOpportunity(app.opportunityId);
                            oppMap[app.opportunityId] = opp;
                        } catch {
                            oppMap[app.opportunityId] = null;
                        }
                    }
                }
                setOpportunityMap(oppMap);
            } catch (err) {
                setError("Failed to load your applications.");
            } finally {
                setLoading(false);
            }
        };
        fetchApplicationsAndOpportunities();
    }, [currentUser]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.heroBox}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonContainer}>
                        <Ionicons name="chevron-back-outline" size={24} color="#1B6B63" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Applications</Text>
                </View>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {loading ? (
                    <ActivityIndicator size="large" color="#1B6B63" style={styles.loader} />
                ) : error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : applications.length === 0 ? (
                    <Text style={styles.noAppsText}>You have not applied for any opportunities yet.</Text>
                ) : (
                    applications.map((app) => {
                        const opp = opportunityMap[app.opportunityId];
                        let borderColor = '#F4A941';
                        if (app.status === 'Selected') borderColor = '#1B6B63';
                        else if (app.status === 'Not Selected') borderColor = '#C44536';
                        return (
                            <View key={app.applicationId} style={[styles.card, { borderLeftColor: borderColor }]}>
                                <Text style={styles.cardTitle}>{opp ? opp.title : "(Opportunity deleted)"}</Text>
                                <Text style={styles.cardStatus}>Status: {app.status.toUpperCase()}</Text>
                                <TouchableOpacity
                                    style={styles.detailsButton}
                                    onPress={() => {
                                        if (opp) {
                                            navigation.navigate("OpportunityDetails", {
                                                title: opp.title,
                                                timing: opp.timings,
                                                eventId: opp.eventId,
                                                opportunityId: opp.opportunityId,
                                                description: opp.description,
                                                date: opp.createdAt instanceof Date
                                                    ? opp.createdAt.toDateString()
                                                    : typeof opp.createdAt?.toDate === "function"
                                                        ? opp.createdAt.toDate().toDateString()
                                                        : undefined,
                                                location: opp.location,
                                            });
                                        }
                                    }}
                                    disabled={!opp}
                                >
                                    <Text style={styles.detailsButtonText}>{opp ? "View Details" : "No Details"}</Text>
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
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
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
    noAppsText: {
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
    cardStatus: {
        color: "#2E2E2E",
        fontSize: 15,
        marginBottom: 8,
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
});

export default MyApplicationsScreen; 