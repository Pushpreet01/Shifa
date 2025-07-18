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

// User type for UI
// (You may want to extend this with more fields as needed)
type User = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  role: 'Support Seeker' | 'Volunteer' | 'Event Organizer' | 'Admin';
  approved: boolean; // Use approved instead of banned
};

const roles: User['role'][] = ['Support Seeker', 'Volunteer', 'Event Organizer', 'Admin'];

const UserManagementScreen = () => {
  const navigation = useNavigation<any>();
  const [activeRole, setActiveRole] = useState<User['role']>('Support Seeker');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // The submitted search
  const isFocused = useIsFocused();

  // Fetch users by role
  const loadUsers = async (role: User['role']) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUsers(role);
      // Commented out: Only include users with all required fields
      // const validUsers = (Array.isArray(data) ? data : []).filter(
      //   (user: any): user is User =>
      //     typeof user.name === 'string' &&
      //     typeof user.email === 'string' &&
      //     typeof user.role === 'string' &&
      //     typeof user.approved === 'boolean'
      // );
      // console.log('Valid users after filtering:', validUsers);
      // setUsers(validUsers);
      // For now, set all fetched users directly (no type guard)
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError('Failed to load users.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(activeRole);
    setSearch('');
    setSearchQuery('');
  }, [activeRole, isFocused]);

  const handleBanUnban = async (user: User) => {
    try {
      setLoading(true);
      // Use approved field: ban = set approved to false, unban = set approved to true
      await banUser(user.id, !user.approved);
      loadUsers(activeRole);
    } catch (err) {
      Alert.alert('Error', 'Failed to update user status.');
    } finally {
      setLoading(false);
    }
  };

  // Only filter users if a search has been submitted
  const filteredUsers = searchQuery.trim()
    ? users.filter((user) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        user.fullName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    })
    : users;

  const handleSearchSubmit = () => {
    setSearchQuery(search.trim());
  };

  return (
    <SafeAreaView style={styles.container}>
      <AdminHeroBox title="Manage Users" showBackButton customBackRoute="AdminDashboard" />

      {/* Search Bar */}
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

      {/* Role Tabs */}
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

      {/* User Cards */}
      <ScrollView contentContainerStyle={styles.content}>
        {loading && (
          <View style={{ alignItems: 'center', marginTop: 30 }}>
            <ActivityIndicator size="large" color="#1B6B63" />
          </View>
        )}
        {error && (
          <Text style={{ color: 'red', textAlign: 'center', marginTop: 20 }}>{error}</Text>
        )}
        {!loading && !error && (
          <Text style={styles.totalText}>Total Registered Users: {filteredUsers.length}</Text>
        )}
        {!loading && !error && filteredUsers.map(user => (
          <View key={user.id} style={styles.userCard}>
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
            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={() => navigation.navigate('UserDetails', { userId: user.id })}
                style={[styles.actionButton, styles.viewBtn]}>
                <Ionicons name="eye-outline" size={18} color="#fff" />
              </TouchableOpacity>
              {/* Edit button can be implemented as needed */}
              {/* <TouchableOpacity
                onPress={() => navigation.navigate('EditUser', { userId: user.id })}
                style={[styles.actionButton, styles.editBtn]}>
                <Ionicons name="create-outline" size={18} color="#fff" />
              </TouchableOpacity> */}
              <TouchableOpacity
                onPress={() => handleBanUnban(user)}
                style={[styles.actionButton, styles.banBtn]}
              >
                <Ionicons name="close-circle-outline" size={18} color="#fff" />
                <Text style={{ color: '#fff', marginLeft: 6, fontSize: 12 }}>
                  {user.approved ? 'Ban' : 'Unban'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF6EC' },
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
