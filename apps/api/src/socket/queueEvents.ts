import { QueueEvents } from 'bullmq';
import redis from '../config/redis';
import { getIO } from './index';
import { prospectorQueue, qualifierQueue, bookerQueue } from '@revenos/queue';
import logger from '../config/logger';

type QueueType = 'prospector' | 'qualifier' | 'booker';

function setupQueueEvents(queueName: QueueType, queueInstance: typeof prospectorQueue) {
  const queueEvents = new QueueEvents(queueName, { connection: redis });

  queueEvents.on('completed', async ({ jobId, returnvalue }) => {
    try {
      const job = await queueInstance.getJob(jobId);
      if (!job) {
        logger.warn({ jobId, queueName }, 'QueueEvents: Job not found');
        return;
      }

      const workspaceId = job.data?.workspaceId;
      if (!workspaceId) {
        logger.warn({ jobId, queueName }, 'QueueEvents: No workspaceId attached to job');
        return;
      }

      // Broadcast to the workspace room
      getIO().to(`workspace:${workspaceId}`).emit('worker:completed', {
        workerName: queueName,
        data: returnvalue,
      });

      logger.info({ jobId, queueName, workspaceId }, 'QueueEvents: emitted worker:completed to socket');
    } catch (error) {
      logger.error({ err: error, jobId, queueName }, 'QueueEvents: Error processing completed event');
    }
  });

  queueEvents.on('failed', async ({ jobId, failedReason }) => {
    try {
      const job = await queueInstance.getJob(jobId);
      if (!job) return;

      const workspaceId = job.data?.workspaceId;
      if (!workspaceId) return;

      getIO().to(`workspace:${workspaceId}`).emit('worker:failed', {
        workerName: queueName,
        error: failedReason,
      });
    } catch (error) {
       logger.error({ err: error, jobId, queueName }, 'QueueEvents: Error processing failed event');
    }
  });

  return queueEvents;
}

export function initializeQueueEvents() {
  setupQueueEvents('prospector', prospectorQueue);
  setupQueueEvents('qualifier', qualifierQueue);
  setupQueueEvents('booker', bookerQueue);

  logger.info('QueueEvents listeners attached for real-time socket updates');
}
