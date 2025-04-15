import { Platform } from 'react-native';
import eventsData from '../event.json';

export type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  description?: string;
  registered: boolean;
  source: 'firebase' | 'local'; // Make this required and specific
};

class CalendarService {
  async fetchEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    try {
      // Return events from local JSON only
      return eventsData.events
        .filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= startDate && eventDate <= endDate;
        })
        .map(event => ({
          ...event,
          date: new Date(event.date),
          source: 'local'
        }));
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }
  }
  
  async registerForEvent(eventId: string): Promise<boolean> {
    console.log(`Registered for local event: ${eventId}`);
    return true;
  }
  
  async cancelRegistration(eventId: string): Promise<boolean> {
    console.log(`Cancelled registration for local event: ${eventId}`);
    return true;
  }
}

export default new CalendarService();