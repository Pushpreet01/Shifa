import { CalendarEvent } from './calendarService';
import eventsData from '../event.json';

class JsonCalendarService {
  // Function to fetch events from JSON data
  async fetchEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    try {
      // Convert ISO date strings to Date objects
      const events = eventsData.events.map(event => ({
        ...event,
        date: new Date(event.date)
      }));
      
      // Filter events within the date range
      return events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= startDate && eventDate <= endDate;
      });
    } catch (error) {
      console.error('Error fetching calendar events from JSON:', error);
      return [];
    }
  }
  
  // Function to register for an event
  async registerForEvent(eventId: string): Promise<boolean> {
    try {
      console.log(`Registered for event: ${eventId}`);
      return true;
    } catch (error) {
      console.error('Error registering for event:', error);
      return false;
    }
  }
  
  // Function to cancel registration for an event
  async cancelRegistration(eventId: string): Promise<boolean> {
    try {
      console.log(`Cancelled registration for event: ${eventId}`);
      return true;
    } catch (error) {
      console.error('Error cancelling registration:', error);
      return false;
    }
  }
}

export default new JsonCalendarService();