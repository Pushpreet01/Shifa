/**
 * AdminEmailScreen Component
 * 
 * An interface for administrators to send emails to users based on their roles.
 * Provides functionality for both bulk role-based emailing and individual user
 * communication with character limits and validation.
 * 
 * Features:
 * - Role-based recipient selection
 * - Individual user emailing
 * - Character-limited subject and message
 * - Email validation
 * - Success animation
 * - Keyboard-aware scrolling
 * 
 * States:
 * - selectedRole: Currently selected recipient role
 * - specificUserRole: Role for individual user emailing
 * - userEmail: Email address for individual user
 * - subject: Email subject line
 * - message: Email body content
 * - showRoleDropdown: Controls role selection dropdown
 * - showUserRoleDropdown: Controls user role dropdown
 * - showSuccessModal: Controls success animation
 * - fadeAnim: Animation value for success modal
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
  Easing,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdminHeroBox from '../../components/AdminHeroBox';
import * as MailComposer from 'expo-mail-composer';
import KeyboardAwareWrapper from '../../components/KeyboardAwareWrapper';

// Available user roles in the system
const roles = ['Support Seeker', 'Volunteer', 'Event Organizer', 'Admin'];

// Character limits for input fields
const MAX_CHAR_LIMITS = {
  subject: 30,
  message: 500,
};

// Placeholder email data (replace with actual data in production)
const placeholderEmails = {
  Admin: ['admin1@example.com', 'admin2@example.com', 'admin3@example.com'],
  'Support Seeker': ['support1@example.com', 'support2@example.com', 'support3@example.com'],
  Volunteer: ['volunteer1@example.com', 'volunteer2@example.com', 'volunteer3@example.com', 'volunteer4@example.com'],
  'Event Organizer': ['organizer1@example.com', 'organizer2@example.com'],
};

const AdminEmailScreen = () => {
  // State Management
  const [selectedRole, setSelectedRole] = useState('');
  const [specificUserRole, setSpecificUserRole] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showUserRoleDropdown, setShowUserRoleDropdown] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  /**
   * Counts characters in a text field
   * Used for character limit validation
   * @param text - Text to count characters in
   */
  const countChars = (text: string) => {
    return text.length;
  };

  /**
   * Handles email sending
   * Validates input, checks email availability, and sends email
   */
  const handleSend = async () => {
    // Validate input fields
    if (selectedRole === 'Particular User') {
      if (!specificUserRole || !userEmail || !subject || !message.trim()) {
        alert('Please fill all fields for specific user.');
        return;
      }
    } else {
      if (!selectedRole || !subject || !message.trim()) {
        alert('Please fill all fields.');
        return;
      }
    }

    // Validate character limits
    if (countChars(subject) > MAX_CHAR_LIMITS.subject) {
      alert(`Subject exceeds character limit of ${MAX_CHAR_LIMITS.subject}.`);
      return;
    }

    if (countChars(message) > MAX_CHAR_LIMITS.message) {
      alert(`Message exceeds character limit of ${MAX_CHAR_LIMITS.message}.`);
      return;
    }

    // Check email availability
    const isAvailable = await MailComposer.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Error', 'No email app is available on this device');
      return;
    }

    // Send email
    await MailComposer.composeAsync({
      recipients: [userEmail],
      subject: subject,
      body: message,
    });

    // Reset form and show success animation
    setSelectedRole('');
    setSpecificUserRole('');
    setUserEmail('');
    setSubject('');
    setMessage('');
    setShowSuccessModal(true);

    // Animate success modal
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => setShowSuccessModal(false));
      }, 1800);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <AdminHeroBox
        title="Send Email"
        showBackButton
        customBackRoute="AdminDashboard"
      />
      <KeyboardAwareWrapper>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Role Selection Section */}
          <Text style={styles.label}>Select Recipient:</Text>
          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              onPress={() => setShowRoleDropdown(!showRoleDropdown)}
              style={styles.dropdown}
            >
              <Text style={styles.dropdownText}>
                {selectedRole || 'Choose a Role'}
              </Text>
              <Ionicons
                name={showRoleDropdown ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#1B6B63"
              />
            </TouchableOpacity>
            {showRoleDropdown && (
              <View style={styles.dropdownList}>
                {['Particular User', ...roles].map((role) => (
                  <TouchableOpacity
                    key={role}
                    onPress={() => {
                      setSelectedRole(role);
                      setShowRoleDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItem}>{role}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Role-based Email List */}
          {selectedRole && selectedRole !== 'Particular User' && (
            <View style={styles.emailListContainer}>
              <Text style={styles.label}>Users in {selectedRole}:</Text>
              {placeholderEmails[selectedRole]?.length > 0 ? (
                placeholderEmails[selectedRole].map((email, index) => (
                  <View key={index} style={styles.emailItem}>
                    <Ionicons name="mail-outline" size={16} color="#1B6B63" style={styles.emailIcon} />
                    <Text style={styles.emailText}>{email}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noEmailsText}>No users found for this role.</Text>
              )}
            </View>
          )}

          {/* Individual User Section */}
          {selectedRole === 'Particular User' && (
            <>
              <Text style={styles.label}>User Role:</Text>
              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  onPress={() => setShowUserRoleDropdown(!showUserRoleDropdown)}
                  style={styles.dropdown}
                >
                  <Text style={styles.dropdownText}>
                    {specificUserRole || 'Select User Role'}
                  </Text>
                  <Ionicons
                    name={showUserRoleDropdown ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#1B6B63"
                  />
                </TouchableOpacity>
                {showUserRoleDropdown && (
                  <View style={styles.dropdownList}>
                    {roles.map((role) => (
                      <TouchableOpacity
                        key={role}
                        onPress={() => {
                          setSpecificUserRole(role);
                          setShowUserRoleDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItem}>{role}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <Text style={styles.label}>User Email:</Text>
              <TextInput
                placeholder="Enter email address"
                value={userEmail}
                onChangeText={setUserEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCorrect={false}
                autoCapitalize="none"
              />
            </>
          )}

          {/* Email Content Section */}
          <Text style={styles.label}>Subject:</Text>
          <TextInput
            placeholder="Enter email subject"
            value={subject}
            onChangeText={setSubject}
            style={styles.input}
            autoCorrect={false}
            autoCapitalize="none"
            maxLength={MAX_CHAR_LIMITS.subject}
          />
          <Text style={styles.charCountSubject}>
            {countChars(subject)}/{MAX_CHAR_LIMITS.subject}
          </Text>

          <Text style={styles.label}>Message:</Text>
          <TextInput
            multiline
            placeholder="Type your message here..."
            style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
            value={message}
            onChangeText={setMessage}
            maxLength={MAX_CHAR_LIMITS.message}
          />
          <Text style={styles.charCount}>
            {countChars(message)}/{MAX_CHAR_LIMITS.message}
          </Text>

          {/* Send Button */}
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>Send Email</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAwareWrapper>

      {/* Success Modal */}
      <Modal transparent visible={showSuccessModal} animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.successPopup, { opacity: fadeAnim }]}>
            <Ionicons name="checkmark-circle-outline" size={40} color="#1B6B63" />
            <Text style={styles.successText}>Email Sent Successfully!</Text>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Styles: Defines the visual appearance of the email composition screen
const styles = StyleSheet.create({
  // Container styles
  container: { 
    flex: 1, 
    backgroundColor: "#FDF6EC", // Warm background color
  },
  content: {
    padding: 20,
    paddingBottom: 40, // Extra padding for keyboard scrolling
  },
  
  // Label styles
  label: {
    marginTop: 16,
    marginBottom: 6,
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  
  // Dropdown styles
  dropdownContainer: { 
    marginBottom: 10,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: { 
    color: '#1B6B63', 
    fontWeight: 'bold',
  },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    elevation: 2,
  },
  dropdownItem: { 
    paddingVertical: 6, 
    fontSize: 15, 
    color: '#2E2E2E',
  },
  
  // Email list styles
  emailListContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  emailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  emailIcon: { 
    marginRight: 8,
  },
  emailText: { 
    fontSize: 14, 
    color: '#2E2E2E',
  },
  noEmailsText: { 
    fontSize: 14, 
    color: '#888', 
    textAlign: 'center', 
    paddingVertical: 10,
  },
  
  // Input styles
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  charCountSubject: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: '#1B6B63', // Teal color for consistency
    marginBottom: -10, // Reduced spacing
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: '#1B6B63',
    marginBottom: 20,
  },
  
  // Button styles
  sendButton: {
    backgroundColor: "#1B6B63",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: 'rgba(0,0,0,0.3)', // Semi-transparent overlay
  },
  successPopup: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    alignSelf: 'center',
    width: 250,
    // Modal elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  successText: {
    marginTop: 12,
    fontSize: 16,
    color: '#1B6B63',
    fontWeight: 'bold',
  },
});

export default AdminEmailScreen;