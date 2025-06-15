// app/admin/UserDetailsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import AdminHeroBox from '../../components/AdminHeroBox';

type Props = NativeStackScreenProps<AdminStackParamList, 'UserDetails'>;

const UserDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { userId } = route.params;

  // Replace this with your actual user fetching logic (API call, context, etc.)
  // For demonstration, here's a placeholder user object:
  const user = {
    id: userId,
    name: 'Loading...',
    email: 'Loading...',
    role: 'Loading...',
    isBanned: false,
  };

  // TODO: Replace the above with actual data fetching logic, e.g. useEffect + useState

  return (
    <ScrollView style={styles.container}>
      <AdminHeroBox
        title="User Details"
        showBackButton
        customBackRoute="UserManagement"
      />

      <View style={styles.card}>
        <Text style={styles.label}>Full Name:</Text>
        <Text style={styles.value}>{user.name}</Text>

        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user.email}</Text>

        <Text style={styles.label}>Role:</Text>
        <Text style={styles.value}>{user.role}</Text>

        <Text style={styles.label}>Status:</Text>
        <Text style={styles.value}>{user.isBanned ? 'Banned' : 'Active'}</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() => console.log('Edit')}
          >
            <Text style={styles.buttonText}>Edit Info</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.banButton]}
            onPress={() => console.log(user.isBanned ? 'Unban' : 'Ban')}
          >
            <Text style={styles.buttonText}>{user.isBanned ? 'Unban' : 'Ban'}</Text>
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
  editButton: { backgroundColor: '#1E88E5' },
  banButton: { backgroundColor: '#D32F2F' },
  roleButton: { backgroundColor: '#6A1B9A' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default UserDetailsScreen;
