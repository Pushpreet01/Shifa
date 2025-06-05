import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { CalendarEvent } from '../services/calendarService';

interface EventCardProps {
  event: CalendarEvent;
  onRegister: (eventId: string) => Promise<void>;
  onPress: () => void;
  style?: ViewStyle;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onRegister,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, style]} // Apply the style here
    >
      <View style={styles.content}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.time}>
          {event.startTime} - {event.endTime}
        </Text>
        <Text style={styles.location}>{event.location}</Text>
        {event.description && (
          <Text style={styles.description}>{event.description}</Text>
        )}
      </View>
      <TouchableOpacity
        style={[
          styles.registerButton,
          event.registered ? styles.registered : styles.unregistered,
        ]}
        onPress={() => onRegister(event.id)}
        disabled={event.registered}
      >
        <Text style={styles.registerButtonText}>
          {event.registered ? "Registered" : "Register"}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: '#F4A941',
    flexDirection: 'column',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2E2E2E',
    marginBottom: 2,
  },
  time: {
    fontSize: 14,
    color: '#2E2E2E',
    marginBottom: 2,
  },
  location: {
    fontSize: 14,
    color: '#2E2E2E',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#2E2E2E',
    marginBottom: 10,
  },
  registerButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#1B6B63',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 18,
    marginTop: 4,
  },
  registered: {
    backgroundColor: '#2A9D8F',
  },
  unregistered: {
    backgroundColor: '#1B6B63',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default EventCard;
