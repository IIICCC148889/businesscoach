import { requestPdfReport } from './api';
import { AiAnalysis, ScenarioResult, SetupConfig } from './types';

export const downloadAnalysisReport = async ({
  config,
  scenarios,
  selectedScenarioId,
  aiAnalysis
}: {
  config: SetupConfig;
  scenarios: ScenarioResult[];
  selectedScenarioId: string;
  aiAnalysis?: AiAnalysis | null;
}) => {
  const blob = await requestPdfReport({ config, scenarios, selectedScenarioId, aiAnalysis: aiAnalysis ?? null });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${config.businessName.replace(/\s+/g, '-').toLowerCase()}-business-report.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
