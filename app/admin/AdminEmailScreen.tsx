// app/admin/AdminEmailScreen.tsx

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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdminHeroBox from '../../components/AdminHeroBox';

const roles = ['Support Seeker', 'Volunteer', 'Event Organizer', 'Admin'];
const MAX_WORD_LIMIT = 250;

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

  const wordCount = message.trim().split(/\s+/).filter(Boolean).length;

  const handleSend = () => {
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

    if (wordCount > MAX_WORD_LIMIT) {
      alert(`Message too long. Max ${MAX_WORD_LIMIT} words allowed.`);
      return;
    }

    // Reset form and show success modal
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
      <AdminHeroBox title="Send Email" showBackButton customBackRoute="AdminDashboard" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Select Recipient:</Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => setShowRoleDropdown(true)}>
          <Text style={styles.dropdownText}>
            {selectedRole || 'Choose a Role'}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#1B6B63" />
        </TouchableOpacity>

        {/* Primary Role Dropdown */}
        <Modal transparent visible={showRoleDropdown} animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setShowRoleDropdown(false)}
            activeOpacity={1}
          >
            <View style={styles.dropdownModal}>
              {['Particular User', ...roles].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedRole(role);
                    setShowRoleDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{role}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Secondary Role Dropdown if "Particular User" selected */}
        {selectedRole === 'Particular User' && (
          <>
            <Text style={styles.label}>User Role:</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => setShowUserRoleDropdown(true)}>
              <Text style={styles.dropdownText}>
                {specificUserRole || 'Select User Role'}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#1B6B63" />
            </TouchableOpacity>

            <Modal transparent visible={showUserRoleDropdown} animationType="fade">
              <TouchableOpacity
                style={styles.modalOverlay}
                onPress={() => setShowUserRoleDropdown(false)}
                activeOpacity={1}
              >
                <View style={styles.dropdownModal}>
                  {roles.map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSpecificUserRole(role);
                        setShowUserRoleDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{role}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableOpacity>
            </Modal>

            <Text style={styles.label}>User Email:</Text>
            <TextInput
              placeholder="Enter email address"
              value={userEmail}
              onChangeText={setUserEmail}
              style={styles.input}
              keyboardType="email-address"
            />
          </>
        )}

        <Text style={styles.label}>Subject:</Text>
        <TextInput
          placeholder="Enter email subject"
          value={subject}
          onChangeText={setSubject}
          style={styles.input}
        />

        <Text style={styles.label}>Message:</Text>
        <TextInput
          multiline
          placeholder="Type your message here..."
          style={[styles.input, styles.messageInput]}
          value={message}
          onChangeText={setMessage}
        />
        <Text style={styles.wordCount}>{wordCount} / {MAX_WORD_LIMIT} words</Text>

        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send Email</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Confirmation Popup */}
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
  container: { flex: 1, backgroundColor: '#FDF6EC' },
  content: { padding: 20 },
  label: {
    marginTop: 16,
    marginBottom: 6,
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  dropdownModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 10,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#1B6B63',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  wordCount: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: '#888',
    marginBottom: 20,
  },
  sendButton: {
    backgroundColor: '#1B6B63',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
