import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CalendarEvent } from '../services/calendarService';

interface EventCardProps {
  event: CalendarEvent;
  onRegister: (eventId: string) => void;
  onPress: () => void; // 👈 NEW
}

const EventCard: React.FC<EventCardProps> = ({ event, onRegister, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <View style={styles.eventCard}>
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDetails}>
            {event.date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })} | {event.startTime} - {event.endTime}
          </Text>
          <Text style={styles.eventLocation}>{event.location}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.registerButton,
            event.registered && styles.registeredButton
          ]}
          onPress={() => onRegister(event.id)}
        >
          <Text style={styles.registerButtonText}>
            {event.registered ? 'Unregister' : 'Register'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginVertical: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventInfo: {
    flex: 1,
    marginRight: 10,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3A7D44",
    marginBottom: 6,
  },
  eventDetails: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 13,
    color: '#666',
  },
  registerButton: {
    backgroundColor: '#3A7D44',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  registeredButton: {
    backgroundColor: '#E0E0E0',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default EventCard;
