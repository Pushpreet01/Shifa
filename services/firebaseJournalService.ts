import { collection, query, where, doc, deleteDoc, getDocs, addDoc, updateDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { db, auth } from "../config/firebaseConfig";
import { analyzeTextSentiment } from "./aiSentimentService";
import { updateUserJournalAggregatesForCurrentUser } from "./aiUserAggregateService";
import { recomputeRecommendationsForCurrentUser } from "./aiRecommendationService";

export const saveJournalEntry = async (title: string, body: string) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("User not logged in");

  const text = `${title}\n\n${body}`.trim();
  const ai = analyzeTextSentiment(text);

  await addDoc(collection(db, "journals"), {
    title,
    body,
    userId: currentUser.uid,
    createdAt: serverTimestamp(),
    ai,
  });

  // Best-effort: update user aggregates and recommendations
  try {
    const { avg30d } = await updateUserJournalAggregatesForCurrentUser();
    await recomputeRecommendationsForCurrentUser(avg30d);
  } catch (e) {
    // Non-blocking
  }
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
export const deleteJournalEntry = async (entryId: string) => {
  const entryRef = doc(db, "journals", entryId);
  await deleteDoc(entryRef);
};

export const updateJournalEntry = async (entryId: string, title: string, body: string) => {
  const entryRef = doc(db, "journals", entryId);
  const text = `${title}\n\n${body}`.trim();
  const ai = analyzeTextSentiment(text);
  await updateDoc(entryRef, {
    title,
    body,
    ai,
  });

  // Best-effort: update user aggregates and recommendations
  try {
    const { avg30d } = await updateUserJournalAggregatesForCurrentUser();
    await recomputeRecommendationsForCurrentUser(avg30d);
  } catch (e) {
    // Non-blocking
  }
};