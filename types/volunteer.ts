// src/types/volunteer.ts

export type ApprovalStatus = "pending" | "approved" | "rejected";
export type ApplicationStatus = "pending" | "approved" | "rejected";

export interface VolunteerOpportunity {
  opportunityId: string;           // Unique ID for opportunity (e.g., UUID)
  eventId: string;                 // Related event's UUID
  title: string;                   // Opportunity title
  noVolunteersNeeded: number;     // Number of volunteers required
  description: string;             // Volunteer role description
  approvalStatus: ApprovalStatus; // Approval state of the opportunity
  timings: string;                 // Volunteering time schedule
  location?: string;               // Location of the volunteering event (optional)
  rewards?: string;                // Rewards offered (optional)
  refreshments?: string;           // Refreshments provided (optional)
  createdAt: Date | { toDate: () => Date };                 // Timestamp of creation
  createdBy: string;               // User ID who created the opportunity
}

export interface VolunteerApplication {
  applicationId: string;
  userId: string;
  opportunityId: string; // Changed from eventId
  status: ApplicationStatus;
  timestamp: Date;
  experience: string;              // System-generated: duration since account creation
  message?: string;                // Optional message from user applying
}
