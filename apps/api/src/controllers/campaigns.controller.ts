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
import { Orchestrator, sourceLeadsFromICP, ICPSchema } from '@revenos/agents';
import { prospectorQueue, feederQueue } from '@revenos/queue';
import { getBalance, CREDIT_COSTS } from '@revenos/billing';
import { parseCsv } from '@/prospector/csvParser';
import { getCampaignStatusBreakdown } from '@/services/campaign.service';
import { Lead } from '@revenos/db';

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

const CSV_BATCH_SIZE = 25;

export const uploadCsvHandler = async (req: Request, res: Response) => {
  const workspaceId = req.tenant!.id;
  const { id: campaignId } = req.params;

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Parse CSV payload structure natively
  const { leads, totalRows, skippedRows, parseErrors } = await parseCsv(req.file.buffer);

  if (leads.length === 0) {
    return res.status(400).json({ error: "No valid leads found in CSV", skippedRows, parseErrors });
  }

  const requiredCredits = leads.length * CREDIT_COSTS.AI_AGENT_RUN;
  const currentBalance = await getBalance(workspaceId);

  if (currentBalance.balance < requiredCredits) {
    return res.status(402).json({ error: "Insufficient credits", required: requiredCredits, current: currentBalance.balance });
  }

  logger.info({ workspaceId, campaignId, leadsParsed: leads.length }, 'Triggering bulk prospector from CSV');

  const batches = Math.ceil(leads.length / CSV_BATCH_SIZE);

  for (let i = 0; i < leads.length; i += CSV_BATCH_SIZE) {
    const batch = leads.slice(i, i + CSV_BATCH_SIZE);
    await triggerProspector(workspaceId, campaignId, batch, "csv");
  }

  return res.status(200).json({
    message: "CSV uploaded successfully",
    totalLeads: leads.length,
    skippedRows,
    batches,
    parseErrors
  });
};

export const icpSourcingHandler = async (req: Request, res: Response) => {
  const workspaceId = req.tenant!.id;
  const { id: campaignId } = req.params;

  // Validate ICP object
  const parseResult = ICPSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Invalid ICP parameters", details: parseResult.error.issues });
  }

  const icp = parseResult.data;
  const maxLeads = icp.maxLeads ?? 50;

  const estimatedCredits = maxLeads * CREDIT_COSTS.LEAD_SOURCED;
  const currentBalance = await getBalance(workspaceId);

  if (currentBalance.balance < estimatedCredits) {
    return res.status(402).json({ error: "Insufficient credits", required: estimatedCredits, current: currentBalance.balance });
  }

  logger.info({ workspaceId, campaignId, maxLeads }, 'Triggering bulk prospector from ICP Sourcing');

  // Perform sourcing
  const { rawLeads } = await sourceLeadsFromICP(icp, campaignId, workspaceId);

  if (rawLeads.length === 0) {
    return res.status(200).json({ message: "No leads found matching these ICP parameters", queued: 0, estimatedCredits: 0 });
  }

  const batches = Math.ceil(rawLeads.length / CSV_BATCH_SIZE);
  for (let i = 0; i < rawLeads.length; i += CSV_BATCH_SIZE) {
    const batch = rawLeads.slice(i, i + CSV_BATCH_SIZE);
    // Cast Partial<ILead> to what LeadInput expects (which are required string fields).
    // The downstream pipeline expects standard elements or empty strings.
    const mappedBatch = batch.map(l => ({
      email: l.email || '',
      firstName: l.firstName || '',
      lastName: l.lastName || '',
      company: l.company || '',
      title: l.title || '',
      linkedinUrl: l.linkedinUrl
    }));

    await triggerProspector(workspaceId, campaignId, mappedBatch, "icp");
  }

  return res.status(200).json({
    message: "ICP sourcing started",
    queued: rawLeads.length,
    estimatedCredits: rawLeads.length * CREDIT_COSTS.LEAD_SOURCED
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

// ── Orchestrator Endpoints ─────────────────────────────────────────────────────

export const startCampaignHandler = async (req: Request, res: Response) => {
  const workspaceId = req.tenant!.id;
  const { id } = req.params;

  const orchestrator = new Orchestrator(prospectorQueue, feederQueue, workspaceId);
  await orchestrator.startCampaign(id);

  return ok(res, { message: 'Campaign started' });
};

export const pauseCampaignHandler = async (req: Request, res: Response) => {
  const workspaceId = req.tenant!.id;
  const { id } = req.params;

  const orchestrator = new Orchestrator(prospectorQueue, feederQueue, workspaceId);
  await orchestrator.pauseCampaign(id);

  return ok(res, { message: 'Campaign paused' });
};

export const resumeCampaignHandler = async (req: Request, res: Response) => {
  const workspaceId = req.tenant!.id;
  const { id } = req.params;

  const orchestrator = new Orchestrator(prospectorQueue, feederQueue, workspaceId);
  await orchestrator.resumeCampaign(id);

  return ok(res, { message: 'Campaign resumed' });
};

export const stopCampaignHandler = async (req: Request, res: Response) => {
  const workspaceId = req.tenant!.id;
  const { id } = req.params;

  // Set all non-terminal leads back to pending
  await Lead.updateMany(
    {
      workspaceId,
      campaignId: id,
      status: { $nin: ['disqualified', 'not_interested', 'max_followups_reached', 'meeting_booked'] }
    },
    { $set: { status: 'pending' } }
  );

  const orchestrator = new Orchestrator(prospectorQueue, feederQueue, workspaceId);
  await orchestrator.stopCampaign(id);

  return ok(res, { message: 'Campaign stopped and leads reset to pending' });
};

export const campaignStatusHandler = async (req: Request, res: Response) => {
  const workspaceId = req.tenant!.id;
  const { id } = req.params;

  const breakdown = await getCampaignStatusBreakdown(workspaceId, id);
  if (!breakdown) {
    throw new NotFoundError('Campaign');
  }

  return ok(res, breakdown);
};
