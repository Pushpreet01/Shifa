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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdminHeroBox from '../../components/AdminHeroBox';

const roles = ['Support Seeker', 'Volunteer', 'Event Organizer', 'Admin'];

const AdminEmailScreen = () => {
  const [selectedMode, setSelectedMode] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (selectedMode === 'single' && (!selectedRole || !userEmail)) {
      alert('Please select a role and enter an email address.');
      return;
    }

    alert(`Email sent ${selectedMode === 'single' ? `to ${userEmail}` : `to all ${selectedMode}s`}`);
    setSelectedMode('');
    setSelectedRole('');
    setUserEmail('');
    setMessage('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <AdminHeroBox title="Send Email" showBackButton customBackRoute="AdminDashboard" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Choose Email Recipient</Text>

        {['Support Seeker', 'Volunteer', 'Event Organizer', 'Admin'].map((group, index) => {
          const icons = ['people-outline', 'hand-left-outline', 'calendar-outline', 'shield-checkmark-outline'];
          return (
            <TouchableOpacity
              key={group}
              style={[styles.optionButton, selectedMode === group && styles.selectedButton]}
              onPress={() => {
                setSelectedMode(group);
                setSelectedRole('');
              }}
            >
              <Ionicons name={icons[index] as any} size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.optionText}>Send to all {group}s</Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[styles.optionButton, selectedMode === 'single' && styles.selectedButton]}
          onPress={() => {
            setSelectedMode('single');
            setSelectedRole('');
          }}
        >
          <Ionicons name="person-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.optionText}>Send to a specific user</Text>
        </TouchableOpacity>

        {selectedMode === 'single' && (
          <>
            <Text style={styles.label}>Select Role:</Text>
            <View style={styles.roleGroup}>
              {roles.map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleButton,
                    selectedRole === role && styles.selectedRoleButton,
                  ]}
                  onPress={() => setSelectedRole(role)}
                >
                  <Text style={styles.roleButtonText}>{role}</Text>
                </TouchableOpacity>
              ))}
            </View>

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

        <Text style={styles.label}>Message:</Text>
        <View style={styles.messageInputRow}>
          <TextInput
            multiline
            placeholder="Type your message here..."
            style={[styles.input, styles.messageInput]}
            value={message}
            onChangeText={setMessage}
          />
          {selectedMode === 'single' && (
            <TouchableOpacity style={styles.sendIconWrapper} onPress={handleSend}>
              <Ionicons name="send-outline" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {selectedMode !== 'single' && (
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>Send Email</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF6EC' },
  content: { padding: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B6B63',
    marginBottom: 16,
  },
  optionButton: {
    backgroundColor: '#1B6B63',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  selectedButton: {
    backgroundColor: '#3f8390',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  roleGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  roleButton: {
    backgroundColor: '#F4A941',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  selectedRoleButton: {
    backgroundColor: '#1B6B63',
  },
  roleButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 10,
    flex: 1,
  },
  messageInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  sendIconWrapper: {
    backgroundColor: '#1B6B63',
    padding: 12,
    borderRadius: 50,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
    width: 48,
  },
  sendButton: {
    backgroundColor: '#1B6B63',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminEmailScreen;
