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

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    try {
      const token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas.projectId,
        })
      ).data;
      console.log("Obtained push token:", token);

      const currentUser = auth.currentUser;
      if (currentUser && token) {
        await updateDoc(doc(db, "users", currentUser.uid), {
          pushToken: token,
        });
        console.log("Push token saved to Firestore.");
      }
    } catch (error) {
      console.error("Error getting or saving push token:", error);
    }
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
    } catch (error: any) {
      // Suppress FirebaseError: Missing or insufficient permissions
      if (error && error.code === "permission-denied") {
        console.warn(
          "Announcements: insufficient permissions, returning empty list."
        );
        return [];
      }
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

  async sendPushNotification(
    pushToken: string,
    title: string,
    body: string,
    data?: object
  ) {
    const message = {
      to: pushToken,
      sound: "default",
      title: title,
      body: body,
      data: data,
    };

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
    const result = await response.json();
    console.log("Expo push notification response:", result);
  }

  // Configure notification behavior
  configureNotifications() {
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        console.log(
          "Notification received while app is in foreground:",
          JSON.stringify(notification, null, 2)
        );
        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        };
      },
    });
  }
}

export default new NotificationService();
