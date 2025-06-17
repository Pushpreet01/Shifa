import React from 'react';
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

const groupByRole = (users: User[]) => {
  const grouped: { [key: string]: User[] } = {};
  users.forEach(user => {
    if (!grouped[user.role]) grouped[user.role] = [];
    grouped[user.role].push(user);
  });
  return grouped;
};

const UserManagementScreen = () => {
  const navigation = useNavigation<any>();
  const groupedUsers = groupByRole(mockUsers);
  const totalUsers = mockUsers.length;

  return (
    <SafeAreaView style={styles.container}>
      <AdminHeroBox title="Manage Users" showBackButton customBackRoute="AdminDashboard" />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.totalText}>Total Registered Users: {totalUsers}</Text>

        {Object.keys(groupedUsers).map(role => (
          <View key={role} style={styles.roleSection}>
            <Text style={styles.roleTitle}>{role}</Text>
            {groupedUsers[role].map(user => (
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
                    onPress={() => console.log(user.banned ? 'Unban' : 'Ban', user.id)}
                    style={[styles.actionButton, styles.banBtn]}>
                    <Ionicons name={user.banned ? 'checkmark-circle-outline' : 'close-circle-outline'} size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 60 },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1B6B63',
  },
  roleSection: { marginBottom: 24 },
  roleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B6B63',
    marginBottom: 12,
  },
  userCard: {
    backgroundColor: '#FDF6EC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
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
