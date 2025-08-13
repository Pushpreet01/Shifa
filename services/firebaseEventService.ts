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
  getDoc,
} from "firebase/firestore";
import { CalendarEvent } from "./calendarService";
import NotificationService from "./notificationService";
import { analyzeTextSentiment } from "./aiSentimentService";

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
        let approvalStatusObj = data.approvalStatus;
        if (typeof approvalStatusObj === "string") {
          approvalStatusObj = {
            status:
              approvalStatusObj.charAt(0).toUpperCase() +
              approvalStatusObj.slice(1),
          };
        }
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
          approvalStatus: approvalStatusObj,
          needsVolunteers: data.needsVolunteers,
        });
      });

      return events;
    } catch (error) {
      console.error("Error fetching events:", error);
      return [];
    }
  }

  async getEventById(eventId: string): Promise<any | null> {
    try {
      const docRef = doc(db, "events", eventId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching event by ID:", error);
      return null;
    }
  }

  async addEvent(eventData: any): Promise<string | null> {
    try {
      console.log("[addEvent] Starting event creation with data:", eventData);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (eventData.date < today) throw new Error("Event date is in the past");

      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Not logged in");

      console.log("[addEvent] User authenticated:", currentUser.uid);

      console.log("[addEvent] Creating event document...");
      const text = `${eventData?.title || ""}\n\n${eventData?.description || ""}`.trim();
      const ai = analyzeTextSentiment(text);
      const eventRef = await addDoc(collection(db, "events"), {
        ...eventData,
        createdBy: currentUser.uid,
        createdAt: new Date(),
        approvalStatus: "pending", // Set initial status as pending
        ai,
      });
      console.log("[addEvent] Event document created with ID:", eventRef.id);

      console.log(
        "[addEvent] Event creation completed successfully, returning ID:",
        eventRef.id
      );
      return eventRef.id;
    } catch (error) {
      console.error("[addEvent] Error adding event:", error);
      throw error;
    }
  }

  async broadcastEventApproval(eventId: string): Promise<void> {
    try {
      console.log(
        "[broadcastEventApproval] Starting broadcast for event:",
        eventId
      );

      // Get event details
      const eventDoc = await getDoc(doc(db, "events", eventId));
      if (!eventDoc.exists()) {
        throw new Error("Event not found");
      }

      const eventData = eventDoc.data();
      console.log("[broadcastEventApproval] Event data:", eventData);

      // Create announcement
      try {
        console.log("[broadcastEventApproval] Creating announcement...");
        const announcement = {
          type: "new_event",
          message: `A new event has been approved: ${eventData.title}`,
          timestamp: new Date(),
          eventId: eventId,
        };
        await addDoc(collection(db, "announcements"), announcement);
        console.log(
          "[broadcastEventApproval] Announcement created successfully"
        );
      } catch (announcementError) {
        console.error(
          "[broadcastEventApproval] Error creating announcement:",
          announcementError
        );
        // Don't throw here - continue with notifications
      }

      // Send push notifications
      try {
        console.log(
          "[broadcastEventApproval] Starting push notification process..."
        );
        const usersQuery = query(
          collection(db, "users"),
          where("pushToken", "!=", null)
        );
        const usersSnapshot = await getDocs(usersQuery);
        console.log(
          `[broadcastEventApproval] Found ${usersSnapshot.size} users with push tokens.`
        );

        // Send notifications to all users except the event creator
        const creatorId = eventData.createdBy;
        let creatorToken: string | null = null;

        usersSnapshot.forEach((userDoc) => {
          const userData = userDoc.data();
          if (userData.pushToken) {
            if (userDoc.id === creatorId) {
              creatorToken = userData.pushToken;
            } else {
              // Send to all other users
              console.log(
                `[broadcastEventApproval] Sending notification to token: ${userData.pushToken}`
              );
              NotificationService.sendPushNotification(
                userData.pushToken,
                "New Event Announcement",
                `A new event has been approved: ${eventData.title}`,
                { eventId: eventId }
              );
            }
          }
        });

        // Send a separate notification to the event creator
        if (creatorToken) {
          console.log(
            `[broadcastEventApproval] Sending creator notification to token: ${creatorToken}`
          );
          NotificationService.sendPushNotification(
            creatorToken,
            "Event Approved",
            `Your event "${eventData.title}" has been approved and is now live.`,
            { eventId: eventId }
          );
        }
        console.log(
          "[broadcastEventApproval] Push notifications sent successfully"
        );
      } catch (notificationError) {
        console.error(
          "[broadcastEventApproval] Error sending push notifications:",
          notificationError
        );
        // Don't throw here - announcement was already created
      }

      console.log("[broadcastEventApproval] Broadcast completed successfully");
    } catch (error) {
      console.error(
        "[broadcastEventApproval] Error broadcasting event approval:",
        error
      );
      throw error;
    }
  }

  async registerForEvent(eventId: string, phone?: string): Promise<boolean> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Not logged in");

      // Check if already registered
      const q = query(
        collection(db, "registrations"),
        where("eventId", "==", eventId),
        where("userId", "==", currentUser.uid)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        await addDoc(collection(db, "registrations"), {
          eventId,
          userId: currentUser.uid,
          name: currentUser.displayName || "",
          email: currentUser.email || "",
          phone: phone || "",
          timestamp: new Date(),
        });

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
        await deleteDoc(doc(db, "registrations", snapshot.docs[0].id));

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

  async getEventsByCreator(userId: string): Promise<CalendarEvent[]> {
    try {
      const eventsCollection = collection(db, "events");
      const eventsQuery = query(
        eventsCollection,
        where("createdBy", "==", userId)
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
          approvalStatus: data.approvalStatus || "pending",
          createdBy: data.createdBy,
        });
      });
      return events;
    } catch (error) {
      console.error("Error fetching events by creator:", error);
      return [];
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
