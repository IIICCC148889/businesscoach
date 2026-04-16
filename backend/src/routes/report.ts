import { Router } from 'express';
import { buildPdfReportBuffer } from '../lib/reportPdf.js';
import { AiAnalysis, ScenarioResult, SetupConfig } from '../types.js';

export const reportRouter = Router();

reportRouter.post('/pdf', async (req, res) => {
  const body = req.body as { config?: SetupConfig; scenarios?: ScenarioResult[]; selectedScenarioId?: string; aiAnalysis?: AiAnalysis | null };
  if (!body?.config || !body?.scenarios?.length || !body?.selectedScenarioId) {
    return res.status(400).json({ error: 'config, scenarios, and selectedScenarioId are required' });
  }

  const pdf = await buildPdfReportBuffer({
    config: body.config,
    scenarios: body.scenarios,
    selectedScenarioId: body.selectedScenarioId,
    aiAnalysis: body.aiAnalysis ?? null
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${body.config.businessName.replace(/\s+/g, '-').toLowerCase()}-business-report.pdf"`);
  return res.send(pdf);
});
