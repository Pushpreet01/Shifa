import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
    Image,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllFeedbacks, FeedbackWithUserInfo } from '../../services/feedbackService';
import AdminHeroBox from '../../components/AdminHeroBox';

const AdminFeedbackScreen: React.FC = () => {
    const [feedbacks, setFeedbacks] = useState<FeedbackWithUserInfo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const feedbacksData = await getAllFeedbacks();
            setFeedbacks(feedbacksData);
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
            Alert.alert('Error', 'Failed to load feedbacks');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return '#ffc107';
            case 'reviewed':
                return '#17a2b8';
            case 'resolved':
                return '#28a745';
            default:
                return '#6c757d';
        }
    };

    const getUserStatusColor = (status: string | undefined) => {
        switch (status) {
            case 'Approved':
                return '#28a745'; // Green
            case 'Pending':
                return '#ffc107'; // Yellow
            case 'Rejected':
                return '#dc3545'; // Red
            case 'Banned':
                return '#dc3545'; // Red
            default:
                return '#6c757d'; // Gray
        }
    };

    const getUserStatusText = (status: string | undefined) => {
        switch (status) {
            case 'Approved':
                return 'Active';
            case 'Pending':
                return 'Pending Approval';
            case 'Rejected':
                return 'Rejected';
            case 'Banned':
                return 'Banned';
            default:
                return 'Unknown';
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'Unknown date';

        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1B6B63" />
                <Text style={styles.loadingText}>Loading feedbacks...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <AdminHeroBox title="User Feedbacks" showBackButton />

            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
                {feedbacks.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="chatbubble-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No feedbacks found</Text>
                        <Text style={styles.emptySubtext}>Users haven't submitted any feedback yet</Text>
                    </View>
                ) : (
                    feedbacks.map((feedback) => (
                        <View key={feedback.id} style={styles.feedbackCard}>
                            {/* User Info Section */}
                            <View style={styles.userSection}>
                                <View style={styles.userImageContainer}>
                                    {feedback.userInfo?.profileImage ? (
                                        <Image
                                            source={{ uri: feedback.userInfo.profileImage }}
                                            style={styles.userImage}
                                        />
                                    ) : (
                                        <View style={styles.userImagePlaceholder}>
                                            <Ionicons name="person" size={24} color="#fff" />
                                        </View>
                                    )}
                                </View>

                                <View style={styles.userInfo}>
                                    <Text style={styles.userName}>
                                        {feedback.userInfo?.fullName || 'Unknown User'}
                                    </Text>
                                    <Text style={styles.userEmail}>
                                        {feedback.userInfo?.email || 'No email'}
                                    </Text>
                                    <Text style={styles.userPhone}>
                                        {feedback.userInfo?.phoneNumber || 'No phone'}
                                    </Text>
                                    <View style={styles.userRoleContainer}>
                                        <Text style={styles.userRole}>
                                            {feedback.userInfo?.role || 'Unknown'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={[styles.statusBadge, { backgroundColor: getUserStatusColor(feedback.userInfo?.approvalStatus?.status) }]}>
                                    <Text style={styles.statusText}>
                                        {getUserStatusText(feedback.userInfo?.approvalStatus?.status)}
                                    </Text>
                                </View>
                            </View>

                            {/* Rating */}
                            <View style={styles.ratingSection}>
                                <Text style={styles.ratingLabel}>Rating:</Text>
                                <View style={styles.ratingContainer}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Ionicons
                                            key={star}
                                            name={star <= feedback.rating ? "star" : "star-outline"}
                                            size={16}
                                            color={star <= feedback.rating ? "#FFD700" : "#ccc"}
                                        />
                                    ))}
                                    <Text style={styles.ratingText}>{feedback.rating}/5</Text>
                                </View>
                            </View>

                            {/* Feedback Message */}
                            <View style={styles.messageSection}>
                                <Text style={styles.messageLabel}>Feedback:</Text>
                                <Text style={styles.messageText}>{feedback.comment}</Text>
                            </View>

                            {/* Timestamp */}
                            <View style={styles.timestampSection}>
                                <Ionicons name="time-outline" size={16} color="#666" />
                                <Text style={styles.timestampText}>
                                    {formatDate(feedback.timestamp)}
                                </Text>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDF6EC',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FDF6EC',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    scrollContainer: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 100,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
    },
    feedbackCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    userSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    userImageContainer: {
        marginRight: 12,
    },
    userImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#1B6B63',
    },
    userImagePlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#1B6B63',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2E2E2E',
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    userPhone: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    userRoleContainer: {
        alignSelf: 'flex-start',
    },
    userRole: {
        fontSize: 12,
        fontWeight: '500',
        color: '#1B6B63',
        backgroundColor: 'rgba(27, 107, 99, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    ratingSection: {
        marginBottom: 12,
    },
    ratingLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1B6B63',
        marginBottom: 6,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    messageSection: {
        marginBottom: 12,
    },
    messageLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1B6B63',
        marginBottom: 6,
    },
    messageText: {
        fontSize: 15,
        color: '#2E2E2E',
        lineHeight: 22,
    },
    timestampSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    timestampText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
});

export default AdminFeedbackScreen;
