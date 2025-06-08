import { Platform } from "react-native";
import eventsData from "../event.json";

export type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  startTime: any;
  endTime: any;
  location: string;
  description?: string;
  registered: boolean;
  source: "firebase" | "local"; // Make this required and specific
};

class CalendarService {
  async fetchEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    try {
      // Return events from local JSON only
      return eventsData.events
        .filter((event) => {
          const eventDate = new Date(event.date);
          return eventDate >= startDate && eventDate <= endDate;
        })
        .map((event) => ({
          ...event,
          date: new Date(event.date),
          source: "local",
        }));
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      return [];
    }
  }

  async addEvent(eventData: any): Promise<string | null> {
    try {
      // Validate that the event date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to beginning of day for clear comparison

      if (eventData.date < today) {
        throw new Error("Event date cannot be in the past");
      }

      // This would typically add to local storage or some other mechanism
      // For now, we'll just log and return a mock ID
      console.log("Added local event:", eventData);
      return "local-" + Date.now();
    } catch (error) {
      console.error("Error adding local event:", error);
      throw error; // Re-throw to be handled by caller
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

  async getUserRegistrations(): Promise<{ id: string; eventId: string }[]> {
    // For local service, return empty array since we don't persist registrations
    return [];
  }

  // Helper method to format a date as YYYY-MM-DD
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}

export default new CalendarService();
