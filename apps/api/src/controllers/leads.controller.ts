import { Request, Response } from 'express';
import {
  getLeads,
  getLeadById,
  takeoverLead,
  handbackLead,
} from '@/services/lead.service';
import { ok, parsePagination } from '@/utils/response';
import { NotFoundError } from '@/errors/AppError';
import logger from '@/config/logger';

export const listLeadsHandler = async (req: Request, res: Response) => {
  const workspaceId = req.tenant!.id;
  const { page, limit } = parsePagination(req.query);

  const { status, campaignId, score_gte } = req.query as {
    status?: string;
    campaignId?: string;
    score_gte?: string;
  };

  const leads = await getLeads(workspaceId, {
    status,
    campaignId,
    // ensure score_gte is parsed as a number if it exists
    ...(score_gte ? { score_gte: Number(score_gte) } : {}),
  });

  return ok(res, leads, { page, limit, total: leads.length, totalPages: Math.ceil(leads.length / limit) });
};

export const getLeadHandler = async (req: Request, res: Response) => {
  const workspaceId = req.tenant!.id;
  const { id } = req.params;

  const lead = await getLeadById(workspaceId, id);
  if (!lead) {
    throw new NotFoundError('Lead');
  }

  return ok(res, { lead });
};

export const takeoverLeadHandler = async (req: Request, res: Response) => {
  const workspaceId = req.tenant!.id;
  const { id } = req.params;

  logger.info({ workspaceId, leadId: id }, 'Initiated manual takeover of lead');

  const lead = await takeoverLead(workspaceId, id);
  if (!lead) {
    throw new NotFoundError('Lead');
  }

  return ok(res, { lead });
};

export const handbackLeadHandler = async (req: Request, res: Response) => {
  const workspaceId = req.tenant!.id;
  const { id } = req.params;

  logger.info({ workspaceId, leadId: id }, 'Handed lead back to AI automation');

  const lead = await handbackLead(workspaceId, id);
  if (!lead) {
    throw new NotFoundError('Lead');
  }

  return ok(res, { lead });
};
