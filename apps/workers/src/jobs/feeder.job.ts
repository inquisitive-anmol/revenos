import { Worker, Job } from "bullmq";
import { redis } from "../config/redis";
import { prospectorQueue } from "@revenos/queue";
import { Orchestrator } from "@revenos/agents";
import { feederQueue } from "@revenos/queue";

export interface FeederJobData {
  campaignId: string;
  workspaceId: string;
}

export const feederWorker = new Worker<FeederJobData>(
  "feeder",
  async (job: Job<FeederJobData>) => {
    const { campaignId, workspaceId } = job.data;
    
    // Create new orchestrator instance and resume it to feed leads
    // Since Orchestrator class internals will call feederQueue again if more leads remain
    const orchestrator = new Orchestrator(prospectorQueue, feederQueue, workspaceId);
    
    // Expose internal method or handle it purely here
    // Wait, let's just make Orchestrator._feedLeadsToQueue public or add feedLeads
    await orchestrator.feedLeads(campaignId);
  },
  { connection: redis }
);

feederWorker.on("completed", (job) => {
  console.log(`[FeederWorker] Job ${job.id} completed`);
});

feederWorker.on("failed", (job, err) => {
  console.error(`[FeederWorker] Job ${job?.id} failed:`, err.message);
});
