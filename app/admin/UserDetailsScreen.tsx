// app/admin/UserDetailsScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import AdminHeroBox from '../../components/AdminHeroBox';
import { fetchUsers, banUser } from '../../services/adminUserService';
import { useIsFocused } from '@react-navigation/native';

// User type for UI
// (should match the type in UserManagementScreen)
type User = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  role: 'Support Seeker' | 'Volunteer' | 'Event Organizer' | 'Admin';
  approved: boolean;
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

        <Text style={styles.label}>Status:</Text>
        <Text style={styles.value}>{user.approved ? 'Active' : 'Banned'}</Text>

        <View style={styles.actions}>
          {/* Edit Info button can be implemented as needed */}
          {/* <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() => navigation.navigate('EditUser', { userId: user.id })}
          >
            <Text style={styles.buttonText}>Edit Info</Text>
          </TouchableOpacity> */}
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
});

export default UserDetailsScreen;
