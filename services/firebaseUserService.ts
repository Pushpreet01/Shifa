import { doc, getDoc, updateDoc, setDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../config/firebaseConfig";
import { deleteUser } from "firebase/auth";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getAuth, deleteUser as deleteAuthUser } from "firebase/auth";

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

export const deleteCurrentUserAndData = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user is currently signed in.");
  const userId = user.uid;
  // Delete user document
  await deleteDoc(doc(db, "users", userId));
  // Optionally: delete related feedback
  const feedbackQuery = query(collection(db, "feedback"), where("userId", "==", userId));
  const feedbackSnap = await getDocs(feedbackQuery);
  for (const docSnap of feedbackSnap.docs) {
    await deleteDoc(doc(db, "feedback", docSnap.id));
  }
  // Optionally: delete related sosAlerts
  const sosQuery = query(collection(db, "sosAlerts"), where("userId", "==", userId));
  const sosSnap = await getDocs(sosQuery);
  for (const docSnap of sosSnap.docs) {
    await deleteDoc(doc(db, "sosAlerts", docSnap.id));
  }
  // Optionally: delete related notifications
  const notifQuery = query(collection(db, "notifications"), where("userId", "==", userId));
  const notifSnap = await getDocs(notifQuery);
  for (const docSnap of notifSnap.docs) {
    await deleteDoc(doc(db, "notifications", docSnap.id));
  }
  // Delete user from Auth
  await deleteUser(user);
};

export const signOut = async (): Promise<void> => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Fetch all users with role 'Admin'
export const getAllAdmins = async () => {
  try {
    const q = query(collection(db, "users"), where("role", "==", "Admin"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching admins:", error);
    throw error;
  }
};

// Create a new admin user (for Super Admin)
export const createAdminUser = async ({ fullName, email, phoneNumber, password }: { fullName: string; email: string; phoneNumber: string; password: string; }) => {
  try {
    // 1. Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;

    // 2. Create user document in Firestore
    await setDoc(doc(db, "users", userId), {
      fullName,
      email,
      phoneNumber,
      role: "Admin",
      approvalStatus: { status: "Approved" },
      createdAt: new Date().toISOString(),
      emailVerified: true,
    });
    return userId;
  } catch (error: any) {
    // If user was created in Auth but Firestore failed, consider deleting the Auth user
    throw error;
  }
};

// Delete an admin user (for Super Admin)
export const deleteAdminUser = async (userId: string) => {
  try {
    // Delete user document from Firestore
    await deleteDoc(doc(db, "users", userId));
    // Optionally, delete the user from Firebase Auth (requires admin privileges on backend)
    // If running in client, you cannot delete another user from Auth directly
    // This will only delete the Firestore document
    return true;
  } catch (error) {
    throw error;
  }
};
