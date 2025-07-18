import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export async function fetchUsers(role?: string) {
    let q = collection(db, "users");
    if (role) {
        q = query(q, where("role", "==", role), where("approved", "==", true));
    } else {
        q = query(q, where("approved", "==", true));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
}

/**
 * Ban or unban a user by setting the 'approved' field.
 * @param userId The user's document ID
 * @param approved Pass false to ban, true to unban
 */
export async function banUser(userId: string, approved: boolean) {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { approved });
    return true;
} 