import { z } from "zod";

export const BookerInputSchema = z.object({
  leadId: z.string(),
  workspaceId: z.string(),
  campaignId: z.string(),
  lead: z.object({
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    company: z.string(),
    title: z.string(),
  }),
  emailConfig: z.object({
    fromEmail: z.string().email(),
    fromName: z.string(),
  }),
  calendar: z.object({
    grantId: z.string(),
    calendarId: z.string().optional(),
    meetingDuration: z.number().default(30),
    timezone: z.string().default("Asia/Kolkata"),
  }),
});

export const AvailableSlotSchema = z.object({
  startTime: z.number(),       // unix timestamp
  endTime: z.number(),         // unix timestamp
  startTimeFormatted: z.string(),
  endTimeFormatted: z.string(),
});

// Slots as stored in MongoDB EmailThread.proposedSlots
// (ISO strings instead of unix timestamps)
export const StoredSlotSchema = z.object({
  start: z.string(),           // ISO string
  end: z.string(),             // ISO string
  startFormatted: z.string(),
  endFormatted: z.string(),
});

export type BookerInput = z.infer<typeof BookerInputSchema>;
export type AvailableSlot = z.infer<typeof AvailableSlotSchema>;
export type StoredSlot = z.infer<typeof StoredSlotSchema>;

export interface BookerOutput {
  slotPickerSent: boolean;
  threadId: string;
  proposedSlots: AvailableSlot[];
}

export interface BookerConfirmInput {
  leadId: string;
  workspaceId: string;
  campaignId: string;
  threadId: string;
  replyText: string;
  proposedSlots: StoredSlot[];  // from MongoDB — StoredSlot shape
  bookerMeta: {
    leadEmail: string;
    leadName: string;
    calendarId: string;
    durationMins: number;
  };
  lead: {
    email: string;
    firstName: string;
    lastName: string;
    company: string;
    title: string;
  };
  emailConfig: {
    fromEmail: string;
    fromName: string;
  };
  calendar: {
    grantId: string;
    calendarId?: string;
    meetingDuration: number;
    timezone: string;
  };
}

export interface BookerConfirmOutput {
  meetingBooked: boolean;
  unclear: boolean;
  calendarEventId?: string;
  scheduledAt?: Date;
  confirmedSlot?: StoredSlot;
}