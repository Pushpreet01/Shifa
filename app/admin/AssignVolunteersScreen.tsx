import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    { id: '3', title: 'Community Support Group' },
  ]);

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedEventTitle, setSelectedEventTitle] = useState<string>('Choose an event');

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

  const [eventDropdownVisible, setEventDropdownVisible] = useState(false);

  const toggleAssignment = (volunteerId: string) => {
    if (!selectedEventId) return;

    setVolunteerMap((prev) => {
      const updatedVolunteers = prev[selectedEventId].map((v) =>
        v.id === volunteerId ? { ...v, assigned: !v.assigned } : v
      );
      return { ...prev, [selectedEventId]: updatedVolunteers };
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <AdminHeroBox title="Assign Volunteers" showBackButton customBackRoute="Events" />

      <View style={styles.dropdownWrapper}>
        <Text style={styles.label}>Select Event:</Text>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            onPress={() => setEventDropdownVisible(!eventDropdownVisible)}
            style={styles.dropdownButton}
          >
            <Text style={styles.dropdownText}>{selectedEventTitle}</Text>
            <Ionicons
              name={eventDropdownVisible ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#1B6B63"
            />
          </TouchableOpacity>
          {eventDropdownVisible && (
            <View style={styles.dropdownList}>
              {events.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    setSelectedEventId(item.id);
                    setSelectedEventTitle(item.title);
                    setEventDropdownVisible(false);
                  }}
                >
                  <Text style={styles.dropdownItem}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {selectedEventId &&
          volunteerMap[selectedEventId]?.map((volunteer) => (
            <View key={volunteer.id} style={styles.card}>
              <View style={styles.infoSection}>
                <Ionicons
                  name="person-circle-outline"
                  size={32}
                  color={volunteer.assigned ? '#1B6B63' : '#999'}
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
  dropdownWrapper: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    fontSize: 16,
  },
  dropdownContainer: {
    marginBottom: 10,
  },
  dropdownButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#1B6B63',
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