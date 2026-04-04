import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), "../../.env") });

import { generateText } from "ai";
import { getModel } from "@revenos/ai-sdk";
import Nylas from "nylas";
import { Agent } from "../base/Agent";
import { AgentContext } from "../base/AgentContext";
import { BOOKER_STATES, BookerState } from "../base/AgentState";
import { BOOKER_PROMPTS } from "./booker.prompts";
import {
    BookerInput,
    BookerOutput,
    AvailableSlot,
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

    // Get available slots from Google Calendar
    private async getAvailableSlots(
        grantId: string,
        durationMinutes: number,
        timezone: string
    ): Promise<AvailableSlot[]> {
        this.transition(BOOKER_STATES.CHECKING_CAL);
        await this.log("booker.checking_calendar", { grantId });

        const now = Math.floor(Date.now() / 1000);
        const sevenDaysFromNow = now + 7 * 24 * 60 * 60;

        // Get primary calendar to find email
        const calendars = await this.nylas.calendars.list({
            identifier: grantId,
        });

        const primaryCalendar = calendars.data.find(
            (cal: any) => cal.isPrimary || cal.name === "primary"
        ) || calendars.data[0];

        const calendarEmail = primaryCalendar?.name || process.env.CALENDAR_EMAIL!;

        // Get busy times from calendar
        const freeBusy = await this.nylas.calendars.getFreeBusy({
            identifier: grantId,
            requestBody: {
                startTime: now,
                endTime: sevenDaysFromNow,
                emails: [calendarEmail],
            },
        });

        // Generate available slots (9am-5pm, weekdays only)
        const slots: AvailableSlot[] = [];
        const durationSeconds = durationMinutes * 60;

        for (let day = 1; day <= 7; day++) {
            const date = new Date();
            date.setDate(date.getDate() + day);

            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6) continue;

            // Generate slots from 9am to 5pm
            for (let hour = 9; hour < 17; hour++) {
                const slotStart = new Date(date);
                slotStart.setHours(hour, 0, 0, 0);
                const slotEnd = new Date(slotStart);
                slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

                const startTimestamp = Math.floor(slotStart.getTime() / 1000);
                const endTimestamp = Math.floor(slotEnd.getTime() / 1000);

                // Check if slot conflicts with busy times
                const isBusy = Array.isArray(freeBusy) && freeBusy.some((busy: any) => {
                    if (!busy.timeSlots) return false;
                    return busy.timeSlots.some((slot: any) =>
                        startTimestamp < slot.endTime &&
                        endTimestamp > slot.startTime
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

    async run(input: BookerInput): Promise<BookerOutput> {
        try {
            await this.log("booker.started", { leadId: input.leadId });

            // 1. Get available slots
            const slots = await this.getAvailableSlots(
                input.calendar.grantId,
                input.calendar.meetingDuration,
                input.calendar.timezone
            );

            if (slots.length === 0) {
                throw new Error("No available slots found in next 7 days");
            }

            await this.log("booker.slots_found", { count: slots.length });

            // 2. Generate slot picker email
            const prompt = BOOKER_PROMPTS.SEND_SLOT_PICKER(input.lead, slots);
            const { text } = await generateText({ model: getModel(), prompt });

            let emailContent: { subject: string; body: string };
            try {
                const clean = text.replace(/```json|```/g, "").trim();
                emailContent = JSON.parse(clean);
            } catch {
                throw new Error("Failed to parse slot picker email");
            }

            // 3. Send slot picker email
            this.transition(BOOKER_STATES.INVITE_SENT);

            await sendEmail({
                to: input.lead.email,
                from: input.emailConfig.fromEmail,
                subject: emailContent.subject,
                html: emailContent.body,
            });

            await this.log("booker.invite_sent", {
                leadId: input.leadId,
                slotsOffered: slots.length,
            });

            // 4. Book first available slot automatically for demo
            // In production this waits for prospect to pick
            const selectedSlot = slots[0];

            const event = await this.nylas.events.create({
                identifier: input.calendar.grantId,
                requestBody: {
                    title: `RevenOS Demo - ${input.lead.firstName} ${input.lead.lastName} (${input.lead.company})`,
                    when: {
                        startTime: selectedSlot.startTime,
                        endTime: selectedSlot.endTime,
                    },
                    participants: [
                        {
                            email: input.lead.email,
                            name: `${input.lead.firstName} ${input.lead.lastName}`,
                            status: "maybe"
                        },
                    ],
                    description: `Meeting booked by RevenOS AI\nCompany: ${input.lead.company}\nTitle: ${input.lead.title}`,
                },
                queryParams: { calendarId: "primary" },
            });

            this.transition(BOOKER_STATES.BOOKED);
            await this.log("booker.meeting_booked", {
                leadId: input.leadId,
                eventId: event.data.id,
                scheduledAt: selectedSlot.startTimeFormatted,
            });

            console.log(`[BookerAgent] Meeting booked: ${selectedSlot.startTimeFormatted}`);

            return {
                meetingBooked: true,
                calendarEventId: event.data.id,
                scheduledAt: new Date(selectedSlot.startTime * 1000),
                slotPickerSent: true,
            };
        } catch (error) {
            await this.log("booker.error", { error: String(error) });
            throw error;
        }
    }
}