import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";


dotenv.config({ path: path.join(process.cwd(), "../.env") });

await mongoose.connect(process.env.DATABASE_URL);

// Create workspace
const workspaceId = new mongoose.Types.ObjectId();
await mongoose.connection.collection("workspaces").insertOne({
  _id: workspaceId,
  name: "RevenOS Dev Workspace",
  plan: "pro",
  seats: 5,
  settings: { timezone: "UTC" },
  createdAt: new Date(),
});

console.log("Workspace created:", workspaceId.toString());

// Create campaign
const campaignId = new mongoose.Types.ObjectId();
await mongoose.connection.collection("campaigns").insertOne({
  _id: campaignId,
  workspaceId: workspaceId,
  name: "Test Campaign",
  status: "draft",
  agentIds: [],
  settings: {
    icpDescription:
      "B2B SaaS companies with 10-200 employees, targeting Head of Sales or VP Sales roles who need to automate outbound sales",
    dailyEmailLimit: 50,
    timezone: "UTC",
  },
  metrics: {
    leadsFound: 0,
    emailsSent: 0,
    repliesReceived: 0,
    meetingsBooked: 0,
  },
  createdAt: new Date(),
});

console.log("Campaign created:", campaignId.toString());
console.log("\n--- COPY THESE ---");
console.log("WORKSPACE_ID:", workspaceId.toString());
console.log("CAMPAIGN_ID:", campaignId.toString());

await mongoose.disconnect();