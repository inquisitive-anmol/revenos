import { Worker } from 'bullmq';
import Redis from 'ioredis';
import path from 'path';
import { config } from 'dotenv';

// 1. Load workspace root .env
config({ path: path.join(process.cwd(), '../../.env') });

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// 2. Setup Redis Connection 
// BullMQ strongly recommends 'maxRetriesPerRequest: null' for its workers
const connection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

console.log('🚀 RevenOS Workers booting up...');
console.log(`Connected to Redis at: ${REDIS_URL.split('@').pop()}`);

// 3. Define Worker(s)
// Prospector worker — plugs in when agent logic is ready
const prospectorWorker = new Worker(
  'prospector',
  async (job) => {
    console.log(`[▶] Processing prospector job: ${job.id}`);
    console.log(`    Payload:`, job.data);
    
    // TODO: Add agent logic here
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate work
    
    return { success: true, processedAt: new Date().toISOString() };
  },
  { 
    connection,
    concurrency: 5 // Process up to 5 jobs simultaneously
  }
);

// 4. Global Worker Events
prospectorWorker.on('completed', (job, returnvalue) => {
  console.log(`[✅] Prospector job ${job.id} completed!`, returnvalue);
});

prospectorWorker.on('failed', (job, err) => {
  console.error(`[❌] Prospector job ${job?.id} failed:`, err.message);
});

prospectorWorker.on('error', (err) => {
  console.error('[🚨] Worker internal error:', err.message);
});

// 5. Graceful Shutdown
async function shutdown(signal: string) {
  console.log(`\n[!] Received ${signal}, shutting down workers gracefully...`);
  
  try {
    // Wait for currently processing jobs to finish before closing
    await prospectorWorker.close();
    console.log('[!] Worker closed.');
    
    // Disconnect Redis
    connection.quit();
    console.log('[!] Redis disconnected. Goodbye!');
    
    process.exit(0);
  } catch (err) {
    console.error('[!] Error during shutdown:', err);
    process.exit(1);
  }
}

// Intercept termination signals (Ctrl+C, Docker stop, etc.)
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));