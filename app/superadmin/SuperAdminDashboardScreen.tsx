import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { SuperAdminStackParamList } from "../../types/navigation";
import { useNavigation } from "@react-navigation/native";
import { getAllAdmins, deleteAdminUser } from "../../services/firebaseUserService";
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

type NavigationProp = StackNavigationProp<SuperAdminStackParamList, "SuperAdminDashboard">;

const SuperAdminDashboardScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { signOut } = useAuth();
    const [admins, setAdmins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAdmins = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getAllAdmins();
                console.log("Fetched admins:", data); // Debug log
                setAdmins(data);
            } catch (err) {
                console.error("Error in fetchAdmins:", err); // Debug log
                setError("Failed to load admins");
            } finally {
                setLoading(false);
            }
        };
        fetchAdmins();
    }, []);

    const handleCreateAdmin = () => {
        navigation.navigate("CreateAdmin");
    };

    const handleApprovals = () => {
        // Placeholder: navigate to approvals screen or show alert
        alert("Show pending admin approvals (to be implemented)");
    };

    const handleEditAdmin = (adminId: string) => {
        navigation.navigate("EditAdmin", { adminId });
    };

    const handleDeleteAdmin = (adminId: string) => {
        Alert.alert(
            'Delete Admin',
            'Are you sure you want to delete this admin?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteAdminUser(adminId);
                            // Refresh the list
                            const data = await getAllAdmins();
                            setAdmins(data);
                        } catch (err) {
                            Alert.alert('Error', 'Failed to delete admin');
                        }
                    },
                },
            ]
        );
    };

    const renderAdmin = ({ item }: { item: any }) => (
        <View style={styles.adminCard}>
            <Text style={styles.adminName}>{item.name || item.fullName || item.email}</Text>
            <Text style={styles.adminEmail}>{item.email}</Text>
            <TouchableOpacity style={styles.trashIconRight} onPress={() => handleDeleteAdmin(item.id)}>
                <Ionicons name="trash" size={24} color="#C44536" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Super Admin Dashboard</Text>
            <View style={styles.topButtonRow}>
                <TouchableOpacity style={styles.createButton} onPress={handleCreateAdmin}>
                    <Text style={styles.createButtonText}>Create New Admin</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.approvalsButton} onPress={handleApprovals}>
                    <Text style={styles.approvalsButtonText}>Approvals</Text>
                </TouchableOpacity>
            </View>
            {loading ? (
                <ActivityIndicator size="large" color="#1B6B63" style={{ marginTop: 40 }} />
            ) : error ? (
                <Text style={{ color: 'red', marginTop: 40 }}>{error}</Text>
            ) : (
                <FlatList
                    data={admins}
                    keyExtractor={(item) => item.id}
                    renderItem={renderAdmin}
                    contentContainerStyle={styles.list}
                />
            )}
            <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
                <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    topButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    approvalsButton: {
        backgroundColor: '#1B6B63',
        padding: 12,
        borderRadius: 8,
        marginLeft: 10,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    approvalsButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    createButton: {
        backgroundColor: '#1B6B63',
        padding: 12,
        borderRadius: 8,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    createButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    list: { paddingBottom: 40 },
    adminCard: { backgroundColor: '#F4F4F4', padding: 16, borderRadius: 8, marginBottom: 16 },
    adminName: { fontSize: 18, fontWeight: 'bold' },
    adminEmail: { fontSize: 14, color: '#666', marginBottom: 8 },
    actions: { flexDirection: 'row' },
    actionButton: { marginRight: 16 },
    actionText: { color: '#C44536', fontWeight: 'bold' },
    trashIconRight: {
        position: 'absolute',
        right: 16,
        top: 24,
    },
    signOutButton: {
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: 30,
        backgroundColor: '#C44536',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 2,
    },
    signOutButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
});

export default SuperAdminDashboardScreen; 