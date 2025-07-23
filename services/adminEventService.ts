import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, getDoc } from "firebase/firestore";
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

export async function getEventById(eventId: string) {
    const eventRef = doc(db, "events", eventId);
    const docSnap = await getDoc(eventRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
}

export async function deleteEventCascade(eventId: string) {
    // Delete the event
    const eventRef = doc(db, "events", eventId);
    await deleteDoc(eventRef);

    // Find and delete the associated opportunity
    const oppQuery = query(collection(db, "opportunities"), where("eventId", "==", eventId));
    const oppSnap = await getDocs(oppQuery);
    let opportunityId = null;
    if (!oppSnap.empty) {
        const oppDoc = oppSnap.docs[0];
        opportunityId = oppDoc.id;
        await deleteDoc(doc(db, "opportunities", opportunityId));
    }

    // Delete all volunteerApplications for this opportunity
    if (opportunityId) {
        const appQuery = query(collection(db, "volunteerApplications"), where("opportunityId", "==", opportunityId));
        const appSnap = await getDocs(appQuery);
        for (const docSnap of appSnap.docs) {
            await deleteDoc(doc(db, "volunteerApplications", docSnap.id));
        }
    }

    // Delete all registrations for this event
    const regQuery = query(collection(db, "registrations"), where("eventId", "==", eventId));
    const regSnap = await getDocs(regQuery);
    for (const docSnap of regSnap.docs) {
        await deleteDoc(doc(db, "registrations", docSnap.id));
    }

    return true;
} 