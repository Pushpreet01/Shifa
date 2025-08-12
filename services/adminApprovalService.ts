import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import FirebaseOpportunityService from "./FirebaseOpportunityService";
import FirebaseEventService from "./firebaseEventService";

export type ApprovalType = 'event' | 'volunteer' | 'organizer';

export interface ApprovalItem {
    id: string;
    [key: string]: any;
}

export async function fetchApprovals(type: ApprovalType): Promise<ApprovalItem[]> {
    try {
        let q;

        if (type === "event") {
            // For events, query the events collection
            q = query(
                collection(db, "events"),
                where("approvalStatus", "==", "pending")
            );
        } else if (type === "volunteer") {
            // For volunteers, query users collection with role "Volunteer" and pending approval
            q = query(
                collection(db, "users"),
                where("role", "==", "Volunteer"),
                where("approvalStatus.status", "==", "Pending")
            );
        } else {
            // For event organizers, query users collection with role "Event Organizer" and pending approval
            q = query(
                collection(db, "users"),
                where("role", "==", "Event Organizer"),
                where("approvalStatus.status", "==", "Pending")
            );
        }

        const snapshot = await getDocs(q);
        const approvalsData = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data()
        }));

        console.log(`[adminApprovalService] Fetched ${approvalsData.length} ${type} approvals`);
        return approvalsData;
    } catch (error) {
        console.error(`[adminApprovalService] Error fetching ${type} approvals:`, error);
        throw error;
    }
}

export async function approveItem(id: string, type: ApprovalType, rejectionReason?: string): Promise<boolean> {
    try {
        if (type === "event") {
            // For events, update the events collection
            await updateDoc(doc(db, "events", id), { approvalStatus: { status: "Approved" } });

            // Broadcast the event approval (announcements and notifications)
            try {
                await FirebaseEventService.broadcastEventApproval(id);
            } catch (broadcastError) {
                console.log("Error broadcasting event approval:", broadcastError);
                // Don't fail the approval if broadcast fails
            }

            // Approve associated opportunity (if any)
            const q = query(
                collection(db, "opportunities"),
                where("eventId", "==", id)
            );
            const oppSnap = await getDocs(q);
            if (!oppSnap.empty) {
                for (const oppDoc of oppSnap.docs) {
                    await FirebaseOpportunityService.updateOpportunity(oppDoc.id, {
                        approvalStatus: { status: "Approved" },
                    });
                }
            }
        } else {
            // For volunteers and event organizers, update the users collection
            await updateDoc(doc(db, "users", id), {
                approvalStatus: { status: "Approved" }
            });
        }

        console.log(`[adminApprovalService] Successfully approved ${type} item with ID: ${id}`);
        return true;
    } catch (error) {
        console.error(`[adminApprovalService] Error approving ${type} item:`, error);
        throw error;
    }
}

export async function denyItem(id: string, type: ApprovalType, rejectionReason: string = "No reason provided."): Promise<boolean> {
    try {
        if (type === "event") {
            // For events, update the events collection
            await updateDoc(doc(db, "events", id), {
                approvalStatus: { status: "Rejected", reason: rejectionReason }
            });

            // If denying an event, also reject associated opportunity (if any)
            const q = query(
                collection(db, "opportunities"),
                where("eventId", "==", id)
            );
            const oppSnap = await getDocs(q);
            if (!oppSnap.empty) {
                for (const oppDoc of oppSnap.docs) {
                    await FirebaseOpportunityService.updateOpportunity(oppDoc.id, {
                        approvalStatus: { status: "Rejected", reason: rejectionReason },
                    });
                }
            }
        } else {
            // For volunteers and event organizers, update the users collection
            await updateDoc(doc(db, "users", id), {
                approvalStatus: { status: "Rejected", reason: rejectionReason }
            });
        }

        console.log(`[adminApprovalService] Successfully denied ${type} item with ID: ${id}`);
        return true;
    } catch (error) {
        console.error(`[adminApprovalService] Error denying ${type} item:`, error);
        throw error;
    }
} 