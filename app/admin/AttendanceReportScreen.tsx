import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdminHeroBox from '../../components/AdminHeroBox';

type Attendee = {
  id: string;
  name: string;
  attended: boolean;
};

const AttendanceReportScreen = () => {
  const [attendees, setAttendees] = useState<Attendee[]>([
    { id: '1', name: 'Riya Kapoor', attended: true },
    { id: '2', name: 'Ahmed Khan', attended: false },
    { id: '3', name: 'Jessica Wong', attended: true },
    { id: '4', name: 'Miguel Hernandez', attended: true },
  ]);

  const toggleAttendance = (id: string) => {
    setAttendees((prev) =>
      prev.map((attendee) =>
        attendee.id === id ? { ...attendee, attended: !attendee.attended } : attendee
      )
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AdminHeroBox title="Attendance Report" showBackButton customBackRoute="Events" />

      <ScrollView contentContainerStyle={styles.content}>
        {attendees.map((attendee) => (
          <View key={attendee.id} style={styles.card}>
            <View style={styles.infoSection}>
              <Ionicons
                name={attendee.attended ? 'checkmark-circle' : 'close-circle'}
                size={28}
                color={attendee.attended ? '#1B6B63' : '#C44536'}
              />
              <Text style={styles.name}>{attendee.name}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                { backgroundColor: attendee.attended ? '#C44536' : '#1B6B63' },
              ]}
              onPress={() => toggleAttendance(attendee.id)}
            >
              <Text style={styles.toggleText}>
                {attendee.attended ? 'Mark Absent' : 'Mark Present'}
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
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toggleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AttendanceReportScreen;
