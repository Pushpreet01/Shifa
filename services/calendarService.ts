// services/CalendarService.ts
import { Platform } from 'react-native';

export type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  description?: string;
  registered: boolean;
};

class CalendarService {
  // API key for Google Calendar API - you'll need to get this from Google Cloud Console
  private apiKey: string = 'YOUR_GOOGLE_API_KEY';
  private calendarId: string = 'primary'; // 'primary' is the user's primary calendar

  // Function to fetch events from Google Calendar
  async fetchEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    try {
      // If you're just starting with development, return mock data
      // In a real implementation, you'd make an actual API call
      return this.getMockEvents();
      
      // The commented code below shows how you would implement this with a real API call
      /*
      const timeMin = startDate.toISOString();
      const timeMax = endDate.toISOString();
      
      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(this.calendarId)}/events?key=${this.apiKey}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.error) {
        console.error('Google Calendar API error:', data.error);
        return [];
      }
      
      return data.items.map(item => ({
        id: item.id,
        title: item.summary,
        date: new Date(item.start.dateTime || item.start.date),
        startTime: this.formatTime(new Date(item.start.dateTime || item.start.date)),
        endTime: this.formatTime(new Date(item.end.dateTime || item.end.date)),
        location: item.location || 'No location specified',
        description: item.description || '',
        registered: false, // This would need to be determined by your app's registration system
      }));
      */
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }
  }
  
  // Function to register for an event
  // In a real implementation, this would make an API call to your backend
  async registerForEvent(eventId: string): Promise<boolean> {
    try {
      // Here you would make an API call to your backend to register the user
      // For now, just return success
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
      // Here you would make an API call to your backend to cancel registration
      // For now, just return success
      console.log(`Cancelled registration for event: ${eventId}`);
      return true;
    } catch (error) {
      console.error('Error cancelling registration:', error);
      return false;
    }
  }
  
  // Helper function to format time
  private formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
  
  // Mock data for development
  private getMockEvents(): CalendarEvent[] {
    return [
      {
        id: '1',
        title: 'Community Garden Day',
        date: new Date(2023, 7, 17), // August 17, 2023
        startTime: '10:00 AM',
        endTime: '2:00 PM',
        location: 'Central Park',
        description: 'Join us for a day of gardening and community building!',
        registered: false
      },
      {
        id: '2',
        title: 'Food Drive Volunteer',
        date: new Date(2023, 7, 17), // August 17, 2023
        startTime: '9:00 AM',
        endTime: '12:00 PM',
        location: 'Community Center',
        description: 'Help collect and distribute food to those in need.',
        registered: true
      },
      {
        id: '3',
        title: 'Environmental Cleanup',
        date: new Date(2023, 7, 18), // August 18, 2023
        startTime: '8:00 AM',
        endTime: '11:00 AM',
        location: 'Riverside Park',
        description: 'Help clean up our local park and protect our environment.',
        registered: false
      }
    ];
  }
}

export default new CalendarService();