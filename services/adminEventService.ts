import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export async function fetchEvents() {
    const snapshot = await getDocs(collection(db, "events"));
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
}

export async function createEvent(data: any) {
    const docRef = await addDoc(collection(db, "events"), data);
    return { id: docRef.id };
}

export async function updateEvent(eventId: string, data: any) {
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, data);
    return true;
}

export async function deleteEvent(eventId: string) {
    const eventRef = doc(db, "events", eventId);
    await deleteDoc(eventRef);
    return true;
}

export async function assignVolunteers(eventId: string, volunteerIds: string[]) {
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, { volunteerIds });
    return true;
}

export async function fetchAttendance(eventId: string) {
    const q = query(collection(db, "attendance"), where("eventId", "==", eventId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
}

export async function updateAttendance(eventId: string, attendance: any) {
    // attendance should be an array of { userId, attended }
    // This will overwrite all attendance records for the event
    // (You may want to update individually in a real app)
    const batch = attendance.map(async (att: any) => {
        const attRef = doc(db, "attendance", att.id);
        await updateDoc(attRef, { attended: att.attended });
    });
    await Promise.all(batch);
    return true;
} 