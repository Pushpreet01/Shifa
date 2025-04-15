import { 
  collection, addDoc, getDocs, query, where, 
  doc, deleteDoc, updateDoc, Timestamp, serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { CalendarEvent } from "./calendarService";
import eventsData from "../event.json";

interface EventData {
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
}

const firebaseEventService = {
  async addEvent(eventData: EventData): Promise<string | null> {
    try {
      const docRef = await addDoc(collection(db, "events"), {
        title: eventData.title,
        date: Timestamp.fromDate(eventData.date),
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        location: eventData.location,
        description: eventData.description,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding event to Firestore:", error);
      return null;
    }
  },

  async fetchEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    try {
      // Get events from Firebase
      const eventsRef = collection(db, "events");
      const startTimestamp = Timestamp.fromDate(startDate);
      const endTimestamp = Timestamp.fromDate(endDate);

      const q = query(
        eventsRef,
        where("date", ">=", startTimestamp),
        where("date", "<=", endTimestamp)
      );

      const querySnapshot = await getDocs(q);
      const firebaseEvents: CalendarEvent[] = [];

      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        const isRegistered = await this.checkRegistration(doc.id);

        firebaseEvents.push({
          id: doc.id,
          title: data.title,
          date: data.date.toDate(),
          startTime: data.startTime,
          endTime: data.endTime,
          location: data.location,
          description: data.description || "",
          registered: isRegistered,
          source: 'firebase'
        });
      }

      // Get events from local JSON
      const jsonEvents: CalendarEvent[] = eventsData.events
        .filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= startDate && eventDate <= endDate;
        })
        .map(event => ({
          id: event.id,
          title: event.title,
          date: new Date(event.date),
          startTime: event.startTime,
          endTime: event.endTime,
          location: event.location,
          description: event.description || "",
          registered: event.registered || false,
          source: 'local'
        }));

      return [...firebaseEvents, ...jsonEvents];
    } catch (error) {
      console.error("Error fetching events:", error);
      // Fallback to local events
      return eventsData.events
        .filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= startDate && eventDate <= endDate;
        })
        .map(event => ({
          id: event.id,
          title: event.title,
          date: new Date(event.date),
          startTime: event.startTime,
          endTime: event.endTime,
          location: event.location,
          description: event.description || "",
          registered: event.registered || false,
          source: 'local'
        }));
    }
  },

  async checkRegistration(eventId: string, userId: string = "current-user"): Promise<boolean> {
    try {
      const registrationsRef = collection(db, "registrations");
      const q = query(
        registrationsRef,
        where("eventId", "==", eventId),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking registration:", error);
      return false;
    }
  },

  async registerForEvent(eventId: string, userId: string = "current-user"): Promise<boolean> {
    try {
      const isRegistered = await this.checkRegistration(eventId, userId);
      if (isRegistered) return true;

      await addDoc(collection(db, "registrations"), {
        eventId,
        userId,
        timestamp: Timestamp.now(),
      });
      return true;
    } catch (error) {
      console.error("Error registering for event:", error);
      return false;
    }
  },

  async cancelRegistration(eventId: string, userId: string = "current-user"): Promise<boolean> {
    try {
      const registrationsRef = collection(db, "registrations");
      const q = query(
        registrationsRef,
        where("eventId", "==", eventId),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return false;

      const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      return true;
    } catch (error) {
      console.error("Error cancelling registration:", error);
      return false;
    }
  }
};

export default firebaseEventService;