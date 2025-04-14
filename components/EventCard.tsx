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
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginVertical: 10,
    paddingHorizontal: 15,
    paddingVertical: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color:"#3A7D44",
   marginBottom :8,
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
    backgroundColor: '#9ABF64',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  registeredButton: {
    backgroundColor: '#E0E0E0',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default EventCard;