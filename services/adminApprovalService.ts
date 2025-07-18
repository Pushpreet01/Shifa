import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export async function fetchApprovals(type: 'event' | 'volunteer' | 'organizer') {
    const q = query(collection(db, "approvals"), where("type", "==", type), where("status", "==", "pending"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
}

export async function approveItem(id: string, type: string) {
    const approvalRef = doc(db, "approvals", id);
    await updateDoc(approvalRef, { status: "approved" });
    return true;
}

export async function denyItem(id: string, type: string) {
    const approvalRef = doc(db, "approvals", id);
    await updateDoc(approvalRef, { status: "denied" });
    return true;
} 