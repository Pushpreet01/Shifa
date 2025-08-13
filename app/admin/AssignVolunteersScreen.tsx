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
import FirebaseOpportunityService from '../../services/FirebaseOpportunityService';
import FirebaseVolunteerApplicationService from '../../services/FirebaseVolunteerApplicationService';
import { useRoute } from '@react-navigation/native';
import { db } from '../../config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import * as adminEventService from '../../services/adminEventService';

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
  const route = useRoute<any>();
  const { eventId: initialEventId } = route.params || {};
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedEventTitle, setSelectedEventTitle] = useState<string>('Choose an event');
  const [eventDropdownVisible, setEventDropdownVisible] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [nameCache, setNameCache] = useState<{ [userId: string]: string }>({});
  const [noOpportunity, setNoOpportunity] = useState(false);
  const [opportunityId, setOpportunityId] = useState<string | null>(null);
  const [slots, setSlots] = useState<number | null>(null);

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

  // On applications change, fetch missing names
  React.useEffect(() => {
    const fetchNames = async () => {
      const missing = applications.filter(a => a?.userId && !a.fullName && !nameCache[a.userId]);
      await Promise.all(missing.map(a => getVolunteerName(a.userId)));
    };
    if (applications.length > 0) fetchNames();
  }, [applications]);

  // Fetch all events for dropdown on mount
  React.useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const allEvents = await adminEventService.fetchEvents();
        const filteredEvents = allEvents.filter((ev: any) => ev.needsVolunteers === true);
        setEvents(filteredEvents);
        // Pre-select event if passed via params
        if (initialEventId) {
          const found = filteredEvents.find((ev: any) => ev.id === initialEventId);
          if (found) {
            setSelectedEventId(found.id);
            setSelectedEventTitle((found as any).title || 'Untitled Event');
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // When selectedEventId changes, fetch opportunity and applications
  React.useEffect(() => {
    const fetchData = async () => {
      if (!selectedEventId) return;
      setLoading(true);
      try {
        const opportunity = await FirebaseOpportunityService.getOpportunityByEventId(selectedEventId);
        if (!opportunity) {
          setNoOpportunity(true);
          setApplications([]);
          setSlots(null);
          return;
        }
        setOpportunityId(opportunity.opportunityId);
        setSlots(opportunity.noVolunteersNeeded || null);
        const apps = await FirebaseVolunteerApplicationService.getApplicationsByOpportunity(opportunity.opportunityId);
        setApplications(apps);
      } catch (err) {
        setNoOpportunity(true);
        setApplications([]);
        setSlots(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedEventId]);

  /**
   * Handles volunteer assignment toggling
   * Respects slot limits when assigning volunteers
   * @param applicationId - ID of the application to toggle
   * @param currentStatus - Current assignment status
   */
  const selectedCount = applications.filter(a => a.status === 'approved').length;
  const toggleAssignment = async (applicationId: string, currentStatus: string) => {
    // Prevent assigning if slots are full and trying to assign
    if (currentStatus !== 'approved' && slots !== null && selectedCount >= slots) return;
    setLoading(true);
    const newStatus = currentStatus === 'approved' ? 'pending' : 'approved';
    try {
      await FirebaseVolunteerApplicationService.updateApplicationStatus(applicationId, newStatus);
      setApplications((prev) => prev.map((a) => a.applicationId === applicationId ? { ...a, status: newStatus } : a));
    } finally {
      setLoading(false);
    }
  };

  // Sort applications: Not Selected at top, Selected at bottom
  const sortedApplications = [...applications].sort((a, b) => {
    if (a.status === 'pending' && b.status === 'approved') return -1;
    if (a.status === 'approved' && b.status === 'pending') return 1;
    return 0;
  });

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
              {events.map((item: any) => (
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

      {slots !== null && (
        <Text style={{ textAlign: 'right', marginRight: 16, marginBottom: 8, fontWeight: 'bold', color: '#1B6B63' }}>
          Selected: {selectedCount} / {slots}
        </Text>
      )}

      {noOpportunity ? (
        <Text style={{ textAlign: 'center', color: '#C44536', margin: 24 }}>No opportunity found for this event.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {sortedApplications.map((app) => {
            const isSelected = app.status === 'approved';
            const disableAssign = !isSelected && slots !== null && selectedCount >= slots;
            return (
              <View key={app.applicationId} style={styles.card}>
                <View style={styles.infoSection}>
                  <Ionicons
                    name={isSelected ? 'checkmark-circle' : 'close-circle'}
                    size={28}
                    color={isSelected ? '#1B6B63' : '#C44536'}
                  />
                  <Text style={styles.name}>{app.fullName || nameCache[app.userId] || app.userId || 'Unknown User'}</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggleBtn,
                    { backgroundColor: isSelected ? '#C44536' : '#1B6B63' },
                  ]}
                  onPress={() => toggleAssignment(app.applicationId, app.status)}
                  disabled={loading || disableAssign}
                >
                  <Text style={styles.toggleText}>
                    {isSelected ? 'Unassign' : 'Assign'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}
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

export default AssignVolunteersScreen;