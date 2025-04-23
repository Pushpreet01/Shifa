import { db, auth } from "../config/firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { CalendarEvent } from "./calendarService";

class FirebaseEventService {
  async fetchEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    try {
      // Create a query to get events within the date range
      const eventsCollection = collection(db, "events");
      const eventsQuery = query(
        eventsCollection,
        where("date", ">=", startDate),
        where("date", "<=", endDate)
      );
      const querySnapshot = await getDocs(eventsQuery);

      const events: CalendarEvent[] = [];
      const currentUser = auth.currentUser;
      const userId = currentUser ? currentUser.uid : "guest";

      // Process the query results
      querySnapshot.forEach((doc) => {
        const eventData = doc.data();
        events.push({
          id: doc.id,
          title: eventData.title,
          date: eventData.date.toDate(),
          startTime: eventData.startTime,
          endTime: eventData.endTime,
          location: eventData.location,
          description: eventData.description || "",
          registered: eventData.registered || false,
          source: 'firebase',
        });

        // Check if current user is registered for this event
        // (This would normally be a separate query against a registrations collection)
      });

      return events;
    } catch (error) {
      console.error("Error fetching events from Firebase:", error);
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
      
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User must be logged in to create events");
      }

      const eventRef = await addDoc(collection(db, "events"), {
        ...eventData,
        createdBy: currentUser.uid,
        createdAt: new Date(),
      });

      return eventRef.id;
    } catch (error) {
      console.error("Error adding event to Firebase:", error);
      throw error; // Re-throw the error to be handled by the caller
    }
  }

  async registerForEvent(eventId: string): Promise<boolean> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User must be logged in to register for events");
      }

      // Check if user is already registered
      const registrationsCollection = collection(db, "registrations");
      const q = query(
        registrationsCollection,
        where("eventId", "==", eventId),
        where("userId", "==", currentUser.uid)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // User is not registered, add registration
        await addDoc(registrationsCollection, {
          eventId,
          userId: currentUser.uid,
          timestamp: new Date(),
        });
      }

      return true;
    } catch (error) {
      console.error("Error registering for event:", error);
      return false;
    }
  }

  async cancelRegistration(eventId: string): Promise<boolean> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User must be logged in to cancel registrations");
      }

      // Find the registration document
      const registrationsCollection = collection(db, "registrations");
      const q = query(
        registrationsCollection,
        where("eventId", "==", eventId),
        where("userId", "==", currentUser.uid)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Delete the registration document
        await deleteDoc(doc(db, "registrations", querySnapshot.docs[0].id));
      }

      return true;
    } catch (error) {
      console.error("Error cancelling registration:", error);
      return false;
    }
  }

  // Helper method to format a date as YYYY-MM-DD
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

export default new FirebaseEventService();