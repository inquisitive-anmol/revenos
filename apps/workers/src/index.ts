import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), "../../.env") });

import { connectDB } from "./config/db";
import { prospectorWorker } from "./jobs/prospector.job";
import { qualifierWorker } from "./jobs/qualifier.job";
import { bookerWorker } from "./jobs/booker.job";
import { bookerConfirmWorker } from "./jobs/bookerConfirm.job";
import { feederWorker } from "./jobs/feeder.job";
// import { outreachWorker } from "./jobs/outreach.job";
import { processFollowUp } from "./jobs/followup.job";
import { creditAlertWorker } from "./jobs/creditAlert.job";
import { creditResetWorker, setupCreditResetSchedule } from "./jobs/creditReset.job";

import {
  onProspectorCompleted,
  // onOutreachCompleted,
  onBookerConfirmCompleted,
} from "@revenos/agents";
import { outreachQueue, followUpQueue } from "@revenos/queue";

prospectorWorker.on("completed", (job) => onProspectorCompleted(job));
// outreachWorker.on("completed", (job) => onOutreachCompleted(job, outreachQueue, followUpQueue));
bookerConfirmWorker.on("completed", (job) => onBookerConfirmCompleted(job));
console.log("RevenOS Workers starting...");

connectDB().then(() => {
  console.log("Workers ready:");
  console.log("  ✅ Prospector Worker");
  console.log("  ✅ Qualifier Worker");
  console.log("  ✅ Booker Worker");
  console.log("  ✅ Booker Confirm Worker");
  console.log("  ✅ Credit Alert Worker");
  console.log("  ✅ Credit Reset Worker");

  // Setup repeatable schedules
  setupCreditResetSchedule().catch(err => {
    console.error("Failed to setup credit reset schedule:", err);
  });
});

export { 
  prospectorWorker, 
  qualifierWorker, 
  bookerWorker, 
  bookerConfirmWorker, 
  processFollowUp, 
  feederWorker,
  creditAlertWorker,
  creditResetWorker
};