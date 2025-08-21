import { collection, addDoc, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../config/firebaseConfig";

export interface Feedback {
  userId: string;
  rating: number;
  comment: string;
  timestamp: Date;
  category?: string;
  status?: 'pending' | 'reviewed' | 'resolved';
}

export interface FeedbackWithUserInfo {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  timestamp: any;
  category?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  userInfo?: {
    fullName: string;
    email: string;
    phoneNumber?: string;
    role: string;
    profileImage?: string;
    approvalStatus?: {
      status: string;
      reason?: string;
    };
  };
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
      status: 'pending',
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    throw error;
  }
};

export const getAllFeedbacks = async (): Promise<FeedbackWithUserInfo[]> => {
  try {
    const feedbackCollection = collection(db, 'feedback');
    const feedbackSnapshot = await getDocs(feedbackCollection);

    const feedbacksData: FeedbackWithUserInfo[] = [];

    for (const feedbackDoc of feedbackSnapshot.docs) {
      const feedbackData = feedbackDoc.data();

      // Fetch user information
      let userInfo: FeedbackWithUserInfo['userInfo'] = undefined;
      if (feedbackData.userId) {
        try {
          const userDoc = await getDoc(doc(db, 'users', feedbackData.userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            userInfo = {
              fullName: userData.fullName || 'Unknown User',
              email: userData.email || 'No email',
              phoneNumber: userData.phoneNumber || 'No phone',
              role: userData.role || 'Unknown',
              profileImage: userData.profileImage || null,
              approvalStatus: userData.approvalStatus || { status: 'Unknown' },
            };
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      }

      feedbacksData.push({
        id: feedbackDoc.id,
        userId: feedbackData.userId || 'Unknown',
        rating: feedbackData.rating || 0,
        comment: feedbackData.comment || 'No comment',
        timestamp: feedbackData.timestamp,
        category: feedbackData.category,
        status: feedbackData.status || 'pending',
        userInfo,
      });
    }

    // Sort by timestamp (newest first)
    feedbacksData.sort((a, b) => {
      const aTime = a.timestamp?.toDate?.() || new Date(0);
      const bTime = b.timestamp?.toDate?.() || new Date(0);
      return bTime.getTime() - aTime.getTime();
    });

    return feedbacksData;
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    throw error;
  }
};
