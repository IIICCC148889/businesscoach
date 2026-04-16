import { AiAnalysis, ScenarioResult, SetupConfig } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8787/api';

export const requestPdfReport = async (payload: {
  config: SetupConfig;
  scenarios: ScenarioResult[];
  selectedScenarioId: string;
  aiAnalysis?: AiAnalysis | null;
}) => {
  const response = await fetch(`${API_BASE}/report/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error('Failed to generate PDF report');
  return response.blob();
};

export const requestAiAnalysis = async (payload: {
  config: SetupConfig;
  scenarios: ScenarioResult[];
  selectedScenarioId: string;
}) => {
  const response = await fetch(`${API_BASE}/ai/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error('Failed to generate AI analysis');
  return response.json() as Promise<AiAnalysis>;
};