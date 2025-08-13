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
import FirebaseVolunteerApplicationService from '../../services/FirebaseVolunteerApplicationService';
import FirebaseOpportunityService from '../../services/FirebaseOpportunityService';
import { useRoute } from '@react-navigation/native';
import { db } from '../../config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

type Attendee = {
  id: string;
  name: string;
  attended: boolean;
};

const AttendanceReportScreen = () => {
  const route = useRoute<any>();
  const { eventId } = route.params || {};
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [noOpportunity, setNoOpportunity] = useState(false);
  const [opportunityId, setOpportunityId] = useState<string | null>(null);
  const [nameCache, setNameCache] = useState<{ [userId: string]: string }>({});

  // Fetch all volunteer applications for this opportunity
  React.useEffect(() => {
    const fetchAttendees = async () => {
      if (!eventId) return;
      setLoading(true);
      try {
        const opportunity = await FirebaseOpportunityService.getOpportunityByEventId(eventId);
        if (!opportunity) {
          setNoOpportunity(true);
          setAttendees([]);
          return;
        }
        setOpportunityId(opportunity.opportunityId);
        const apps = await FirebaseVolunteerApplicationService.getApplicationsByOpportunity(opportunity.opportunityId);
        setAttendees(apps);
      } catch (err) {
        setNoOpportunity(true);
        setAttendees([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendees();
  }, [eventId]);

  // Fetch and cache user name if not present
  const getVolunteerName = async (userId: string) => {
    if (nameCache[userId]) return nameCache[userId];
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const fullName = userDoc.data().fullName || userId;
        setNameCache((prev) => ({ ...prev, [userId]: fullName }));
        return fullName;
      }
    } catch { }
    return userId;
  };

  // On attendees change, fetch missing names
  React.useEffect(() => {
    const fetchNames = async () => {
      const missing = attendees.filter(a => a?.userId && !a.fullName && !nameCache[a.userId]);
      await Promise.all(missing.map(a => getVolunteerName(a.userId)));
    };
    if (attendees.length > 0) fetchNames();
  }, [attendees]);

  // Mark all as present/absent toggle
  const allPresent = attendees.length > 0 && attendees.every(a => a.attendance === 'Present');
  const markAll = async () => {
    setMarkingAll(true);
    const newStatus = allPresent ? 'Absent' : 'Present';
    try {
      await Promise.all(attendees.map((a) => FirebaseVolunteerApplicationService.updateAttendance(a.applicationId, newStatus)));
      setAttendees((prev) => prev.map((a) => ({ ...a, attendance: newStatus })));
    } finally {
      setMarkingAll(false);
    }
  };

  // Toggle individual attendance
  const toggleAttendance = async (applicationId: string, current: string | undefined) => {
    const newStatus = current === 'Present' ? 'Absent' : 'Present';
    setLoading(true);
    try {
      await FirebaseVolunteerApplicationService.updateAttendance(applicationId, newStatus as 'Present' | 'Absent');
      setAttendees((prev) => prev.map((a) => a.applicationId === applicationId ? { ...a, attendance: newStatus } : a));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AdminHeroBox title="Attendance Report" showBackButton customBackRoute="Events" />

      {noOpportunity ? (
        <Text style={{ textAlign: 'center', color: '#C44536', margin: 24 }}>No opportunity found for this event.</Text>
      ) : (
        <>
          <TouchableOpacity
            style={[styles.toggleBtn, { backgroundColor: '#1B6B63', margin: 16, alignSelf: 'flex-end' }]}
            onPress={markAll}
            disabled={markingAll || loading || !opportunityId}
          >
            <Text style={styles.toggleText}>
              {markingAll
                ? 'Marking...'
                : allPresent
                  ? 'Mark All Absent'
                  : 'Mark All Present'}
            </Text>
          </TouchableOpacity>
          <ScrollView contentContainerStyle={styles.content}>
            {attendees.filter(a => a.status === 'Selected').map((attendee) => (
              <View key={attendee.applicationId} style={styles.card}>
                <View style={styles.infoSection}>
                  <Ionicons
                    name={attendee.attendance === 'Present' ? 'checkmark-circle' : 'close-circle'}
                    size={28}
                    color={attendee.attendance === 'Present' ? '#1B6B63' : '#C44536'}
                  />
                  <Text style={styles.name}>{attendee.fullName || nameCache[attendee.userId] || attendee.userId || 'Unknown User'}</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggleBtn,
                    { backgroundColor: attendee.attendance === 'Present' ? '#C44536' : '#1B6B63' },
                  ]}
                  onPress={() => toggleAttendance(attendee.applicationId, attendee.attendance)}
                  disabled={loading}
                >
                  <Text style={styles.toggleText}>
                    {attendee.attendance === 'Present' ? 'Mark Absent' : 'Mark Present'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </>
      )}
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
