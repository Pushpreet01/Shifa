/**
 * AssignUserRoleScreen Component
 * 
 * An interface for administrators to assign or change user roles in the system.
 * Provides a simple selection interface with role options and handles role updates
 * in the database.
 * 
 * Features:
 * - Role selection from predefined options
 * - Visual feedback for selected role
 * - Loading state during role assignment
 * - Error handling and success feedback
 * - Custom navigation handling
 * 
 * Navigation Parameters:
 * - user: User object containing id, role, and other user data
 * 
 * States:
 * - selectedRole: Currently selected role for assignment
 * - loading: Loading state during role update
 */

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

// Type definition for route parameters
type AssignUserRoleRouteProp = RouteProp<AdminStackParamList, 'AssignUserRole'>;

// Available roles in the system
const roles = ['Support Seeker', 'Volunteer', 'Event Organizer', 'Admin'];

const AssignUserRoleScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<AssignUserRoleRouteProp>();
  const user = route.params?.user;

  // State Management
  const [selectedRole, setSelectedRole] = useState(user?.role || '');
  const [loading, setLoading] = useState(false);

  /**
   * Handles role assignment
   * Updates user's role in Firestore and navigates back to user details
   */
  const handleAssignRole = async () => {
    if (!selectedRole || !user) return;
    setLoading(true);
    try {
      // Update the user's role in Firestore
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { role: selectedRole });
      Alert.alert('Success', `Role assigned: ${selectedRole}`);
      navigation.navigate('UserDetails', { userId: user.id });
    } catch (err) {
      Alert.alert('Error', 'Failed to assign role.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Custom back navigation handler
   * Returns to user details if user exists, otherwise goes back
   */
  const handleBackPress = () => {
    if (user) {
      navigation.navigate('UserDetails', { userId: user.id });
    } else {
      navigation.goBack();
    }
  };

  // Error state when user data is missing
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
        {/* Role Selection Section */}
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

        {/* Assignment Button */}
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

// Styles: Defines the visual appearance of the role assignment screen
const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: '#FDF6EC', // Warm background color
  },
  inner: {
    padding: 20,
  },
  
  // Label styles
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1B6B63', // Teal color for consistency
  },
  
  // Role button styles
  roleButton: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#E0F2F1', // Light teal for unselected state
    marginBottom: 12,
  },
  selectedButton: {
    backgroundColor: '#1B6B63', // Teal for selected state
  },
  roleText: {
    color: '#1B6B63',
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedText: {
    color: '#FFF', // White text for selected state
  },
  
  // Assignment button styles
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
  
  // Error state styles
  errorBox: {
    marginTop: 100,
    alignItems: 'center',
  },
  errorText: {
    color: '#C44536', // Error red
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AssignUserRoleScreen;