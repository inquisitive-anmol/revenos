/**
 * Workflow dispatcher — loads the workspace-level workflow for a campaign
 * (via campaign.workflowId), resolves the next BullMQ job via WorkflowExecutor,
 * and enqueues it. Falls back to the hardcoded default linear graph if the
 * campaign has no workflow assigned.
 */

import { Workflow as WorkflowModel, Campaign } from "@revenos/db";
import { WorkflowExecutor, LeadContext, Workflow, DEFAULT_WORKFLOW } from "@revenos/agents";
import { Queue } from "bullmq";
import { redis } from "../config/redis";

const qualifierQueue = new Queue("qualifier", { connection: redis });
const bookerQueue    = new Queue("booker",    { connection: redis });
const prospectorQueue = new Queue("prospector", { connection: redis });

const JOB_QUEUES: Record<string, Queue> = {
  qualifier:  qualifierQueue,
  booker:     bookerQueue,
  prospector: prospectorQueue,
};

export async function dispatchNext(
  campaignId: string,
  workspaceId: string,
  currentNodeId: string | null,
  leadContext: LeadContext,
  nextJobBaseData: Record<string, unknown>
): Promise<void> {
  // ── Resolve workflow for this campaign ─────────────────────────────────────
  let workflow: Workflow = DEFAULT_WORKFLOW;

  try {
    const campaign = await Campaign.findOne({ _id: campaignId, workspaceId }).lean();
    if (campaign?.workflowId) {
      const wf = await WorkflowModel.findOne({ workflowId: campaign.workflowId, workspaceId }).lean();
      if (wf) workflow = wf as unknown as Workflow;
    }
  } catch {
    // Fallback to default on any DB error
  }

  // ── Human override guard ────────────────────────────────────────────────────
  if (leadContext.humanControlled) {
    console.log(`[WorkflowDispatcher] Lead ${leadContext.leadId} is human-controlled. Skipping dispatch.`);
    return;
  }

  // ── Resolve next step ───────────────────────────────────────────────────────
  const nextJob = WorkflowExecutor.getNextJob(workflow, currentNodeId, leadContext);

  if (!nextJob) {
    console.log(`[WorkflowDispatcher] Workflow complete for lead ${leadContext.leadId}.`);
    return;
  }

  const queue = JOB_QUEUES[nextJob.jobName];
  if (!queue) {
    console.warn(`[WorkflowDispatcher] Unknown job name: ${nextJob.jobName}`);
    return;
  }

  await queue.add(nextJob.jobName, {
    ...nextJobBaseData,
    nodeId: nextJob.nodeId,
  }, {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    delay: nextJob.delay,
  });

  console.log(`[WorkflowDispatcher] Enqueued '${nextJob.jobName}' (node: ${nextJob.nodeId}) for lead ${leadContext.leadId}`);
}
