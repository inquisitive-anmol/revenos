import { Router } from 'express';

const router = Router();

// GET    /api/v1/campaigns       — list campaigns
// POST   /api/v1/campaigns       — create campaign
// GET    /api/v1/campaigns/:id   — get campaign by ID
// PATCH  /api/v1/campaigns/:id   — update campaign
// DELETE /api/v1/campaigns/:id   — delete campaign

router.get('/', (_req, res) => {
  res.json({ success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
});

router.post('/', (_req, res) => {
  res.status(201).json({ success: true, data: null });
});

router.get('/:id', (req, res) => {
  res.json({ success: true, data: { id: req.params['id'] } });
});

router.patch('/:id', (req, res) => {
  res.json({ success: true, data: { id: req.params['id'] } });
});

router.delete('/:id', (_req, res) => {
  res.status(204).send();
});

export default router;
