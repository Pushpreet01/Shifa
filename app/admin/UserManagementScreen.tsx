/**
 * UserManagementScreen Component
 * 
 * A comprehensive interface for administrators to manage users across different roles.
 * Provides functionality for viewing, searching, and managing user accounts including
 * banning/unbanning users and viewing detailed user information.
 * 
 * Features:
 * - Role-based user filtering
 * - Real-time search functionality
 * - User status management (ban/unban)
 * - Detailed user information display
 * - Responsive design with loading states
 * 
 * States:
 * - activeRole: Currently selected user role filter
 * - users: Array of user data
 * - loading: Loading state indicator
 * - error: Error state message
 * - search: Current search input value
 * - searchQuery: Submitted search query
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AdminHeroBox from '../../components/AdminHeroBox';
import {
  fetchUsers,
  banUser,
} from '../../services/adminUserService';
import { useIsFocused } from '@react-navigation/native';

/**
 * User Interface Definition
 * Defines the structure of user data displayed in the management interface
 */
type User = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  role: 'Support Seeker' | 'Volunteer' | 'Event Organizer' | 'Admin';
  approvalStatus: { status: 'Approved' | 'Pending' | 'Rejected'; reason?: string };
};

// Available user roles for filtering
const roles: User['role'][] = ['Support Seeker', 'Volunteer', 'Event Organizer', 'Admin'];

const UserManagementScreen = () => {
  // Navigation and screen focus hooks
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  // State management
  const [activeRole, setActiveRole] = useState<User['role']>('Support Seeker');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // Committed search query

  /**
   * Fetches users based on selected role
   * Includes validation of user data and error handling
   */
  const loadUsers = async (role: User['role']) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUsers(role);
      // Validate user data to ensure all required fields are present
      const validUsers = (Array.isArray(data) ? data : []).filter(
        (user: any): user is User =>
          typeof user.fullName === 'string' &&
          typeof user.email === 'string' &&
          typeof user.role === 'string' &&
          typeof user.approvalStatus === 'object' &&
          typeof user.approvalStatus.status === 'string'
      );
      setUsers(validUsers);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError('Failed to load users.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Load users when role changes or screen is focused
  useEffect(() => {
    loadUsers(activeRole);
    setSearch('');
    setSearchQuery('');
  }, [activeRole, isFocused]);

  /**
   * Handles user ban/unban functionality
   * Updates user status and refreshes user list
   */
  const handleBanUnban = async (user: User) => {
    try {
      setLoading(true);
      await banUser(user.id, user.approvalStatus.status !== 'Approved');
      loadUsers(activeRole);
    } catch (err) {
      Alert.alert('Error', 'Failed to update user status.');
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search query
  const filteredUsers = searchQuery.trim()
    ? users.filter((user) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        user.fullName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    })
    : users;

  // Commit search query when user submits
  const handleSearchSubmit = () => {
    setSearchQuery(search.trim());
  };

  return (
    <SafeAreaView style={styles.container}>
      <AdminHeroBox title="Manage Users" showBackButton customBackRoute="AdminDashboard" />

      {/* Search Bar Section: Allows filtering users by name or email */}
      <View style={styles.searchBarWrapper}>
        <Ionicons name="search-outline" size={20} color="#1B6B63" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchBar}
          placeholder="Search by name or email"
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearchSubmit}>
          <Ionicons name="arrow-forward-circle" size={24} color="#1B6B63" />
        </TouchableOpacity>
      </View>

      {/* Role Selection Tabs: Horizontal scrollable role filters */}
      <View style={styles.tabWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {roles.map((role) => (
            <TouchableOpacity
              key={role}
              style={[styles.tab, activeRole === role && styles.activeTab]}
              onPress={() => setActiveRole(role)}
            >
              <Text style={[styles.tabText, activeRole === role && styles.activeTabText]}>
                {role}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* User List Section: Displays filtered user cards */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* Loading State */}
        {loading && (
          <View style={{ alignItems: 'center', marginTop: 30 }}>
            <ActivityIndicator size="large" color="#1B6B63" />
          </View>
        )}
        {/* Error State */}
        {error && (
          <Text style={{ color: 'red', textAlign: 'center', marginTop: 20 }}>{error}</Text>
        )}
        {/* User Count */}
        {!loading && !error && (
          <Text style={styles.totalText}>Total Registered Users: {filteredUsers.length}</Text>
        )}
        {/* User Cards */}
        {!loading && !error && filteredUsers.map(user => (
          <View key={user.id} style={styles.userCard}>
            {/* User Information Display */}
            <View style={styles.userInfoRow}>
              <Image
                source={user.profileImage ? { uri: user.profileImage } : require('../../assets/aiplaceholder.png')}
                style={styles.profileImage}
              />
              <View style={styles.userInfoText}>
                <Text style={styles.userName}>{user.fullName || 'No Name'}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                {user.phone && <Text style={styles.userPhone}>{user.phone}</Text>}
              </View>
            </View>
            {/* User Action Buttons */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={() => navigation.navigate('UserDetails', { userId: user.id })}
                style={[styles.actionButton, styles.viewBtn]}>
                <Ionicons name="eye-outline" size={18} color="#fff" />
              </TouchableOpacity>
              {/* Ban/Unban Actions (Non-admin users only) */}
              {user.role !== 'Admin' && (
                <>
                  <TouchableOpacity
                    onPress={() => handleBanUnban(user)}
                    style={[styles.actionButton, styles.banBtn]}
                  >
                    <Ionicons name="close-circle-outline" size={18} color="#fff" />
                    <Text style={{ color: '#fff', marginLeft: 6, fontSize: 12 }}>
                      {user.approvalStatus.status === 'Approved' ? 'Ban' : 'Unban'}
                    </Text>
                  </TouchableOpacity>
                  {/* Rejection Reason Display */}
                  {user.approvalStatus.status === 'Rejected' && user.approvalStatus.reason && (
                    <Text style={{ color: '#C44536', fontSize: 12, marginTop: 4 }}>
                      Rejected: {user.approvalStatus.reason}
                    </Text>
                  )}
                </>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles: Defines the visual appearance of the user management interface
const styles = StyleSheet.create({
  // Container and layout styles
  container: { 
    flex: 1, 
    backgroundColor: '#FDF6EC',
  },
  
  // Search bar styles
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    color: '#1B6B63',
    paddingVertical: 4,
  },
  searchButton: {
    marginLeft: 6,
    padding: 2,
    borderRadius: 12,
  },
  tabWrapper: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: '#F1F1F1',
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: '#1B6B63',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1B6B63',
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#E5A54E',
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#E0E0E0',
    marginRight: 16,
  },
  userInfoText: {
    flex: 1,
  },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  userEmail: { fontSize: 14, color: '#777', marginTop: 2 },
  userPhone: { fontSize: 13, color: '#1B6B63', marginTop: 2 },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewBtn: { backgroundColor: '#008080' },
  editBtn: { backgroundColor: '#008080' },
  banBtn: { backgroundColor: '#008080' },
});

export default UserManagementScreen;
