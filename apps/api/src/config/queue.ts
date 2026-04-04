import { Queue } from "bullmq";
import { Redis } from "ioredis";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), "../../.env") });

const connection = new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null,
});

export const prospectorQueue = new Queue("prospector", { connection });

console.log("Queues initialized");
