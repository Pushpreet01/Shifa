/**
 * AttendanceReportScreen Component
 * 
 * A management interface for tracking volunteer attendance at events.
 * Allows administrators to mark volunteers as present or absent individually
 * or as a group.
 * 
 * Features:
 * - Individual attendance tracking
 * - Bulk attendance marking
 * - Real-time status updates
 * - Name caching for performance
 * - Loading and error states
 * 
 * Navigation Parameters:
 * - eventId: ID of the event to track attendance for
 * 
 * States:
 * - attendees: Array of volunteer applications
 * - loading: Loading state indicator
 * - markingAll: Bulk action loading state
 * - noOpportunity: Error state for missing opportunity
 * - opportunityId: ID of associated volunteer opportunity
 * - nameCache: Cache of user names for performance
 */

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

// Type definition for attendee data
type Attendee = {
  id: string;
  name: string;
  attended: boolean;
};

const AttendanceReportScreen = () => {
  const route = useRoute<any>();
  const { eventId } = route.params || {};

  // State Management
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [noOpportunity, setNoOpportunity] = useState(false);
  const [opportunityId, setOpportunityId] = useState<string | null>(null);
  const [nameCache, setNameCache] = useState<{ [userId: string]: string }>({});

  /**
   * Fetches volunteer applications for the event
   * Initializes attendance tracking data
   */
  React.useEffect(() => {
    const fetchAttendees = async () => {
      if (!eventId) return;
      setLoading(true);
      try {
        // Get volunteer opportunity associated with event
        const opportunity = await FirebaseOpportunityService.getOpportunityByEventId(eventId);
        if (!opportunity) {
          setNoOpportunity(true);
          setAttendees([]);
          return;
        }
        setOpportunityId(opportunity.opportunityId);
        
        // Fetch volunteer applications
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

  /**
   * Fetches and caches volunteer names
   * Uses cached names when available for performance
   * @param userId - ID of the volunteer to fetch name for
   */
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

  /**
   * Fetches missing volunteer names when attendee list changes
   * Updates name cache for newly added attendees
   */
  React.useEffect(() => {
    const fetchNames = async () => {
      const missing = attendees.filter(a => !a.fullName && !nameCache[a.userId]);
      await Promise.all(missing.map(a => getVolunteerName(a.userId)));
    };
    if (attendees.length > 0) fetchNames();
  }, [attendees]);

  /**
   * Handles bulk attendance marking
   * Toggles all attendees between present and absent
   */
  const allPresent = attendees.length > 0 && attendees.every(a => a.attendance === 'Present');
  const markAll = async () => {
    setMarkingAll(true);
    const newStatus = allPresent ? 'Absent' : 'Present';
    try {
      // Update all attendees' status
      await Promise.all(attendees.map((a) => FirebaseVolunteerApplicationService.updateAttendance(a.applicationId, newStatus)));
      setAttendees((prev) => prev.map((a) => ({ ...a, attendance: newStatus })));
    } finally {
      setMarkingAll(false);
    }
  };

  /**
   * Handles individual attendance toggling
   * Updates single attendee's status
   * @param applicationId - ID of the application to update
   * @param current - Current attendance status
   */
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

      {/* Error State */}
      {noOpportunity ? (
        <Text style={{ textAlign: 'center', color: '#C44536', margin: 24 }}>No opportunity found for this event.</Text>
      ) : (
        <>
          {/* Bulk Action Button */}
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

          {/* Attendee List */}
          <ScrollView contentContainerStyle={styles.content}>
            {attendees.filter(a => a.status === 'Selected').map((attendee) => (
              <View key={attendee.applicationId} style={styles.card}>
                {/* Attendee Info */}
                <View style={styles.infoSection}>
                  <Ionicons
                    name={attendee.attendance === 'Present' ? 'checkmark-circle' : 'close-circle'}
                    size={28}
                    color={attendee.attendance === 'Present' ? '#1B6B63' : '#C44536'}
                  />
                  <Text style={styles.name}>{attendee.fullName || nameCache[attendee.userId] || attendee.userId}</Text>
                </View>
                {/* Individual Toggle Button */}
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

// Styles: Defines the visual appearance of the attendance report screen
const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: '#FDF6EC', // Warm background color
  },
  content: {
    padding: 16,
    paddingBottom: 40, // Extra padding for comfortable scrolling
  },
  
  // Card styles
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // Card elevation
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  
  // Info section styles
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
  
  // Button styles
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
