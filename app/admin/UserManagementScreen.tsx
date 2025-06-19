import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AdminHeroBox from '../../components/AdminHeroBox';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'Support Seeker' | 'Volunteer' | 'Event Organizer' | 'Admin';
  banned: boolean;
};

const mockUsers: User[] = [
  { id: '1', name: 'Ayesha Khan', email: 'ayesha@example.com', role: 'Support Seeker', banned: false },
  { id: '2', name: 'John Doe', email: 'john@example.com', role: 'Volunteer', banned: false },
  { id: '3', name: 'Meera Patel', email: 'meera@example.com', role: 'Event Organizer', banned: true },
  { id: '4', name: 'Hemant Gupta', email: 'hemant@example.com', role: 'Admin', banned: false },
];

const roles: User['role'][] = ['Support Seeker', 'Volunteer', 'Event Organizer', 'Admin'];

const UserManagementScreen = () => {
  const navigation = useNavigation<any>();
  const [activeRole, setActiveRole] = useState<User['role']>('Support Seeker');

  const filteredUsers = mockUsers.filter(user => user.role === activeRole);
  const totalUsers = mockUsers.length;

  return (
    <SafeAreaView style={styles.container}>
      <AdminHeroBox title="Manage Users" showBackButton customBackRoute="AdminDashboard" />

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
        <Text style={styles.totalText}>Total Registered Users: {totalUsers}</Text>

        {filteredUsers.map(user => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={() => navigation.navigate('UserDetails', { userId: user.id })}
                style={[styles.actionButton, styles.viewBtn]}>
                <Ionicons name="eye-outline" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => console.log('Edit:', user.id)}
                style={[styles.actionButton, styles.editBtn]}>
                <Ionicons name="create-outline" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => console.log('Ban/Unban:', user.id)}
                style={[styles.actionButton, styles.banBtn]}>
                <Ionicons name="close-circle-outline" size={18} color="#fff" />
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
    paddingBottom: 60,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1B6B63',
  },
  userCard: {
    backgroundColor: '#FDF6EC',
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
  userInfo: { marginBottom: 10 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  userEmail: { fontSize: 14, color: '#777' },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  viewBtn: { backgroundColor: '#008080' },
  editBtn: { backgroundColor: '#008080' },
  banBtn: { backgroundColor: '#008080' },
});

export default UserManagementScreen;
