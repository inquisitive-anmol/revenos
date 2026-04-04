import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), "../../.env") });

import { connectDB } from "./config/db";
import { prospectorWorker } from "./jobs/prospector.job";

console.log("RevenOS Workers starting...");

connectDB().then(() => {
  console.log("Workers ready:");
  console.log("  ✅ Prospector Worker");
});

export { prospectorWorker };