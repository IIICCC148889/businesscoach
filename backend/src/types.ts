export interface SetupConfig {
  businessName: string;
  businessType: string;
  strategy: string;
  currencyCode: 'USD' | 'EUR' | 'KZT' | 'RUB';
  startingCash: number;
  launchMonth: string;
  region: string;
  timeHorizon: number;
  averagePrice: number;
  traffic: number;
  conversionRate: number;
  repeatPurchaseRate: number;
  monthlyGrowthRate: number;
  referralRate: number;
  rent: number;
  salaries: number;
  utilities: number;
  variableCostPerSale: number;
  marketingSpend: number;
  softwareTools: number;
  otherFixedCosts: number;
  inflation: number;
  rentGrowth: number;
  wageGrowth: number;
  adCostGrowth: number;
  demandTrend: number;
  competitionPressure: number;
  seasonalityStrength: number;
  currencyRisk: number;
}

export interface MonthPoint {
  month: number;
  label: string;
  revenue: number;
  grossProfit: number;
  netProfit: number;
  cashBalance: number;
  customers: number;
  margin: number;
  rent: number;
  marketing: number;
  eventNotes: string[];
}

export interface ScenarioResult {
  id: string;
  name: string;
  config: SetupConfig;
  timeline: MonthPoint[];
  resilienceScore: number;
  breakEvenMonth: number | null;
  viabilityVerdict: 'Viable' | 'Viable with Caution' | 'Fragile' | 'Not Viable';
  riskLevel: 'Low' | 'Moderate' | 'High';
  explanation: string;
  recommendations: string[];
  mainRisks: string[];
  sensitivity: { label: string; impact: number }[];
  founderActions: {
    fixFirst: string[];
    improveNext: string[];
    avoidNow: string[];
  };
}

export interface AiAnalysis {
  generatedBy: 'openai' | 'heuristic';
  executiveSummary: string[];
  investorView: string[];
  founderPlan: {
    next7Days: string[];
    next30Days: string[];
    avoidNow: string[];
  };
  stressNarrative: string;
  scenarioDelta: string[];
  smartWarnings: string[];
}
