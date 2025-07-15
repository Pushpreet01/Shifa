import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "../config/firebaseConfig";

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  emergencyContacts?: { [key: string]: string };
  notificationSettings?: {
    events: boolean;
    sos: boolean;
    volunteer: boolean;
  };
}

export const getUserProfile = async (
  userId: string
): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (
  userId: string,
  data: Partial<UserProfile>
): Promise<void> => {
  try {
    await updateDoc(doc(db, "users", userId), data);
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const updateNotificationSettings = async (
  userId: string,
  settings: UserProfile["notificationSettings"]
): Promise<void> => {
  try {
    await updateDoc(doc(db, "users", userId), {
      notificationSettings: settings,
    });
  } catch (error) {
    console.error("Error updating notification settings:", error);
    throw error;
  }
};

export const submitFeedback = async (feedback: {
  userId: string;
  message: string;
  type: "bug" | "feature" | "other";
  timestamp: Date;
}): Promise<void> => {
  try {
    await setDoc(
      doc(db, "feedback", `${feedback.userId}_${Date.now()}`),
      feedback
    );
  } catch (error) {
    console.error("Error submitting feedback:", error);
    throw error;
  }
};

export const triggerSOS = async (
  userId: string,
  location?: { lat: number; lng: number }
): Promise<void> => {
  try {
    const user = await getUserProfile(userId);
    if (!user) throw new Error("User not found");

    await setDoc(doc(db, "sosAlerts", `${userId}_${Date.now()}`), {
      userId,
      timestamp: new Date(),
      location,
      status: "active",
      emergencyContacts: user.emergencyContacts || {},
    });

    // Create notifications for emergency contacts
    if (user.emergencyContacts) {
      for (const contactId of Object.keys(user.emergencyContacts)) {
        await setDoc(doc(db, "notifications", `${contactId}_${Date.now()}`), {
          userId: contactId,
          type: "sos",
          message: `Emergency alert from ${user.name}`,
          timestamp: new Date(),
          status: "unread",
          sourceUserId: userId,
        });
      }
    }
  } catch (error) {
    console.error("Error triggering SOS:", error);
    throw error;
  }
};

export const getAllPushTokens = async (): Promise<string[]> => {
  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const tokens: string[] = [];
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.pushToken) {
        tokens.push(userData.pushToken);
      }
    });
    return tokens;
  } catch (error) {
    console.error("Error getting all push tokens:", error);
    return [];
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};
