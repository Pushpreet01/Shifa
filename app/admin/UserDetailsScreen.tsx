/**
 * UserDetailsScreen Component
 * 
 * A detailed view of user information for administrators. Provides functionality
 * to view user details, manage user status (ban/unban), and assign roles.
 * 
 * Features:
 * - User profile information display
 * - User status management (ban/unban)
 * - Role assignment navigation
 * - Loading and error states
 * - Special handling for admin users
 * 
 * Navigation Parameters:
 * - userId: ID of the user to display
 * 
 * States:
 * - user: Current user's data
 * - loading: Initial data loading indicator
 * - updating: Status update loading indicator
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import AdminHeroBox from '../../components/AdminHeroBox';
import { fetchUsers, banUser } from '../../services/adminUserService';
import { useIsFocused } from '@react-navigation/native';

/**
 * User Interface Definition
 * Defines the structure of user data displayed in the details view
 */
type User = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  role: 'Support Seeker' | 'Volunteer' | 'Event Organizer' | 'Admin';
  approved: boolean;
};

// Navigation prop types
type Props = NativeStackScreenProps<AdminStackParamList, 'UserDetails'>;

const UserDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { userId } = route.params;
  
  // State Management
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const isFocused = useIsFocused();

  /**
   * Fetches user details from backend
   * Updates on navigation focus to ensure data freshness
   */
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      try {
        // fetchUsers returns an array, so filter by id
        const users = await fetchUsers(); // fetch all approved users
        const found = users.find((u: any) => u.id === userId);
        setUser(found || null);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [userId, isFocused]);

  /**
   * Handles user ban/unban functionality
   * Updates user status and provides feedback
   */
  const handleBanUnban = async () => {
    if (!user) return;
    setUpdating(true);
    try {
      await banUser(user.id, !user.approved);
      setUser({ ...user, approved: !user.approved });
      Alert.alert('Success', `User has been ${user.approved ? 'banned' : 'unbanned'}.`);
    } catch (err) {
      Alert.alert('Error', 'Failed to update user status.');
    } finally {
      setUpdating(false);
    }
  };

  // Loading state display
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FDF6EC' }}>
        <ActivityIndicator size="large" color="#1B6B63" />
      </View>
    );
  }

  // Error state display
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

      {/* User Profile Card */}
      <View style={styles.card}>
        {/* Profile Image */}
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <Image
            source={user.profileImage ? { uri: user.profileImage } : require('../../assets/aiplaceholder.png')}
            style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#E0E0E0' }}
          />
        </View>

        {/* User Information */}
        <Text style={styles.label}>Full Name:</Text>
        <Text style={styles.value}>{user.fullName || 'No Name'}</Text>

        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user.email}</Text>

        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.value}>{user.phone || 'N/A'}</Text>

        <Text style={styles.label}>Role:</Text>
        <Text style={styles.value}>{user.role}</Text>

        {/* Status Section (Non-admin only) */}
        {user.role !== 'Admin' && (
          <>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{user.approved ? 'Active' : 'Banned'}</Text>
          </>
        )}

        {/* Action Buttons (Non-admin only) */}
        <View style={styles.actions}>
          {user.role !== 'Admin' && (
            <>
              <TouchableOpacity
                style={[styles.button, styles.banButton]}
                onPress={handleBanUnban}
                disabled={updating}
              >
                <Text style={styles.buttonText}>{user.approved ? 'Ban' : 'Unban'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.roleButton]}
                onPress={() => navigation.navigate('AssignUserRole', { user })}
              >
                <Text style={styles.buttonText}>Assign Role</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

// Styles: Defines the visual appearance of the user details screen
const styles = StyleSheet.create({
  // Container styles
  container: { 
    flex: 1, 
    backgroundColor: '#FDF6EC', // Warm background color
  },
  
  // Card styles
  card: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },
  
  // Content styles
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1B6B63', // Teal color for consistency
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    marginTop: 4,
    color: '#333',
  },
  
  // Action button styles
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
  editButton: { 
    backgroundColor: '#008080', // Teal color for edit actions
  },
  banButton: { 
    backgroundColor: '#008080', // Teal color for ban actions
  },
  roleButton: { 
    backgroundColor: '#008080', // Teal color for role actions
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold',
  },
});

export default UserDetailsScreen;
