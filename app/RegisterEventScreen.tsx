// screens/RegisterEventScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import events from '../data/events.json';

type Props = {
  route: RouteProp<RootStackParamList, 'RegisterEvent'>;
};

const RegisterScreen: React.FC<Props> = ({ route }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [event, setEvent] = useState<any>(null);
  const { eventId } = route.params;

  useEffect(() => {
    const found = events.events.find((e) => e.id === eventId);
    setEvent(found);
  }, [eventId]);

  const handleRegister = async () => {
    if (!name || !email) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await addDoc(collection(db, 'users'), {
        name,
        email,
        eventName: event?.title,
      });

      Alert.alert('Success', 'You have registered for the event!');
      setName('');
      setEmail('');
    } catch (error) {
      console.error('Error adding document: ', error);
      Alert.alert('Error', 'Failed to register. Try again.');
    }
  };

  if (!event) {
    return <Text>Loading event...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register for: {event.title}</Text>
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
        <Text style={styles.previewText}>Date: {new Date(event.date).toDateString()}</Text>
        <Text style={styles.previewText}>Time: {event.startTime} - {event.endTime}</Text>
        <Text style={styles.previewText}>Location: {event.location}</Text>
        <Text style={styles.previewText}>{event.description}</Text>
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
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 6,
    padding: 10, marginBottom: 15, backgroundColor: '#fff'
  },
  previewBox: {
    backgroundColor: '#fff', borderRadius: 8, padding: 15,
    marginBottom: 20, elevation: 2
  },
  previewText: { marginBottom: 5 },
  registerButton: {
    backgroundColor: '#79a96b', padding: 12, borderRadius: 8,
    alignItems: 'center'
  },
  registerText: { color: '#fff', fontWeight: 'bold' },
});
