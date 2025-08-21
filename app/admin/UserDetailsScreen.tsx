// app/admin/UserDetailsScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import AdminHeroBox from '../../components/AdminHeroBox';
import { banUser } from '../../services/adminUserService';
import { useIsFocused } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

// User type for UI
// (should match the type in UserManagementScreen)
type User = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  role: 'Support Seeker' | 'Volunteer' | 'Event Organizer' | 'Admin';
  approvalStatus: { status: 'Approved' | 'Pending' | 'Rejected'; reason?: string };
};

type Props = NativeStackScreenProps<AdminStackParamList, 'UserDetails'>;

const UserDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { userId } = route.params;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const isFocused = useIsFocused();

  // Fetch user by userId
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      try {
        // Get the specific user document directly
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            id: userDoc.id,
            fullName: userData.fullName || '',
            email: userData.email || '',
            phone: userData.phoneNumber || '',
            profileImage: userData.profileImage || '',
            role: userData.role || 'Support Seeker',
            approvalStatus: userData.approvalStatus || { status: 'Pending' }
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error loading user:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [userId, isFocused]);

  const handleBanUnban = async () => {
    if (!user) return;
    setUpdating(true);
    try {
      await banUser(user.id, user.approvalStatus.status !== 'Approved');
      setUser({
        ...user,
        approvalStatus: {
          status: user.approvalStatus.status === 'Approved' ? 'Rejected' : 'Approved',
          reason: user.approvalStatus.status === 'Approved' ? 'Banned by admin.' : undefined
        }
      });
      Alert.alert('Success', `User has been ${user.approvalStatus.status === 'Approved' ? 'banned' : 'unbanned'}.`);
    } catch (err) {
      Alert.alert('Error', 'Failed to update user status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FDF6EC' }}>
        <ActivityIndicator size="large" color="#1B6B63" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FDF6EC' }}>
        <Text style={{ color: '#C44536', fontSize: 18 }}>User not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <AdminHeroBox
        title="User Details"
        showBackButton
        customBackRoute="UserManagement"
      />

      <View style={styles.card}>
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <Image
            source={user.profileImage ? { uri: user.profileImage } : require('../../assets/aiplaceholder.png')}
            style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#E0E0E0' }}
          />
        </View>
        <Text style={styles.label}>Full Name:</Text>
        <Text style={styles.value}>{user.fullName || 'No Name'}</Text>

        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user.email}</Text>

        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.value}>{user.phone || 'N/A'}</Text>

        <Text style={styles.label}>Role:</Text>
        <Text style={styles.value}>{user.role}</Text>

        {/* Only show Status for non-admin users */}
        {user.role !== 'Admin' && (
          <>
            <Text style={styles.label}>Status:</Text>
            {user.approvalStatus.status === 'Approved' && (
              <Text style={styles.statusApproved}>Active</Text>
            )}
            {user.approvalStatus.status === 'Pending' && (
              <Text style={styles.statusPending}>Pending Approval</Text>
            )}
            {user.approvalStatus.status === 'Rejected' && (
              <View>
                <Text style={styles.statusRejected}>
                  {user.approvalStatus.reason === 'Banned by admin.' ? 'Banned' : 'Rejected'}
                </Text>
                {user.approvalStatus.reason && user.approvalStatus.reason !== 'Banned by admin.' && (
                  <Text style={styles.rejectionReason}>Reason: {user.approvalStatus.reason}</Text>
                )}
              </View>
            )}
          </>
        )}

        <View style={styles.actions}>
          {/* Only show Ban/Unban for non-admin users who are not pending */}
          {user.role !== 'Admin' && user.approvalStatus.status !== 'Pending' && (
            <TouchableOpacity
              style={[styles.button, styles.banButton]}
              onPress={handleBanUnban}
              disabled={updating}
            >
              <Text style={styles.buttonText}>{user.approvalStatus.status === 'Approved' ? 'Ban' : 'Unban'}</Text>
            </TouchableOpacity>
          )}

          {/* Only show Assign Role for non-admin users who are not pending */}
          {user.role !== 'Admin' && user.approvalStatus.status !== 'Pending' && (
            <TouchableOpacity
              style={[styles.button, styles.roleButton]}
              onPress={() => navigation.navigate('AssignUserRole', {
                user: {
                  ...user,
                  name: user.fullName // Add the name property expected by UserType
                }
              })}
            >
              <Text style={styles.buttonText}>Assign Role</Text>
            </TouchableOpacity>
          )}

          {/* Disabled buttons for pending users */}
          {user.role !== 'Admin' && user.approvalStatus.status === 'Pending' && (
            <View style={[styles.button, styles.disabledButton]}>
              <Text style={styles.disabledButtonText}>Pending Approval - Actions Disabled</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF6EC' },
  card: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1B6B63',
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    marginTop: 4,
    color: '#333',
  },
  actions: {
    marginTop: 20,
    flexDirection: 'column',
    gap: 12,
  },
  button: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  editButton: { backgroundColor: '#008080' },
  banButton: { backgroundColor: '#008080' },
  roleButton: { backgroundColor: '#008080' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  statusApproved: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: '600',
    marginTop: 4,
  },
  statusPending: {
    fontSize: 16,
    color: '#ffc107',
    fontWeight: '600',
    marginTop: 4,
  },
  statusRejected: {
    fontSize: 16,
    color: '#dc3545',
    fontWeight: '600',
    marginTop: 4,
  },
  rejectionReason: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
    marginTop: 4,
  },
  disabledButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  disabledButtonText: {
    color: '#6c757d',
    fontWeight: 'bold',
  },
});

export default UserDetailsScreen;
