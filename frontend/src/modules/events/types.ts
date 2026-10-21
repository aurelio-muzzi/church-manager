/**
 * ChurchManager — Eventos & Presença Types
 * Fully decoupled contracts for church events, worship services, registrations and attendance control.
 */

export type EventCategory =
  | 'worship'
  | 'conference'
  | 'seminar'
  | 'workshop'
  | 'meeting'
  | 'youth'
  | 'kids'
  | 'outreach';

export type EventType = 'service' | 'special_event';

export type EventStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rescheduled';

export type CheckInMethod = 'manual' | 'qr_code' | 'both';

export interface EventSession {
  id: string;
  eventId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  speaker?: string;
  description?: string;
}

export interface ChurchEvent {
  id: string;
  tenantId: string;
  congregationId: string;
  congregationName: string;
  title: string;
  description?: string;
  category: EventCategory;
  type: EventType;
  status: EventStatus;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location: string;
  address?: string;
  maxCapacity?: number;
  isRegistrationRequired: boolean;
  registrationFee?: number;
  registrationDeadline?: string;
  checkInMethod: CheckInMethod;
  bannerUrl?: string;
  targetAudience?: string;
  sessions?: EventSession[];
  registeredCount: number;
  checkedInCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface EventRegistration {
  id: string;
  tenantId: string;
  eventId: string;
  eventTitle: string;
  memberId?: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  status: 'confirmed' | 'waitlist' | 'cancelled';
  ticketCode: string;
  qrCodeValue: string;
  checkedIn: boolean;
  checkedInAt?: string;
  createdAt: string;
}

export interface EventAttendanceRecord {
  id: string;
  tenantId: string;
  eventId: string;
  eventTitle: string;
  attendeeId: string;
  attendeeType: 'member' | 'visitor';
  attendeeName: string;
  attendeeEmail?: string;
  attendeePhone?: string;
  checkInMethod: 'manual' | 'qr_code';
  ticketCode?: string;
  checkedInAt: string;
  checkedInBy: string;
  notes?: string;
}

export interface EventSummaryMetrics {
  totalEvents: number;
  upcomingServices: number;
  totalRegistrations: number;
  totalAttendance: number;
  checkInRate: number; // percentage 0 - 100
}

export interface EventFilters {
  search?: string;
  category?: string;
  type?: EventType | 'all';
  status?: string;
  congregationId?: string;
  startDate?: string;
  endDate?: string;
}

export interface CheckInResult {
  success: boolean;
  message: string;
  attendeeName?: string;
  ticketCode?: string;
  checkedInAt?: string;
  alreadyCheckedIn?: boolean;
}
