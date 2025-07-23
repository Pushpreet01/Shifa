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
import { db, auth } from "../config/firebaseConfig";
import { VolunteerApplication, ApplicationStatus } from "../types/volunteer";

export class FirebaseVolunteerApplicationService {
  async applyForOpportunity(
    application: Omit<VolunteerApplication, "applicationId" | "status" | "timestamp" | "experience">
  ): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      console.log("[applyForOpportunity] currentUser:", currentUser);
      if (!currentUser) throw new Error("Not authenticated");

      const applicationId = `${application.userId}_${application.opportunityId}`;
      console.log("[applyForOpportunity] applicationId:", applicationId);

      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      console.log("[applyForOpportunity] userDoc exists:", userDoc.exists());
      const createdAt = userDoc.exists() ? userDoc.data().createdAt?.toDate?.() || new Date() : new Date();

      const now = new Date();
      const diffTime = Math.abs(now.getTime() - createdAt.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const experience = `${diffDays} days on app`;
      console.log("[applyForOpportunity] Calculated experience:", experience);

      const newApplication: VolunteerApplication = {
        ...application,
        applicationId,
        status: "pending",
        timestamp: now,
        experience,
      };

      const applicationRef = doc(db, "volunteerApplications", applicationId);
      console.log("[applyForOpportunity] Writing application to:", applicationRef.path);

      await setDoc(applicationRef, newApplication);
      console.log("[applyForOpportunity] Application submitted successfully");
    } catch (error) {
      console.error("[applyForOpportunity] Error applying for opportunity:", error);
      throw error;
    }
  }

  async getApplicationsByUser(userId: string): Promise<VolunteerApplication[]> {
    try {
      console.log("[getApplicationsByUser] Fetching applications for user:", userId);
      const q = query(collection(db, "volunteerApplications"), where("userId", "==", userId));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => doc.data() as VolunteerApplication);
      console.log(`[getApplicationsByUser] Retrieved ${data.length} applications`);
      return data;
    } catch (error) {
      console.error("[getApplicationsByUser] Error fetching user applications:", error);
      return [];
    }
  }

  async getApplicationsByOpportunity(opportunityId: string): Promise<VolunteerApplication[]> {
    try {
      console.log("[getApplicationsByOpportunity] Fetching applications for opportunity:", opportunityId);
      const q = query(collection(db, "volunteerApplications"), where("opportunityId", "==", opportunityId));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => doc.data() as VolunteerApplication);
      console.log(`[getApplicationsByOpportunity] Retrieved ${data.length} applications`);
      return data;
    } catch (error) {
      console.error("[getApplicationsByOpportunity] Error fetching applications by opportunity:", error);
      return [];
    }
  }

  async updateApplicationStatus(applicationId: string, status: ApplicationStatus): Promise<void> {
    try {
      console.log("[updateApplicationStatus] Updating application:", applicationId, "to status:", status);
      const applicationRef = doc(db, "volunteerApplications", applicationId);
      await updateDoc(applicationRef, { status });
      console.log("[updateApplicationStatus] Successfully updated status");
    } catch (error) {
      console.error("[updateApplicationStatus] Error updating application status:", error);
      throw error;
    }
  }

  async deleteApplication(applicationId: string): Promise<void> {
    try {
      console.log("[deleteApplication] Deleting application:", applicationId);
      await deleteDoc(doc(db, "volunteerApplications", applicationId));
      console.log("[deleteApplication] Successfully deleted application");
    } catch (error) {
      console.error("[deleteApplication] Error deleting application:", error);
      throw error;
    }
  }

  async getApplicationById(applicationId: string): Promise<VolunteerApplication | null> {
    try {
      console.log("[getApplicationById] Fetching application by ID:", applicationId);
      const snapshot = await getDoc(doc(db, "volunteerApplications", applicationId));
      if (snapshot.exists()) {
        console.log("[getApplicationById] Application found");
        return snapshot.data() as VolunteerApplication;
      } else {
        console.log("[getApplicationById] No application found");
        return null;
      }
    } catch (error) {
      console.error("[getApplicationById] Error fetching application by ID:", error);
      return null;
    }
  }

  async updateAttendance(applicationId: string, attendance: 'Present' | 'Absent'): Promise<void> {
    try {
      const applicationRef = doc(db, 'volunteerApplications', applicationId);
      await updateDoc(applicationRef, { attendance });
      console.log(`[updateAttendance] Updated attendance for ${applicationId} to ${attendance}`);
    } catch (error) {
      console.error('[updateAttendance] Error updating attendance:', error);
      throw error;
    }
  }
}

export default new FirebaseVolunteerApplicationService();