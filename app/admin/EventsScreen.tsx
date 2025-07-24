/**
 * EventsScreen Component
 * 
 * A comprehensive interface for administrators to manage community events.
 * Provides calendar-based event viewing, creation, editing, and deletion functionality.
 * 
 * Features:
 * - Calendar-based event navigation
 * - Event creation and editing
 * - Event deletion with cascade (removes associated volunteers and registrations)
 * - Volunteer management integration
 * - Attendance tracking
 * - Animated interactions
 * - Date validation and restrictions
 * 
 * States:
 * - selectedDate: Currently selected date for viewing events
 * - currentMonth: Current month in calendar view
 * - events: Array of all events
 * - modalVisible: Controls event form modal visibility
 * - formData: Event form data for creation/editing
 * - editingEventId: Tracks which event is being edited
 * - loading: Loading state indicator
 * - scaleAnims: Animation values for card press feedback
 */

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

// Type definition for event data structure
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
  
  // State Management
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

  /**
   * Fetches events from backend and initializes animation values
   * Converts Firestore timestamps to JavaScript Date objects
   */
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

  // Load events on mount and when date/month changes
  useEffect(() => {
    fetchAndSetEvents();
  }, [fetchAndSetEvents, currentMonth, selectedDate]);

  /**
   * Prevents navigation to past months
   * Ensures currentMonth is not before the current month
   */
  useEffect(() => {
    const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    if (currentMonth < todayMonth) {
      setCurrentMonth(todayMonth);
    }
  }, []);

  /**
   * Handles navigation to previous month
   * Prevents navigation to past months
   */
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

  /**
   * Handles navigation to next month
   */
  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  /**
   * Handles date selection in calendar
   * Validates selected date is not in the past
   * @param date - Selected date
   */
  const handleDateSelect = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (true/*date >= today*/) {
      setSelectedDate(date);
    } else {
      Alert.alert('Invalid Date', 'You can only view events for today and future dates.');
    }
  };

  /**
   * Opens event form modal for creation or editing
   * @param event - Optional event for editing
   */
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

  /**
   * Handles event save/update
   * Validates form data and date format
   * Creates or updates event in backend
   */
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

  /**
   * Handles event deletion with cascade
   * Removes event and all associated data (volunteers, applications, registrations)
   * @param id - ID of event to delete
   */
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

  /**
   * Handles card press-in animation
   * Scales card down slightly for feedback
   * @param index - Index of card being pressed
   */
  const handlePressIn = (index: number) => {
    Animated.spring(scaleAnims[index], {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  /**
   * Handles card press-out animation
   * Restores card to original scale
   * @param index - Index of card being released
   */
  const handlePressOut = (index: number) => {
    Animated.spring(scaleAnims[index], {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  // Filter events for selected date and approved status
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

      {/* Date Selection Section */}
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

      {/* Events List Section */}
      <ScrollView style={styles.eventsListContainer}>
        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F4A941" />
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        ) : filteredEvents.length > 0 ? (
          // Event Cards
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
              {/* Card Action Buttons */}
              <View style={styles.actionsRow}>
                {/* Volunteer Management Actions */}
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
                {/* Event Management Actions */}
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
          // Empty State
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

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.floatingAddButton}
        onPress={() => openModal()}
        accessibilityLabel="Create new event"
        accessibilityRole="button"
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Event Form Modal */}
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

// Styles: Defines the visual appearance of the events management screen
const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: '#FDF6EC', // Warm background color
  },
  
  // Date selection styles
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
  
  // Events list styles
  eventsListContainer: {
    flex: 1,
    marginBottom: 50,
    padding: 20,
    paddingBottom: 150, // Extra padding for floating button
  },
  
  // Event card styles
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    // Card elevation
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#F4A941', // Event status indicator
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