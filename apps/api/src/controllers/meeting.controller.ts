import { Request, Response } from 'express';
import {
  getMeetings,
  getMeetingById,
  createMeeting,
  updateMeetingOutcome,
  cancelMeeting,
} from '@/services/meeting.service';
import { created, noContent, ok, parsePagination } from '@/utils/response';
import { NotFoundError } from '@/errors/AppError';
import logger from '@/config/logger';

export const listMeetingsHandler = async (req: Request, res: Response) => {
  const workspaceId = req.tenant!.id;
  const { page, limit } = parsePagination(req.query);

  const meetings = await getMeetings(workspaceId);

  return ok(res, meetings, {
    page,
    limit,
    total: meetings.length,
    totalPages: Math.ceil(meetings.length / limit),
  });
};

export const getMeetingHandler = async (req: Request, res: Response) => {
  const workspaceId = req.tenant!.id;
  const { id } = req.params;

  const meeting = await getMeetingById(workspaceId, id);
  if (!meeting) {
    throw new NotFoundError('Meeting');
  }

  return ok(res, { meeting });
};

export const createMeetingHandler = async (req: Request, res: Response) => {
  const workspaceId = req.tenant!.id;
  const { leadId, campaignId, scheduledAt, calendarEventId } = req.body;

  logger.info({ workspaceId, leadId, campaignId, scheduledAt }, 'Scheduling new meeting');

  const meeting = await createMeeting(workspaceId, {
    leadId,
    campaignId,
    scheduledAt: new Date(scheduledAt),
    calendarEventId,
  });

  return created(res, { meeting });
};

export const updateMeetingOutcomeHandler = async (req: Request, res: Response) => {
  const workspaceId = req.tenant!.id;
  const { id } = req.params;
  const { outcome } = req.body;

  logger.info({ workspaceId, meetingId: id, outcome }, 'Updating meeting outcome');

  const meeting = await updateMeetingOutcome(workspaceId, id, outcome);
  if (!meeting) {
    throw new NotFoundError('Meeting');
  }

  return ok(res, { meeting });
};

export const cancelMeetingHandler = async (req: Request, res: Response) => {
  const workspaceId = req.tenant!.id;
  const { id } = req.params;

  logger.info({ workspaceId, meetingId: id }, 'Cancelling meeting');

  const meeting = await cancelMeeting(workspaceId, id);
  if (!meeting) {
    throw new NotFoundError('Meeting');
  }

  return noContent(res);
};