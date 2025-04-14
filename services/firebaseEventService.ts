import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    Timestamp,
    doc,
    deleteDoc,
    updateDoc
  } from 'firebase/firestore';
  import { db } from '../firebaseConfig';
  import { CalendarEvent } from './calendarService';
  
  // Interface for the event data structure
  interface EventData {
    title: string;
    date: Date;
    startTime: string;
    endTime: string;
    location: string;
    description: string;
  }
  
  // Firebase service for event operations
  const firebaseEventService = {
    // Add a new event to Firestore
    async addEvent(eventData: EventData): Promise<string | null> {
      try {
        // Convert JS Date to Firestore Timestamp
        const firestoreData = {
          ...eventData,
          date: Timestamp.fromDate(eventData.date),
          createdAt: Timestamp.now()
        };
  
        const docRef = await addDoc(collection(db, 'events'), firestoreData);
        return docRef.id;
      } catch (error) {
        console.error('Error adding event to Firestore:', error);
        return null;
      }
    },
  
    // Fetch events for a given date range
    async fetchEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
      try {
        const eventsRef = collection(db, 'events');
        const startTimestamp = Timestamp.fromDate(startDate);
        const endTimestamp = Timestamp.fromDate(endDate);
        
        const q = query(
          eventsRef,
          where('date', '>=', startTimestamp),
          where('date', '<=', endTimestamp)
        );
  
        const querySnapshot = await getDocs(q);
        const events: CalendarEvent[] = [];
        
        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          
          // Check if user is registered for this event
          const isRegistered = await this.checkRegistration(doc.id);
          
          events.push({
            id: doc.id,
            title: data.title,
            date: data.date.toDate(),
            startTime: data.startTime,
            endTime: data.endTime,
            location: data.location,
            description: data.description || '',
            registered: isRegistered
          });
        }
        
        return events;
      } catch (error) {
        console.error('Error fetching events from Firestore:', error);
        return [];
      }
    },
  
    // Check if the current user is registered for an event
    async checkRegistration(eventId: string, userId: string = 'current-user'): Promise<boolean> {
      try {
        const registrationsRef = collection(db, 'registrations');
        const q = query(
          registrationsRef,
          where('eventId', '==', eventId),
          where('userId', '==', userId)
        );
        
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
      } catch (error) {
        console.error('Error checking registration:', error);
        return false;
      }
    },
  
    // Register the current user for an event
    async registerForEvent(eventId: string, userId: string = 'current-user'): Promise<boolean> {
      try {
        // Check if already registered
        const isRegistered = await this.checkRegistration(eventId, userId);
        if (isRegistered) {
          return true; // Already registered
        }
        
        // Add registration
        await addDoc(collection(db, 'registrations'), {
          eventId,
          userId,
          timestamp: Timestamp.now()
        });
        
        return true;
      } catch (error) {
        console.error('Error registering for event:', error);
        return false;
      }
    },
  
    // Cancel registration for an event
    async cancelRegistration(eventId: string, userId: string = 'current-user'): Promise<boolean> {
      try {
        const registrationsRef = collection(db, 'registrations');
        const q = query(
          registrationsRef,
          where('eventId', '==', eventId),
          where('userId', '==', userId)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          return false; // Not registered
        }
        
        // Delete all matching registrations (should be just one)
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        
        return true;
      } catch (error) {
        console.error('Error cancelling registration:', error);
        return false;
      }
    }
  };
  
  export default firebaseEventService;