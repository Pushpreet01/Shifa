import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  limit,
} from "firebase/firestore";
import { db, auth } from "../config/firebaseConfig";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

export interface NotificationItem {
  id: string;
  userId: string;
  type:
    | "event"
    | "new_event"
    | "sos"
    | "volunteer_application"
    | "volunteer_status"
    | "system";
  message: string;
  timestamp: Date;
  status: "read" | "unread";
  eventId?: string;
  sourceUserId?: string;
}

export interface AnnouncementItem {
  id: string;
  type: "new_event";
  message: string;
  timestamp: Date;
  eventId?: string;
}

class NotificationService {
  async requestPermissions() {
    let token;
    if (Constants.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;

      // Store the token in the user's document
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateDoc(doc(db, "users", currentUser.uid), {
          expoPushToken: token,
        });
      }
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  }

  async getAnnouncements(): Promise<AnnouncementItem[]> {
    try {
      const q = query(
        collection(db, "announcements"),
        orderBy("timestamp", "desc"),
        limit(20)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      })) as AnnouncementItem[];
    } catch (error) {
      console.error("Error getting announcements:", error);
      return [];
    }
  }

  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Not logged in");

      const q = query(
        collection(db, "notifications"),
        where("userId", "==", currentUser.uid),
        orderBy("timestamp", "desc"),
        limit(50)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      })) as NotificationItem[];
    } catch (error) {
      console.error("Error getting notifications:", error);
      return [];
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, "notifications", notificationId);
      await updateDoc(notificationRef, {
        status: "read",
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Not logged in");

      const q = query(
        collection(db, "notifications"),
        where("userId", "==", currentUser.uid),
        where("status", "==", "unread")
      );

      const snapshot = await getDocs(q);
      const batch = snapshot.docs.map((doc) =>
        updateDoc(doc.ref, { status: "read" })
      );

      await Promise.all(batch);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return 0;

      const q = query(
        collection(db, "notifications"),
        where("userId", "==", currentUser.uid),
        where("status", "==", "unread")
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }
  }

  // Configure notification behavior
  configureNotifications() {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }
}

export default new NotificationService();
