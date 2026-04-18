/**
 * emitAgentLog — publishes an agent.log event to the Redis pub/sub channel
 * "agent_logs". The API process subscribes and forwards to Socket.IO clients
 * via the workspace room.
 *
 * Workers run in a separate process so they cannot call getIO() directly.
 */
import { redis } from '../config/redis';

export interface AgentLogPayload {
  workspaceId: string;
  campaignId: string;
  agentType: string;
  event: string;
  message: string;
  leadName?: string;
  timestamp?: string;
}

export async function emitAgentLog(payload: AgentLogPayload): Promise<void> {
  try {
    await redis.publish(
      'agent_logs',
      JSON.stringify({ ...payload, timestamp: payload.timestamp ?? new Date().toISOString() })
    );
  } catch (e) {
    // Fire-and-forget — never throw from a logging helper
    console.warn('[emitAgentLog] Redis publish failed:', e);
  }
}
