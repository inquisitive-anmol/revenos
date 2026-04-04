import { Router } from 'express';

const router = Router();

// GET /api/v1/analytics/overview    — top-level metrics
// GET /api/v1/analytics/leads       — lead funnel analytics
// GET /api/v1/analytics/campaigns   — campaign performance
// GET /api/v1/analytics/agents      — agent leaderboard / activity

router.get('/overview', (_req, res) => {
  res.json({ success: true, data: null });
});

router.get('/leads', (_req, res) => {
  res.json({ success: true, data: null });
});

router.get('/campaigns', (_req, res) => {
  res.json({ success: true, data: null });
});

router.get('/agents', (_req, res) => {
  res.json({ success: true, data: null });
});

export default router;
