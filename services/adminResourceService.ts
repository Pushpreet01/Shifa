import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export async function fetchResources() {
    const snapshot = await getDocs(collection(db, "resources"));
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
}

export async function createResource(data: any) {
    const docRef = await addDoc(collection(db, "resources"), data);
    return { id: docRef.id };
}

export async function updateResource(resourceId: string, data: any) {
    const resourceRef = doc(db, "resources", resourceId);
    await updateDoc(resourceRef, data);
    return true;
}

export async function deleteResource(resourceId: string) {
    const resourceRef = doc(db, "resources", resourceId);
    await deleteDoc(resourceRef);
    return true;
} 