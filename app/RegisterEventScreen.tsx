import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const RegisterScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const eventName = 'Community Gardening at Central Park';

  const handleRegister = async () => {
    if (!name || !email) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await addDoc(collection(db, 'users'), {
        name,
        email,
        eventName,
      });

      Alert.alert('Success', 'You have registered for the event!');
      setName('');
      setEmail('');
    } catch (error) {
      console.error('Error adding document: ', error);
      Alert.alert('Error', 'Failed to register. Try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Your Information</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter full name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Email Address"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <View style={styles.previewBox}>
        <Text style={styles.previewText}>Date: March 8, 2025</Text>
        <Text style={styles.previewText}>Time: 10:00 AM - 2:00 PM</Text>
        <Text style={styles.previewText}>Location: Central Park</Text>
        <Text style={styles.previewText}>
          Join us for a day of community gardening at Central Park. All ages welcome!
        </Text>
      </View>
      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fef9ee' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
    label: { fontWeight: 'bold', marginBottom: 5, color: '#204b24' },
    input: {
      borderWidth: 1, borderColor: '#ccc', borderRadius: 6,
      padding: 10, marginBottom: 15, backgroundColor: '#fff'
    },
    previewBox: {
      backgroundColor: '#fff', borderRadius: 8, padding: 15,
      marginBottom: 20, elevation: 2
    },
    previewText: { marginBottom: 5 },
    bold: { fontWeight: 'bold' },
    registerButton: {
      backgroundColor: '#79a96b', padding: 12, borderRadius: 8,
      alignItems: 'center'
    },
    registerText: { color: '#fff', fontWeight: 'bold' },
});
