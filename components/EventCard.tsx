
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { CalendarEvent } from '../services/calendarService';

interface EventCardProps {
  event: CalendarEvent;
  onRegister: (eventId: string) => Promise<void>;
  onPress: () => void;
  style?: ViewStyle;
}

const EventCard: React.FC<EventCardProps> = ({ event, onRegister, onPress, style }) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.container, style]} // Apply the style here
    >
      <View style={styles.content}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.time}>{event.startTime} - {event.endTime}</Text>
        <Text style={styles.location}>{event.location}</Text>
        {event.description && (
          <Text style={styles.description}>{event.description}</Text>
        )}
      </View>
      <TouchableOpacity
        style={[
          styles.registerButton,
          event.registered ? styles.registered : styles.unregistered
        ]}
        onPress={() => onRegister(event.id)}
      >
        <Text style={styles.registerButtonText}>
          {event.registered ? 'Registered' : 'Register'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3A7D44',
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#333',
  },
  registerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  registered: {
    backgroundColor: '#4CAF50',
  },
  unregistered: {
    backgroundColor: '#3A7D44',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default EventCard;