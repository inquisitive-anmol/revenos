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
  startTime: z.number(),
  endTime: z.number(),
  startTimeFormatted: z.string(),
  endTimeFormatted: z.string(),
});

export const BookerOutputSchema = z.object({
  meetingBooked: z.boolean(),
  calendarEventId: z.string().optional(),
  scheduledAt: z.date().optional(),
  slotPickerSent: z.boolean(),
});

export type BookerInput = z.infer<typeof BookerInputSchema>;
export type AvailableSlot = z.infer<typeof AvailableSlotSchema>;
export type BookerOutput = z.infer<typeof BookerOutputSchema>;