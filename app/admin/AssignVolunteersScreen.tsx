import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AdminHeroBox from '../../components/AdminHeroBox';

type Volunteer = {
  id: string;
  name: string;
  assigned: boolean;
};

type Event = {
  id: string;
  title: string;
};

const AssignVolunteersScreen = () => {
  const [events] = useState<Event[]>([
    { id: '1', title: 'Mental Health Drive' },
    { id: '2', title: 'Substance Abuse Seminar' },
  ]);

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const [volunteerMap, setVolunteerMap] = useState<Record<string, Volunteer[]>>({
    '1': [
      { id: '1', name: 'Riya Kapoor', assigned: true },
      { id: '2', name: 'Ahmed Khan', assigned: true },
    ],
    '2': [
      { id: '3', name: 'Jessica Wong', assigned: true },
      { id: '4', name: 'Miguel Hernandez', assigned: true },
    ],
  });

  const toggleAssignment = (id: string) => {
    if (!selectedEventId) return;

    setVolunteerMap((prev) => {
      const updatedVolunteers = prev[selectedEventId].map((v) =>
        v.id === id ? { ...v, assigned: !v.assigned } : v
      );

      const updatedVolunteer = updatedVolunteers.find((v) => v.id === id);

      Alert.alert(
        updatedVolunteer?.assigned ? 'Volunteer Unassigned' : 'Volunteer Assigned',
        `${updatedVolunteer?.name} has been ${
          updatedVolunteer?.assigned ? 'removed from' : 'assigned to'
        } the event.`
      );

      return { ...prev, [selectedEventId]: updatedVolunteers };
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <AdminHeroBox title="Assign Volunteers" showBackButton customBackRoute="Events" />

      <View style={styles.pickerWrapper}>
        <Text style={styles.label}>Select Event:</Text>
        <Picker
          selectedValue={selectedEventId}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedEventId(itemValue)}
        >
          <Picker.Item label="-- Choose an event --" value={null} />
          {events.map((event) => (
            <Picker.Item key={event.id} label={event.title} value={event.id} />
          ))}
        </Picker>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {selectedEventId && volunteerMap[selectedEventId]?.map((volunteer) => (
          <View key={volunteer.id} style={styles.card}>
            <View style={styles.infoSection}>
              <Ionicons
                name="person-circle-outline"
                size={32}
                color={volunteer.assigned ? '#1B6B63' : '#666'}
              />
              <Text style={styles.name}>{volunteer.name}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.assignButton,
                { backgroundColor: volunteer.assigned ? '#C44536' : '#1B6B63' },
              ]}
              onPress={() => toggleAssignment(volunteer.id)}
            >
              <Text style={styles.assignButtonText}>
                {volunteer.assigned ? 'Unassign' : 'Assign'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF6EC',
  },
  pickerWrapper: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    fontSize: 16,
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  assignButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  assignButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AssignVolunteersScreen;
