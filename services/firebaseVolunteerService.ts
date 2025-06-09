import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export interface VolunteerApplication {
  applicationId: string;
  userId: string;
  eventId: string;
  organizerId: string;
  status: "pending" | "approved" | "rejected";
  timestamp: Date;
  skills?: string[];
  experience?: string;
  message?: string;
}

export const applyForVolunteer = async (
  application: Omit<
    VolunteerApplication,
    "applicationId" | "status" | "timestamp"
  >
): Promise<void> => {
  try {
    const applicationId = `${application.userId}_${application.eventId}`;
    await setDoc(doc(db, "volunteerApplications", applicationId), {
      ...application,
      applicationId,
      status: "pending",
      timestamp: new Date(),
    });

    // Notify the organizer
    await setDoc(
      doc(db, "notifications", `${application.organizerId}_${Date.now()}`),
      {
        userId: application.organizerId,
        type: "volunteer_application",
        message: `New volunteer application for your event`,
        timestamp: new Date(),
        status: "unread",
        eventId: application.eventId,
        applicantId: application.userId,
      }
    );
  } catch (error) {
    console.error("Error applying for volunteer:", error);
    throw error;
  }
};

export const getVolunteerApplications = async (
  userId: string,
  asOrganizer: boolean = false
): Promise<VolunteerApplication[]> => {
  try {
    const q = query(
      collection(db, "volunteerApplications"),
      where(asOrganizer ? "organizerId" : "userId", "==", userId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as VolunteerApplication);
  } catch (error) {
    console.error("Error getting volunteer applications:", error);
    throw error;
  }
};

export const updateApplicationStatus = async (
  applicationId: string,
  status: "approved" | "rejected"
): Promise<void> => {
  try {
    const applicationRef = doc(db, "volunteerApplications", applicationId);
    const application = await getDoc(applicationRef);

    if (!application.exists()) {
      throw new Error("Application not found");
    }

    const applicationData = application.data() as VolunteerApplication;

    await updateDoc(applicationRef, { status });

    // Notify the applicant
    await setDoc(
      doc(db, "notifications", `${applicationData.userId}_${Date.now()}`),
      {
        userId: applicationData.userId,
        type: "volunteer_status",
        message: `Your volunteer application has been ${status}`,
        timestamp: new Date(),
        status: "unread",
        eventId: applicationData.eventId,
      }
    );
  } catch (error) {
    console.error("Error updating application status:", error);
    throw error;
  }
};
