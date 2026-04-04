import { Router } from 'express';

const router = Router();

/**
 * POST /api/v1/auth/sync
 * Syncs a Clerk user to the local database after sign-up / sign-in.
 * Called from the web client after Clerk authentication completes.
 * TODO: implement auth sync controller
 */
router.post('/sync', (_req, res) => {
  res.status(200).json({ success: true, message: 'auth sync — not yet implemented' });
});

export default router;
