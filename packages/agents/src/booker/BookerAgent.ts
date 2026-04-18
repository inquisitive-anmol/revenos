import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), "../../.env") });

// import { generateWithRetry } from "ai";
import { getModel, generateWithRetry } from "@revenos/ai-sdk";
import Nylas from "nylas";
import { Agent } from "../base/Agent";
import { AgentContext } from "../base/AgentContext";
import { BOOKER_STATES, BookerState } from "../base/AgentState";
import { BOOKER_PROMPTS } from "./booker.prompts";
import {
  BookerInput,
  BookerOutput,
  AvailableSlot,
  StoredSlot,
  BookerConfirmInput,
  BookerConfirmOutput,
} from "./booker.schema";
import { sendEmail } from "@revenos/email";

export class BookerAgent extends Agent {
  protected state: BookerState;
  private nylas: InstanceType<typeof Nylas>;

  constructor(context: AgentContext, nylasClient: InstanceType<typeof Nylas>) {
    super(context, BOOKER_STATES.RECEIVED);
    this.state = BOOKER_STATES.RECEIVED;
    this.nylas = nylasClient;
  }

  private async getAvailableSlots(
    grantId: string,
    durationMinutes: number,
    timezone: string
  ): Promise<AvailableSlot[]> {
    this.transition(BOOKER_STATES.CHECKING_CAL);
    await this.log("booker.checking_calendar", { grantId });

    const now = Math.floor(Date.now() / 1000);
    const sevenDaysFromNow = now + 7 * 24 * 60 * 60;

    const calendars = await this.nylas.calendars.list({ identifier: grantId });
    const primaryCalendar =
      calendars.data.find(
        (cal: any) => cal.isPrimary || cal.name === "primary"
      ) || calendars.data[0];
    const calendarEmail = primaryCalendar?.name || process.env.CALENDAR_EMAIL!;

    const freeBusy = await this.nylas.calendars.getFreeBusy({
      identifier: grantId,
      requestBody: {
        startTime: now,
        endTime: sevenDaysFromNow,
        emails: [calendarEmail],
      },
    });

    const slots: AvailableSlot[] = [];

    for (let day = 1; day <= 7; day++) {
      const date = new Date();
      date.setDate(date.getDate() + day);
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      for (let hour = 9; hour < 17; hour++) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, 0, 0, 0);
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

        const startTimestamp = Math.floor(slotStart.getTime() / 1000);
        const endTimestamp = Math.floor(slotEnd.getTime() / 1000);

        const isBusy =
          Array.isArray(freeBusy) &&
          freeBusy.some((busy: any) => {
            if (!busy.timeSlots) return false;
            return busy.timeSlots.some(
              (slot: any) =>
                startTimestamp < slot.endTime && endTimestamp > slot.startTime
            );
          });

        if (!isBusy && slots.length < 3) {
          slots.push({
            startTime: startTimestamp,
            endTime: endTimestamp,
            startTimeFormatted: slotStart.toLocaleString("en-IN", {
              timeZone: timezone,
              weekday: "long",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            endTimeFormatted: slotEnd.toLocaleString("en-IN", {
              timeZone: timezone,
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
        }
        if (slots.length >= 3) break;
      }
      if (slots.length >= 3) break;
    }

    return slots;
  }

  // ─── PHASE 1: Propose slots, do NOT book ───────────────────────────────────
  async run(input: BookerInput): Promise<BookerOutput> {
    try {
      await this.log("booker.started", { leadId: input.leadId });

      const slots = await this.getAvailableSlots(
        input.calendar.grantId,
        input.calendar.meetingDuration,
        input.calendar.timezone
      );

      if (slots.length === 0)
        throw new Error("No available slots found in next 7 days");

      await this.log("booker.slots_found", { count: slots.length });

      const prompt = BOOKER_PROMPTS.SEND_SLOT_PICKER(input.lead, slots);
      const { text } = await generateWithRetry({ model: getModel(), prompt });

      let emailContent: { subject: string; body: string };
      try {
        const clean = text.replace(/```json|```/g, "").trim();
        emailContent = JSON.parse(clean);
      } catch {
        throw new Error("Failed to parse slot picker email");
      }

      this.transition(BOOKER_STATES.INVITE_SENT);

      const { messageId: threadId } = await sendEmail({
        leadId: input.leadId,
        to: input.lead.email,
        from: input.emailConfig.fromEmail,
        subject: emailContent.subject,
        html: emailContent.body
      });

      await this.log("booker.slots_sent", {
        leadId: input.leadId,
        slotsOffered: slots.length,
        threadId,
      });

      return {
        slotPickerSent: true,
        threadId,
        proposedSlots: slots, // AvailableSlot[] — job converts to StoredSlot[] before saving to DB
      };
    } catch (error) {
      await this.log("booker.error", { error: String(error) });
      throw error;
    }
  }

  // ─── PHASE 2: Classify reply, book the chosen slot ─────────────────────────
  async confirmBooking(input: BookerConfirmInput): Promise<BookerConfirmOutput> {
    try {
      await this.log("booker.confirm_started", { leadId: input.leadId });

      // 1. AI classifies which slot the lead picked
      // proposedSlots here are StoredSlot[] — prompts use startFormatted
      const prompt = BOOKER_PROMPTS.CLASSIFY_SLOT_REPLY(
        input.replyText,
        input.proposedSlots  // StoredSlot[] — has startFormatted field
      );
      const { text } = await generateWithRetry({ model: getModel(), prompt });

      let classification: { slotIndex: number | null; unclear: boolean };
      try {
        const clean = text.replace(/```json|```/g, "").trim();
        classification = JSON.parse(clean);
      } catch {
        throw new Error("Failed to parse slot classification");
      }

      // 2. If unclear, send clarification email and exit
      if (classification.unclear || classification.slotIndex === null) {
        await sendEmail({
          leadId: input.leadId,
          to: input.lead.email,
          from: input.emailConfig.fromEmail,
          subject: "Re: Quick meeting",
          html: BOOKER_PROMPTS.UNCLEAR_SLOT_EMAIL(
            input.lead,
            input.proposedSlots // StoredSlot[] — prompts use startFormatted
          ),
          threadId: input.threadId,
        });

        await this.log("booker.slot_unclear", { leadId: input.leadId });

        return { meetingBooked: false, unclear: true };
      }

      // 3. Get chosen slot — StoredSlot shape from MongoDB
      const chosenSlot: StoredSlot =
        input.proposedSlots[classification.slotIndex];

      // Convert ISO strings back to unix timestamps for Nylas
      const startTimestamp = Math.floor(
        new Date(chosenSlot.start).getTime() / 1000
      );
      const endTimestamp = Math.floor(
        new Date(chosenSlot.end).getTime() / 1000
      );

      // 4. Book the calendar event
      const event = await this.nylas.events.create({
        identifier: input.calendar.grantId,
        requestBody: {
          title: `Meeting - ${input.lead.firstName} ${input.lead.lastName} (${input.lead.company})`,
          when: {
            startTime: startTimestamp,  // unix timestamp ✅
            endTime: endTimestamp,       // unix timestamp ✅
          },
          participants: [
            {
              email: input.lead.email,
              name: `${input.lead.firstName} ${input.lead.lastName}`,
              status: "maybe",
            },
          ],
          description: `Meeting booked by RevenOS AI\nCompany: ${input.lead.company}\nTitle: ${input.lead.title}`,
        },
        queryParams: { calendarId: input.calendar.calendarId || "primary" },
      });

      this.transition(BOOKER_STATES.BOOKED);
      await this.log("booker.meeting_booked", {
        leadId: input.leadId,
        eventId: event.data.id,
        scheduledAt: chosenSlot.startFormatted,  // StoredSlot field ✅
      });

      // 5. Send confirmation email
      await sendEmail({
        leadId: input.leadId,
        to: input.lead.email,
        from: input.emailConfig.fromEmail,
        subject: "Meeting Confirmed ✓",
        html: BOOKER_PROMPTS.CONFIRMATION_EMAIL(
          input.lead,
          chosenSlot // StoredSlot — prompt uses startFormatted ✅
        ),
        threadId: input.threadId,
      });

      return {
        meetingBooked: true,
        calendarEventId: event.data.id,
        scheduledAt: new Date(startTimestamp * 1000),
        confirmedSlot: chosenSlot,  // StoredSlot ✅
        unclear: false,
      };
    } catch (error) {
      await this.log("booker.confirm_error", { error: String(error) });
      throw error;
    }
  }
}