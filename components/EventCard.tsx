// components/EventCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CalendarEvent } from '../services/calendarService';

interface EventCardProps {
  event: CalendarEvent;
  onRegister: (eventId: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onRegister }) => {
  return (
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
          {event.registered ? 'Registered' : 'Register'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3A7D44',
    marginBottom: 5,
  },
  eventDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  eventLocation: {
    fontSize: 12,
    color: '#666',
  },
  registerButton: {
    backgroundColor: '#9DC08B',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
  },
  registeredButton: {
    backgroundColor: '#E0E0E0',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
});

export default EventCard;