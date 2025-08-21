import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AdminHeroBox from '../../components/AdminHeroBox';
import Calendar from '../../components/Calendar';
import * as adminEventService from '../../services/adminEventService';

type Event = {
  id: string;
  title: string;
  date: Date;
  location: string;
  approvalStatus?: string | { status: string;[key: string]: any };
  needsVolunteers?: boolean;
};

const EventsScreen = () => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [currentMonth, setCurrentMonth] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [events, setEvents] = useState<Event[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({ id: '', title: '', date: '', location: '' });
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scaleAnims, setScaleAnims] = useState<Animated.Value[]>([]);

  const navigation = useNavigation<any>();

  // Fetch events from backend
  const fetchAndSetEvents = useCallback(async () => {
    setLoading(true);
    try {
      const allEvents = await adminEventService.fetchEvents();
      // Convert Firestore Timestamp to JS Date
      const mapped = allEvents.map((ev: any) => ({
        ...ev,
        date: ev.date && ev.date.toDate ? ev.date.toDate() : new Date(ev.date),
      }));
      setEvents(mapped);
      setScaleAnims(mapped.map(() => new Animated.Value(1)));
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch events.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAndSetEvents();
  }, [fetchAndSetEvents, currentMonth, selectedDate]);

  // Ensure currentMonth is not in the past
  useEffect(() => {
    const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    if (currentMonth < todayMonth) {
      setCurrentMonth(todayMonth);
    }
  }, []);

  const goToPreviousMonth = () => {
    const previousMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1
    );
    const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    if (previousMonth < todayMonth) {
      Alert.alert('Past Month', 'Only current and future months are available.');
      return;
    }
    setCurrentMonth(previousMonth);
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleDateSelect = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (true/*date >= today*/) {
      setSelectedDate(date);
    } else {
      Alert.alert('Invalid Date', 'You can only view events for today and future dates.');
    }
  };

  const openModal = (event?: Event) => {
    if (event) {
      setFormData({
        id: event.id,
        title: event.title,
        date: event.date.toISOString().split('T')[0],
        location: event.location,
      });
      setEditingEventId(event.id);
    } else {
      setFormData({ id: '', title: '', date: '', location: '' });
      setEditingEventId(null);
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.date || !formData.location) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.date)) {
      Alert.alert('Error', 'Date must be in YYYY-MM-DD format.');
      return;
    }

    const eventDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (eventDate < today) {
      Alert.alert('Error', 'Event date cannot be in the past.');
      return;
    }

    setLoading(true);
    try {
      if (editingEventId) {
        await adminEventService.updateEvent(editingEventId, {
          title: formData.title,
          date: eventDate,
          location: formData.location,
        });
      } else {
        await adminEventService.createEvent({
          title: formData.title,
          date: eventDate,
          location: formData.location,
        });
      }
      await fetchAndSetEvents();
    } catch (err) {
      Alert.alert('Error', 'Failed to save event.');
    } finally {
      setLoading(false);
      setModalVisible(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Event', 'Are you sure? This will also delete all associated volunteers, applications, and registrations.', [
      { text: 'Cancel' },
      {
        text: 'Delete', onPress: async () => {
          setLoading(true);
          try {
            await adminEventService.deleteEventCascade(id);
            await fetchAndSetEvents();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete event.');
          } finally {
            setLoading(false);
          }
        }
      },
    ]);
  };

  const handlePressIn = (index: number) => {
    Animated.spring(scaleAnims[index], {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (index: number) => {
    Animated.spring(scaleAnims[index], {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const filteredEvents = events.filter(
    (event) =>
      event.date.getDate() === selectedDate.getDate() &&
      event.date.getMonth() === selectedDate.getMonth() &&
      event.date.getFullYear() === selectedDate.getFullYear() &&
      ((typeof event.approvalStatus === 'object' && event.approvalStatus.status === 'Approved') ||
        (typeof event.approvalStatus === 'string' && event.approvalStatus === 'approved'))
  );

  return (
    <SafeAreaView style={styles.container}>
      <AdminHeroBox title="Manage Events" showBackButton customBackRoute="AdminDashboard" />

      <View style={styles.dateSelectionContainer}>
        <View style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateText}>
            {selectedDate
              ? `${selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}`
              : 'Select date'}
          </Text>
        </View>

        <Calendar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          events={events}
          currentMonth={currentMonth}
          onNextMonth={goToNextMonth}
          onPrevMonth={goToPreviousMonth}
        />
      </View>

      <ScrollView style={styles.eventsListContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F4A941" />
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map((event, index) => (
            <Animated.View
              key={event.id}
              style={[styles.card, { transform: [{ scale: scaleAnims[index] }] }]}
            >
              <View style={styles.cardContent}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDetail}>📅 {event.date.toLocaleDateString('en-US')}</Text>
                <Text style={styles.eventDetail}>📍 {event.location}</Text>
              </View>
              <View style={styles.actionsRow}>
                {event.needsVolunteers && (
                  <>
                    <TouchableOpacity
                      style={[styles.iconButton, { backgroundColor: '#1B6B63' }]}
                      onPress={() => navigation.navigate('AttendanceReport', { eventId: event.id })}
                      onPressIn={() => handlePressIn(index)}
                      onPressOut={() => handlePressOut(index)}
                      accessibilityLabel="View attendance report"
                      accessibilityRole="button"
                    >
                      <Ionicons name="clipboard-outline" size={16} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.iconButton, { backgroundColor: '#1B6B63' }]}
                      onPress={() => navigation.navigate('AssignVolunteers', { eventId: event.id })}
                      onPressIn={() => handlePressIn(index)}
                      onPressOut={() => handlePressOut(index)}
                      accessibilityLabel="Assign volunteers"
                      accessibilityRole="button"
                    >
                      <Ionicons name="people-outline" size={16} color="#fff" />
                    </TouchableOpacity>
                  </>
                )}
                <TouchableOpacity
                  style={[styles.iconButton, { backgroundColor: '#1B6B63' }]}
                  onPress={() => navigation.navigate('AdminEditEvent', { eventId: event.id })}
                  onPressIn={() => handlePressIn(index)}
                  onPressOut={() => handlePressOut(index)}
                  accessibilityLabel="Edit event"
                  accessibilityRole="button"
                >
                  <Ionicons name="create-outline" size={16} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconButton, { backgroundColor: '#1B6B63' }]}
                  onPress={() => handleDelete(event.id)}
                  onPressIn={() => handlePressIn(index)}
                  onPressOut={() => handlePressOut(index)}
                  accessibilityLabel="Delete event"
                  accessibilityRole="button"
                >
                  <Ionicons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          ))
        ) : (
          <View style={styles.noEventsContainer}>
            <Text style={styles.noEventsText}>No events for this date</Text>
            <TouchableOpacity
              style={styles.addEventSmallButton}
              onPress={() => openModal()}
              accessibilityLabel="Create new event"
              accessibilityRole="button"
            >
              <Text style={styles.addEventSmallButtonText}>Add Event</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* <TouchableOpacity
        style={styles.floatingAddButton}
        onPress={() => openModal()}
        accessibilityLabel="Create new event"
        accessibilityRole="button"
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity> */}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {editingEventId ? 'Edit Event' : 'Create Event'}
            </Text>
            <TextInput
              placeholder="Title"
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              accessibilityLabel="Event title"
            />
            <TextInput
              placeholder="Date (YYYY-MM-DD)"
              style={styles.input}
              value={formData.date}
              onChangeText={(text) => setFormData({ ...formData, date: text })}
              accessibilityLabel="Event date"
            />
            <TextInput
              placeholder="Location"
              style={styles.input}
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
              accessibilityLabel="Event location"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.cancelBtn}
                accessibilityLabel="Cancel"
                accessibilityRole="button"
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                style={styles.saveBtn}
                accessibilityLabel={editingEventId ? 'Update event' : 'Save event'}
                accessibilityRole="button"
              >
                <Text style={styles.saveBtnText}>{editingEventId ? 'Update' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF6EC',
  },
  dateSelectionContainer: {
    padding: 20,
  },
  selectedDateContainer: {
    marginBottom: 15,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E2E2E',
  },
  eventsListContainer: {
    flex: 1,
    marginBottom: 50,
    padding: 20,
    paddingBottom: 150,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#F4A941',
  },
  cardContent: {
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B6B63',
    marginBottom: 6,
  },
  eventDetail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#F4A941',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: '90%',
    padding: 20,
    borderRadius: 16,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B6B63',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelBtn: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  cancelBtnText: {
    color: '#444',
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#1B6B63',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#2E2E2E',
    fontSize: 16,
  },
  noEventsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noEventsText: {
    color: '#2E2E2E',
    fontSize: 16,
    marginBottom: 15,
  },
  addEventSmallButton: {
    backgroundColor: '#F4A941',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  addEventSmallButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default EventsScreen;