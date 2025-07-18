import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "../config/firebaseConfig";
import { VolunteerOpportunity } from "../types/volunteer";

export class FirebaseOpportunityService {
  async createOpportunity(
    opportunity: Omit<VolunteerOpportunity, "createdAt" | "createdBy" | "approvalStatus">
  ): Promise<void> {
    const currentUser = auth.currentUser;
    console.log("[createOpportunity] currentUser:", currentUser);
    if (!currentUser) {
      console.error("[createOpportunity] Not authenticated");
      throw new Error("Not authenticated");
    }

    const newOpportunity: VolunteerOpportunity = {
      ...opportunity,
      approvalStatus: "pending",
      createdAt: new Date(),
      createdBy: currentUser.uid,
    };
    console.log("[createOpportunity] newOpportunity to be written:", newOpportunity);
    const opportunityRef = doc(db, "opportunities", newOpportunity.opportunityId);
    try {
      console.log("[createOpportunity] Writing document at:", opportunityRef.path);
      await setDoc(opportunityRef, newOpportunity);
      console.log("[createOpportunity] Successfully created opportunity");
    } catch (error) {
      console.error("[createOpportunity] Error writing document:", error);
      throw error;
    }
  }

  async getOpportunity(opportunityId: string, eventId: string): Promise<VolunteerOpportunity | null> {
    console.log("[getOpportunity] Fetching opportunity with opportunityId:", opportunityId, "eventId:", eventId);
    const docRef = doc(db, "opportunities", opportunityId);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as VolunteerOpportunity;
        if (data.approvalStatus === "approved" && data.eventId === eventId) {
          console.log("[getOpportunity] Document data found:", docSnap.id);
          return data;
        } else {
          console.log("[getOpportunity] Document exists but not approved or eventId mismatch");
          return null;
        }
      } else {
        console.log("[getOpportunity] No document found");
        return null;
      }
    } catch (error) {
      console.error("[getOpportunity] Error fetching document:", error);
      throw error;
    }
  }

  async getAllOpportunities(): Promise<VolunteerOpportunity[]> {
    console.log("[getAllOpportunities] Fetching all approved opportunities");
    try {
      const q = query(
        collection(db, "opportunities"),
        where("approvalStatus", "==", "approved")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => doc.data() as VolunteerOpportunity);
      console.log(`[getAllOpportunities] Retrieved ${data.length} opportunities`);
      return data;
    } catch (error) {
      console.error("[getAllOpportunities] Error fetching opportunities:", error);
      throw error;
    }
  }

  async updateOpportunity(
    opportunityId: string,
    updates: Partial<Omit<VolunteerOpportunity, "opportunityId" | "createdBy" | "createdAt">>
  ): Promise<void> {
    console.log("[updateOpportunity] Updating opportunity:", opportunityId, "with updates:", updates);
    const opportunityRef = doc(db, "opportunities", opportunityId);
    try {
      await updateDoc(opportunityRef, updates);
      console.log("[updateOpportunity] Successfully updated opportunity");
    } catch (error) {
      console.error("[updateOpportunity] Error updating document:", error);
      throw error;
    }
  }

  async deleteOpportunity(opportunityId: string): Promise<void> {
    console.log("[deleteOpportunity] Deleting opportunity:", opportunityId);
    try {
      await deleteDoc(doc(db, "opportunities", opportunityId));
      console.log("[deleteOpportunity] Successfully deleted opportunity");
    } catch (error) {
      console.error("[deleteOpportunity] Error deleting document:", error);
      throw error;
    }
  }
}

export default new FirebaseOpportunityService();