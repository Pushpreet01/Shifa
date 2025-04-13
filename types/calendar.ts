// types/calendar.ts

export interface CalendarEventData {
    id: string;
    title: string;
    date: Date;
    startTime: string;
    endTime: string;
    location: string;
    description?: string;
    registered: boolean;
  }
  
  export interface CalendarDay {
    date: Date | null;
    hasEvents?: boolean;
    isSelected?: boolean;
    empty?: boolean;
  }
  
  export interface CalendarMonth {
    year: number;
    month: number; // 0-11
    days: CalendarDay[];
  }
  
  export interface RegistrationStatus {
    eventId: string;
    userId: string;
    registered: boolean;
    registrationDate?: Date;
  }