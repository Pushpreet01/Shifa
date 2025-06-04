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
    backgroundColor: '#EFF6F6',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#2E2E2E',
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
    color: '#2E2E2E',
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
    color: '#2E2E2E',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#2E2E2E',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#2E2E2E',
  },
  registerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  registered: {
    backgroundColor: '#1B6B63',
  },
  unregistered: {
    backgroundColor: '#1B6B63',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default EventCard;