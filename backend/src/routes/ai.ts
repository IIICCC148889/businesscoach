import { Router } from 'express';
import OpenAI from 'openai';
import { buildHeuristicAiAnalysis } from '../lib/heuristicAi.js';
import { AiAnalysis, ScenarioResult, SetupConfig } from '../types.js';

export const aiRouter = Router();

const parseJsonPayload = (text: string): AiAnalysis | null => {
  try {
    return JSON.parse(text) as AiAnalysis;
  } catch {
    return null;
  }
};

aiRouter.post('/analyze', async (req, res) => {
  const body = req.body as { config?: SetupConfig; scenarios?: ScenarioResult[]; selectedScenarioId?: string };
  if (!body?.config || !body?.scenarios?.length || !body?.selectedScenarioId) {
    return res.status(400).json({ error: 'config, scenarios, and selectedScenarioId are required' });
  }

  const fallback = buildHeuristicAiAnalysis(body.config, body.scenarios, body.selectedScenarioId);
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.json(fallback);
  }

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-5.4-mini',
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: 'You are a strict business analyst. Return only valid JSON matching the requested schema. Use concise, professional language and focus on actionable business recommendations.' }]
        },
        {
          role: 'user',
          content: [{
            type: 'input_text',
            text: `Analyze this business simulation payload and return JSON with keys: generatedBy, executiveSummary, investorView, founderPlan:{next7Days,next30Days,avoidNow}, stressNarrative, scenarioDelta, smartWarnings. Set generatedBy to openai. Payload: ${JSON.stringify(body)}`
          }]
        }
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'profitlab_analysis',
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              generatedBy: { type: 'string', enum: ['openai'] },
              executiveSummary: { type: 'array', items: { type: 'string' } },
              investorView: { type: 'array', items: { type: 'string' } },
              founderPlan: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  next7Days: { type: 'array', items: { type: 'string' } },
                  next30Days: { type: 'array', items: { type: 'string' } },
                  avoidNow: { type: 'array', items: { type: 'string' } }
                },
                required: ['next7Days', 'next30Days', 'avoidNow']
              },
              stressNarrative: { type: 'string' },
              scenarioDelta: { type: 'array', items: { type: 'string' } },
              smartWarnings: { type: 'array', items: { type: 'string' } }
            },
            required: ['generatedBy', 'executiveSummary', 'investorView', 'founderPlan', 'stressNarrative', 'scenarioDelta', 'smartWarnings']
          }
        }
      }
    });

    const parsed = parseJsonPayload(response.output_text);
    return res.json(parsed ?? fallback);
  } catch (error) {
    console.error('AI analyze route failed:', error);
    return res.json(fallback);
  }
});
