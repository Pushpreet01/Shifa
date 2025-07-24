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

const roles = ['Support Seeker', 'Volunteer', 'Event Organizer', 'Admin'];
const MAX_CHAR_LIMITS = {
  subject: 30,
  message: 500,
};

const placeholderEmails = {
  Admin: ['admin1@example.com', 'admin2@example.com', 'admin3@example.com'],
  'Support Seeker': ['support1@example.com', 'support2@example.com', 'support3@example.com'],
  Volunteer: ['volunteer1@example.com', 'volunteer2@example.com', 'volunteer3@example.com', 'volunteer4@example.com'],
  'Event Organizer': ['organizer1@example.com', 'organizer2@example.com'],
};

const AdminEmailScreen = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [specificUserRole, setSpecificUserRole] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showUserRoleDropdown, setShowUserRoleDropdown] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const countChars = (text: string) => {
    return text.length; // Count individual characters
  };

  const handleSend = async () => {
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

    if (countChars(subject) > MAX_CHAR_LIMITS.subject) {
      alert(`Subject exceeds character limit of ${MAX_CHAR_LIMITS.subject}.`);
      return;
    }

    if (countChars(message) > MAX_CHAR_LIMITS.message) {
      alert(`Message exceeds character limit of ${MAX_CHAR_LIMITS.message}.`);
      return;
    }

    const isAvailable = await MailComposer.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Error', 'No email app is available on this device');
      return;
    }

    await MailComposer.composeAsync({
      recipients: [userEmail],
      subject: subject,
      body: message,
    });

    setSelectedRole('');
    setSpecificUserRole('');
    setUserEmail('');
    setSubject('');
    setMessage('');
    setShowSuccessModal(true);
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

          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>Send Email</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAwareWrapper>

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDF6EC" },
  content: {
    padding: 20,
    paddingBottom: 40, // Increased for better scrolling with keyboard
  },
  label: {
    marginTop: 16,
    marginBottom: 6,
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  dropdownContainer: { marginBottom: 10 },
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
  dropdownText: { color: '#1B6B63', fontWeight: 'bold' },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    elevation: 2,
  },
  dropdownItem: { paddingVertical: 6, fontSize: 15, color: '#2E2E2E' },
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
  emailIcon: { marginRight: 8 },
  emailText: { fontSize: 14, color: '#2E2E2E' },
  noEmailsText: { fontSize: 14, color: '#888', textAlign: 'center', paddingVertical: 10 },
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
    color: '#1B6B63', // Teal color to match other screens
    marginBottom: -10, // Reduced to bring Message field closer
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: '#1B6B63', // Teal color to match other screens
    marginBottom: 20,
  },
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  successPopup: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    alignSelf: 'center',
    width: 250,
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