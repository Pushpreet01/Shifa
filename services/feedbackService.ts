import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../config/firebaseConfig";

export interface Feedback {
  userId: string;
  rating: number;
  comment: string;
  timestamp: Date;
  category?: string;
}

export const submitFeedback = async (
  feedback: Omit<Feedback, "userId" | "timestamp">
): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("User not logged in");

    await addDoc(collection(db, "feedback"), {
      ...feedback,
      userId: currentUser.uid,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    throw error;
  }
};
