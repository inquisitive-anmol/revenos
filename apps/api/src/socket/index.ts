import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from '@clerk/backend';
import { env } from '@/config/env';
import logger from '@/config/logger';
import { parseCSV } from '@/utils/index';

let io: SocketIOServer | null = null;

/**
 * Attaches Socket.IO to the running HTTP server.
 *
 * ── Auth:      Clerk session tokens verified on every new connection
 * ── CORS:      Mirrors the Express CORS config (CORS_ORIGINS env var)
 * ── Rooms:     Each user auto-joins `user:<userId>` and `org:<orgId>` rooms
 *               for targeted server-side pushes via getIO()
 *
 * Client usage:
 *   import { io } from 'socket.io-client';
 *   const socket = io('http://localhost:3001', {
 *     auth: { token: await session.getToken() },
 *   });
 */
export function attachSocketIO(server: HTTPServer): SocketIOServer {

  io = new SocketIOServer(server, {
    cors: {
      origin: parseCSV(env.CORS_ORIGINS),
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60_000,
    pingInterval: 25_000,
  });

  // ── Auth middleware — runs for every new connection ──────────────────────
  io.use(async (socket: Socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const claims = await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY });
      socket.data.userId = claims.sub;
      socket.data.orgId = (claims as Record<string, unknown>).org_id;
      next();
    } catch (err) {
      logger.warn({ err, socketId: socket.id }, 'Socket: auth failed');
      next(new Error('Invalid or expired token'));
    }
  });

  // ── Connection handler ───────────────────────────────────────────────────
  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId as string;
    const orgId = socket.data.orgId as string | undefined;

    logger.info({ socketId: socket.id, userId, orgId }, 'Socket: client connected');

    // Auto-join user & org rooms for targeted pushes
    void socket.join(`user:${userId}`);
    if (orgId) void socket.join(`org:${orgId}`);

    socket.on('disconnect', (reason) => {
      logger.info({ socketId: socket.id, userId, reason }, 'Socket: client disconnected');
    });

    socket.on('error', (err) => {
      logger.error({ err, socketId: socket.id, userId }, 'Socket: error');
    });
  });

  logger.info('Socket.IO initialized and attached to HTTP server');
  return io;
}

/**
 * Returns the initialized Socket.IO instance for use in services/controllers.
 * Throws if called before attachSocketIO().
 *
 * Usage (emit to a specific user):
 *   getIO().to(`user:${userId}`).emit('lead:updated', data);
 *
 * Usage (broadcast to an org):
 *   getIO().to(`org:${orgId}`).emit('campaign:started', data);
 */
export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call attachSocketIO() first.');
  }
  return io;
}
