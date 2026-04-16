import { Router } from 'express';
import { runSimulation } from '../engine/simulation.js';
import { SetupConfig } from '../types.js';

export const simulateRouter = Router();

simulateRouter.post('/', (req, res) => {
  const body = req.body as { config?: SetupConfig; shockIntensity?: number };
  if (!body?.config) {
    return res.status(400).json({ error: 'config is required' });
  }

  const result = runSimulation(body.config, body.shockIntensity ?? 0.2);
  return res.json(result);
});
