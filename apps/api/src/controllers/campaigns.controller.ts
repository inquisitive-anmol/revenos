import { Request, Response } from 'express';
import {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaignStatus,
} from '@/services/campaign.service';
import { triggerProspector } from '@/services/prospect.service';
import { triggerQualifier } from '@/services/qualify.service';
import { created, ok, parsePagination } from '@/utils/response';
import { NotFoundError } from '@/errors/AppError';
import logger from '@/config/logger';

export const listCampaignsHandler = async (req: Request, res: Response) => {
  const workspaceId = req.tenant!.id;
  const { page, limit } = parsePagination(req.query);

  const { campaigns, total } = await getCampaigns(workspaceId, page, limit);

  return ok(res, campaigns, { page, limit, total, totalPages: Math.ceil(total / limit) });
};

export const createCampaignHandler = async (req: Request, res: Response) => {
  const workspaceId = req.tenant!.id;
  const {
    name,
    icpDescription,
    industry,
    companySize,
    jobTitles,
    problemToSolve,
    goal,
    status,
  } = req.body;

  logger.info({ workspaceId, name }, 'Creating new campaign');

  const campaign = await createCampaign(
    workspaceId,
    name,
    icpDescription,
    { industry, companySize, jobTitles, problemToSolve, goal, status }
  );

  return created(res, { campaign });
};

export const getCampaignHandler = async (req: Request, res: Response) => {
  const workspaceId = req.tenant!.id;
  const { id } = req.params;

  const campaign = await getCampaignById(workspaceId, id);
  if (!campaign) {
    throw new NotFoundError('Campaign');
  }

  return ok(res, { campaign });
};

export const updateCampaignHandler = async (req: Request, res: Response) => {
  const workspaceId = req.tenant!.id;
  const { id } = req.params;
  const { status } = req.body;

  logger.info({ workspaceId, campaignId: id, status }, 'Updating campaign status');

  const campaign = await updateCampaignStatus(workspaceId, id, status);
  if (!campaign) {
    throw new NotFoundError('Campaign');
  }

  return ok(res, { campaign });
};

export const prospectCampaignHandler = async (req: Request, res: Response) => {
  const workspaceId = req.tenant!.id;
  const { id } = req.params;
  const { leads } = req.body;

  logger.info({ workspaceId, campaignId: id, leadsCount: leads.length }, 'Triggering prospector agent');

  const result = await triggerProspector(workspaceId, id, leads);

  return res.status(202).json({
    success: true,
    data: {
      message: 'Prospector agent started',
      jobId: result.jobId,
      leadsQueued: result.leadsQueued,
    },
  });
};

export const qualifyCampaignHandler = async (req: Request, res: Response) => {
  const workspaceId = req.tenant!.id;
  const { id: campaignId, leadId } = req.params;

  logger.info({ workspaceId, campaignId, leadId }, 'Triggering qualifier agent');

  const result = await triggerQualifier(workspaceId, campaignId, leadId);

  return res.status(202).json({
    success: true,
    data: {
      message: 'Qualifier agent started',
      jobId: result.jobId,
    },
  });
};
