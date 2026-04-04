import { Router } from 'express';

const router = Router();

// GET    /api/v1/meetings       — list meetings
// POST   /api/v1/meetings       — schedule meeting
// GET    /api/v1/meetings/:id   — get meeting by ID
// PATCH  /api/v1/meetings/:id   — update meeting
// DELETE /api/v1/meetings/:id   — cancel meeting

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
