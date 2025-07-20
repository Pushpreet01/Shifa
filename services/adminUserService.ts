import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export async function fetchUsers(role?: string) {
    const baseRef = collection(db, "users");
    let q;
    if (role) {
        q = query(baseRef, where("role", "==", role), where("approvalStatus.status", "==", "Approved"));
    } else {
        q = query(baseRef, where("approvalStatus.status", "==", "Approved"));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
}

/**
 * Ban or unban a user by setting the 'approvalStatus' field.
 * @param userId The user's document ID
 * @param approved Pass false to ban, true to unban
 */
export async function banUser(userId: string, approved: boolean) {
    const userRef = doc(db, "users", userId);
    if (approved) {
        await updateDoc(userRef, { approvalStatus: { status: "Approved" } });
    } else {
        await updateDoc(userRef, { approvalStatus: { status: "Rejected", reason: "Banned by admin." } });
    }
    return true;
} 