import { db, auth } from "../config/firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  increment,
  writeBatch,
} from "firebase/firestore";
import { CalendarEvent } from "./calendarService";

class FirebaseEventService {
  async fetchEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    try {
      const eventsCollection = collection(db, "events");
      const eventsQuery = query(
        eventsCollection,
        where("date", ">=", startDate),
        where("date", "<=", endDate)
      );
      const querySnapshot = await getDocs(eventsQuery);

      const events: CalendarEvent[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
          id: doc.id,
          title: data.title,
          date: data.date.toDate(),
          startTime: data.startTime,
          endTime: data.endTime,
          location: data.location,
          description: data.description || "",
          registered: false,
          source: "firebase",
        });
      });

      return events;
    } catch (error) {
      console.error("Error fetching events:", error);
      return [];
    }
  }

  async addEvent(eventData: any): Promise<string | null> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (eventData.date < today) throw new Error("Event date is in the past");

      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Not logged in");

      const eventRef = await addDoc(collection(db, "events"), {
        ...eventData,
        createdBy: currentUser.uid,
        createdAt: new Date(),
      });

      // Create a global announcement for the new event
      const announcement = {
        type: "new_event",
        message: `A new event has been posted: ${eventData.title}`,
        timestamp: new Date(),
        eventId: eventRef.id,
      };
      await addDoc(collection(db, "announcements"), announcement);

      return eventRef.id;
    } catch (error) {
      console.error("Error adding event:", error);
      throw error;
    }
  }

  async registerForEvent(eventId: string, phone?: string): Promise<boolean> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Not logged in");

      // First check if already registered
      const q = query(
        collection(db, "registrations"),
        where("eventId", "==", eventId),
        where("userId", "==", currentUser.uid)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Add registration
        await addDoc(collection(db, "registrations"), {
          eventId,
          userId: currentUser.uid,
          name: currentUser.displayName || "",
          email: currentUser.email || "",
          phone: phone || "",
          timestamp: new Date(),
        });

        // Update event document to increment registration count
        const eventRef = doc(db, "events", eventId);
        await updateDoc(eventRef, {
          registrationCount: increment(1),
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error("Error registering:", error);
      return false;
    }
  }

  async cancelRegistration(eventId: string): Promise<boolean> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Not logged in");

      const q = query(
        collection(db, "registrations"),
        where("eventId", "==", eventId),
        where("userId", "==", currentUser.uid)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        // Delete registration
        await deleteDoc(doc(db, "registrations", snapshot.docs[0].id));

        // Update event document to decrement registration count
        const eventRef = doc(db, "events", eventId);
        await updateDoc(eventRef, {
          registrationCount: increment(-1),
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error("Error cancelling registration:", error);
      return false;
    }
  }

  async getUserRegistrations(): Promise<any[]> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Not logged in");

      const q = query(
        collection(db, "registrations"),
        where("userId", "==", currentUser.uid)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting user registrations:", error);
      return [];
    }
  }

  async checkRegistration(eventId: string): Promise<boolean> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return false;

      const q = query(
        collection(db, "registrations"),
        where("eventId", "==", eventId),
        where("userId", "==", currentUser.uid)
      );
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error("Error checking registration:", error);
      return false;
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}

export default new FirebaseEventService();
