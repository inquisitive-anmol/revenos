import { Meeting, IMeeting } from '@revenos/db';

export const getMeetings = async (workspaceId: string): Promise<IMeeting[]> => {
  return Meeting.find({ workspaceId })
    .sort({ scheduledAt: -1 })
    .populate('leadId');
};

export const getMeetingById = async (
  workspaceId: string,
  meetingId: string,
): Promise<IMeeting | null> => {
  return Meeting.findOne({ _id: meetingId, workspaceId }).populate('leadId');
};

export interface CreateMeetingPayload {
  leadId: string;
  campaignId: string;
  scheduledAt: Date;
  calendarEventId?: string;
}

export const createMeeting = async (
  workspaceId: string,
  payload: CreateMeetingPayload,
): Promise<IMeeting> => {
  return Meeting.create({ workspaceId, ...payload });
};

export const updateMeetingOutcome = async (
  workspaceId: string,
  meetingId: string,
  outcome: IMeeting['outcome'],
): Promise<IMeeting | null> => {
  return Meeting.findOneAndUpdate(
    { _id: meetingId, workspaceId },
    { outcome },
    { new: true },
  );
};

export const cancelMeeting = async (
  workspaceId: string,
  meetingId: string,
): Promise<IMeeting | null> => {
  return Meeting.findOneAndUpdate(
    { _id: meetingId, workspaceId },
    { outcome: 'cancelled' },
    { new: true },
  );
};
