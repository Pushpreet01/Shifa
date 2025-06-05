import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { db, auth } from "../config/firebaseConfig";

export const saveJournalEntry = async (title: string, body: string) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("User not logged in");

  await addDoc(collection(db, "journals"), {
    title,
    body,
    userId: currentUser.uid,
    createdAt: serverTimestamp(),
  });
};

export const getUserJournals = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("User not logged in");

  const q = query(
    collection(db, "journals"),
    where("userId", "==", currentUser.uid),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
