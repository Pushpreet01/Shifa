import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import AdminHeroBox from '../../components/AdminHeroBox';
import { banUser } from '../../services/adminUserService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

type AssignUserRoleRouteProp = RouteProp<AdminStackParamList, 'AssignUserRole'>;

const roles = ['Support Seeker', 'Volunteer', 'Event Organizer', 'Admin'];

const AssignUserRoleScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<AssignUserRoleRouteProp>();
  const user = route.params?.user;

  const [selectedRole, setSelectedRole] = useState(user?.role || '');
  const [loading, setLoading] = useState(false);

  const handleAssignRole = async () => {
    if (!selectedRole || !user) return;
    setLoading(true);
    try {
      // Update the user's role in Firestore
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { role: selectedRole });
      Alert.alert('Success', `Role assigned: ${selectedRole}`);
      navigation.navigate('UserDetails', { userID: user.id });
    } catch (err) {
      Alert.alert('Error', 'Failed to assign role.');
    } finally {
      setLoading(false);
    }
  };

  // Custom back handler
  const handleBackPress = () => {
    if (user) {
      navigation.navigate('UserDetails', { userID: user.id });
    } else {
      navigation.goBack();
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <AdminHeroBox
          title="Assign Role"
          showBackButton
          customBackRoute="UserDetails"
        />
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>User data not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AdminHeroBox
        title="Assign Role"
        showBackButton
        customBackRoute="UserDetails"
        onBackPress={handleBackPress}
      />
      <View style={styles.inner}>
        <Text style={styles.label}>Select Role for {user.fullName || 'No Name'}:</Text>
        {roles.map((role) => (
          <TouchableOpacity
            key={role}
            style={[
              styles.roleButton,
              selectedRole === role && styles.selectedButton,
            ]}
            onPress={() => setSelectedRole(role)}
            disabled={loading}
          >
            <Text
              style={[
                styles.roleText,
                selectedRole === role && styles.selectedText,
              ]}
            >
              {role}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.assignButton} onPress={handleAssignRole} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.assignText}>Assign Role</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF6EC',
  },
  inner: {
    padding: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1B6B63',
  },
  roleButton: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#E0F2F1',
    marginBottom: 12,
  },
  selectedButton: {
    backgroundColor: '#1B6B63',
  },
  roleText: {
    color: '#1B6B63',
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedText: {
    color: '#FFF',
  },
  assignButton: {
    marginTop: 20,
    backgroundColor: '#1B6B63',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  assignText: {
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorBox: {
    marginTop: 100,
    alignItems: 'center',
  },
  errorText: {
    color: '#C44536',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AssignUserRoleScreen;