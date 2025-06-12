import React, { useState } from 'react';
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
} from 'react-native';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import AdminHeroBox from '../../components/AdminHeroBox';
import { useNavigation } from '@react-navigation/native';

type Event = {
  id: string;
  title: string;
  date: string;
  location: string;
};

const EventsScreen = () => {
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Mental Health Awareness Drive',
      date: '2024-06-25',
      location: 'Calgary Community Center',
    },
    {
      id: '2',
      title: 'Substance Abuse Prevention Seminar',
      date: '2024-07-02',
      location: 'SAIT Wellness Hall',
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({ id: '', title: '', date: '', location: '' });
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const navigation = useNavigation<any>();

  const openModal = (event?: Event) => {
    if (event) {
      setFormData(event);
      setEditingEventId(event.id);
    } else {
      setFormData({ id: '', title: '', date: '', location: '' });
      setEditingEventId(null);
    }
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.date || !formData.location) return;

    if (editingEventId) {
      setEvents((prev) =>
        prev.map((ev) => (ev.id === editingEventId ? { ...formData } : ev))
      );
    } else {
      setEvents((prev) => [...prev, { ...formData, id: Date.now().toString() }]);
    }

    setModalVisible(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Event', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Delete', onPress: () => setEvents((prev) => prev.filter((e) => e.id !== id)) },
    ]);
  };

  const renderRightActions = (eventId: string) => (
    <View style={styles.swipeButtons}>
      <TouchableOpacity
        style={[styles.swipeButton, { backgroundColor: '#1B6B63' }]}
        onPress={() => console.log('Approved', eventId)}
      >
        <Ionicons name="checkmark" size={24} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.swipeButton, { backgroundColor: '#C44536' }]}
        onPress={() => handleDelete(eventId)}
      >
        <Ionicons name="close" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <AdminHeroBox title="Manage Events" showBackButton customBackRoute="AdminDashboard" />

        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <TouchableOpacity style={styles.createButton} onPress={() => openModal()}>
            <Ionicons name="add-circle-outline" size={20} color="#1B6B63" />
            <Text style={styles.createButtonText}>Create New Event</Text>
          </TouchableOpacity>

          {events.map((event) => (
            <Swipeable key={event.id} renderRightActions={() => renderRightActions(event.id)}>
              <View style={styles.card}>
                <View style={styles.cardContent}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDetail}>📅 {event.date}</Text>
                  <Text style={styles.eventDetail}>📍 {event.location}</Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => openModal(event)}>
                    <Ionicons name="create-outline" size={20} color="#1B6B63" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigation.navigate('AssignVolunteers')}>
                    <Ionicons name="people-outline" size={20} color="#F4A941" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigation.navigate('AttendanceReport')}>
                    <Ionicons name="clipboard-outline" size={20} color="#3f8390" />
                  </TouchableOpacity>
                </View>
              </View>
            </Swipeable>
          ))}
        </ScrollView>

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
              />
              <TextInput
                placeholder="Date (YYYY-MM-DD)"
                style={styles.input}
                value={formData.date}
                onChangeText={(text) => setFormData({ ...formData, date: text })}
              />
              <TextInput
                placeholder="Location"
                style={styles.input}
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                  <Text style={{ color: '#444' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                  <Text style={{ color: '#fff' }}>{editingEventId ? 'Update' : 'Save'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#E0F2F1',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  createButtonText: {
    color: '#1B6B63',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#FDF6EC',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  cardContent: { flex: 1 },
  cardActions: {
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginLeft: 16,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B6B63',
    marginBottom: 4,
  },
  eventDetail: {
    fontSize: 14,
    color: '#555',
  },
  swipeButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  swipeButton: {
    width: 50,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
  saveBtn: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#1B6B63',
  },
});

export default EventsScreen;
