import { ScenarioResult, SetupConfig } from './types';

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const seasonalityFactor = (month: number, strength: number) =>
  1 + Math.sin((month / 12) * Math.PI * 2) * strength;

const buildFounderActions = (summary: ScenarioResult) => {
  const latest = summary.timeline[summary.timeline.length - 1]!;
  const fixFirst: string[] = [];
  const improveNext: string[] = [];
  const avoidNow: string[] = [];

  if (latest.cashBalance < summary.config.startingCash * 0.5) {
    fixFirst.push('Reduce fixed commitments and preserve cash runway before scaling spend.');
  }

  if (latest.margin < 0.15) {
    fixFirst.push('Raise contribution margin by revisiting pricing, discounting, or unit costs.');
  }

  if (summary.sensitivity[0]?.label === 'Conversion') {
    fixFirst.push('Stabilize conversion before making pricing or hiring decisions.');
  }

  improveNext.push('Build repeat purchase and referral loops to reduce dependence on new traffic.');
  improveNext.push('Stress test rent, ad costs, and demand decline before approving expansion.');

  if (
    summary.breakEvenMonth &&
    summary.breakEvenMonth <= summary.config.timeHorizon / 2
  ) {
    improveNext.push(
      'Use early break-even headroom to improve efficiency rather than adding overhead too soon.'
    );
  }

  avoidNow.push('Do not accelerate hiring before positive operating cash flow is stable.');
  avoidNow.push('Avoid large marketing expansion while payback sensitivity remains unclear.');

  if (summary.riskLevel === 'High') {
    avoidNow.push(
      'Do not add new fixed-cost obligations until the model survives a moderate demand shock.'
    );
  }

  return {
    fixFirst: fixFirst.slice(0, 3),
    improveNext: improveNext.slice(0, 3),
    avoidNow: avoidNow.slice(0, 3)
  };
};

const computeRecommendations = (summary: ScenarioResult): string[] => {
  const result = [
    ...summary.founderActions.fixFirst,
    ...summary.founderActions.improveNext,
    ...summary.founderActions.avoidNow
  ];

  return [...new Set(result)].slice(0, 6);
};

export const runScenario = (
  id: string,
  name: string,
  config: SetupConfig,
  shockIntensity = 0
): ScenarioResult => {
  const timeline = [];
  let cash = config.startingCash;
  let breakEvenMonth: number | null = null;
  let lossMonths = 0;
  let minMargin = 1;

  for (let month = 1; month <= config.timeHorizon; month += 1) {
    const seasonality = seasonalityFactor(month, config.seasonalityStrength);
    const competitionDrag = 1 - config.competitionPressure * 0.08;
    const demandGrowth =
      1 + config.monthlyGrowthRate * (month - 1) + config.demandTrend * (month - 1);
    const shockFactor = month >= 5 ? 1 - shockIntensity * 0.2 : 1;

    const traffic = config.traffic * demandGrowth * seasonality * competitionDrag * shockFactor;
    const repeatBoost = 1 + config.repeatPurchaseRate * 0.35 + config.referralRate * 0.2;
    const customers = traffic * clamp(config.conversionRate, 0.01, 0.95) * repeatBoost;
    const averagePrice = config.averagePrice * (1 + config.inflation * 0.3 * (month - 1));
    const revenue = customers * averagePrice;

    const rent = config.rent * (1 + config.rentGrowth * (month - 1));
    const salaries = config.salaries * (1 + config.wageGrowth * (month - 1));
    const utilities = config.utilities * (1 + config.inflation * 0.7 * (month - 1));
    const marketing = config.marketingSpend * (1 + config.adCostGrowth * (month - 1));
    const software = config.softwareTools * (1 + config.inflation * 0.25 * (month - 1));
    const otherFixed = config.otherFixedCosts * (1 + config.inflation * 0.5 * (month - 1));
    const variableCosts =
      customers *
      config.variableCostPerSale *
      (1 + config.inflation + config.currencyRisk * 0.4 * (month - 1));

    const grossProfit = revenue - variableCosts;
    const netProfit =
      grossProfit - rent - salaries - utilities - marketing - software - otherFixed;

    cash += netProfit;

    const margin = revenue > 0 ? netProfit / revenue : 0;
    minMargin = Math.min(minMargin, margin);

    if (netProfit < 0) lossMonths += 1;
    if (breakEvenMonth === null && netProfit > 0) breakEvenMonth = month;

    const notes: string[] = [];

    if (month === 5 && shockIntensity > 0) {
      notes.push(`Demand shock activated (${Math.round(shockIntensity * 100)}% intensity).`);
    }

    if (month === 8) {
      notes.push('Price and retention review checkpoint.');
    }

    if (month === 10) {
      notes.push('Selective marketing push window.');
    }

    timeline.push({
      month,
      label: `M${month}`,
      revenue: Math.round(revenue),
      grossProfit: Math.round(grossProfit),
      netProfit: Math.round(netProfit),
      cashBalance: Math.round(cash),
      customers: Math.round(customers),
      margin: Number(margin.toFixed(3)),
      rent: Math.round(rent),
      marketing: Math.round(marketing),
      eventNotes: notes
    });
  }

  const latest = timeline[timeline.length - 1];
  const resilienceRaw =
    100 -
    lossMonths * 6 -
    (cash < 0 ? 25 : 0) -
    (minMargin < 0.08 ? 18 : 0) -
    config.competitionPressure * 40;

  const resilienceScore = clamp(Math.round(resilienceRaw), 8, 96);
  const riskLevel =
    resilienceScore >= 72 ? 'Low' : resilienceScore >= 48 ? 'Moderate' : 'High';

  const viabilityVerdict =
    cash > 0 && resilienceScore >= 72
      ? 'Viable'
      : cash > 0 && resilienceScore >= 50
        ? 'Viable with Caution'
        : cash > -config.startingCash * 0.35
          ? 'Fragile'
          : 'Not Viable';

  const sensitivity = [
    { label: 'Price', impact: Math.round(config.averagePrice * 2.2) },
    { label: 'Conversion', impact: Math.round(config.conversionRate * 1200) },
    { label: 'Rent', impact: Math.round(config.rent / 90) },
    { label: 'Retention', impact: Math.round(config.repeatPurchaseRate * 500) },
    { label: 'Marketing', impact: Math.round(config.marketingSpend / 110) },
    { label: 'Variable Cost', impact: Math.round(config.variableCostPerSale * 60) }
  ].sort((a, b) => b.impact - a.impact);

  const mainRisks = [
    latest.cashBalance < config.startingCash * 0.45
      ? 'Weak cash reserve under base progression.'
      : 'Cash reserve remains defendable in the base path.',
    latest.margin < 0.12
      ? 'Thin margin under stress; the model does not absorb shocks well.'
      : 'Margin still defendable if conversion remains stable.',
    config.rent + config.salaries > latest.revenue * 0.55
      ? 'High fixed-cost exposure relative to projected revenue.'
      : 'Fixed-cost load is manageable at current scale.',
    config.competitionPressure > 0.12
      ? 'Demand is vulnerable to competitive pressure.'
      : 'Competitive pressure remains moderate.'
  ];

  const explanation =
    latest.netProfit >= 0
      ? `By month ${latest.month}, the model remains viable, but outcome quality depends heavily on conversion discipline, fixed-cost containment, and maintaining demand momentum.`
      : `By month ${latest.month}, profitability is under pressure because cost growth compounds faster than the revenue base, reducing runway and shock tolerance.`;

  const baseScenario = {
    id,
    name,
    config,
    timeline,
    resilienceScore,
    breakEvenMonth,
    viabilityVerdict,
    riskLevel,
    explanation,
    recommendations: [] as string[],
    mainRisks,
    sensitivity,
    founderActions: {
      fixFirst: [] as string[],
      improveNext: [] as string[],
      avoidNow: [] as string[]
    }
  } satisfies ScenarioResult;

  baseScenario.founderActions = buildFounderActions(baseScenario);
  baseScenario.recommendations = computeRecommendations(baseScenario);

  return baseScenario;
};

export const buildScenarios = (config: SetupConfig): ScenarioResult[] => {
  const optimistic: SetupConfig = {
    ...config,
    traffic: config.traffic * 1.15,
    conversionRate: config.conversionRate * 1.08,
    marketingSpend: config.marketingSpend * 1.05,
    competitionPressure: Math.max(0, config.competitionPressure - 0.03)
  };

  const conservative: SetupConfig = {
    ...config,
    traffic: config.traffic * 0.92,
    conversionRate: config.conversionRate * 0.95,
    rentGrowth: config.rentGrowth * 1.15,
    adCostGrowth: config.adCostGrowth * 1.12
  };

  const crisis: SetupConfig = {
    ...config,
    traffic: config.traffic * 0.78,
    conversionRate: config.conversionRate * 0.88,
    rentGrowth: config.rentGrowth * 1.25,
    inflation: config.inflation * 1.35,
    competitionPressure: config.competitionPressure + 0.06
  };

  return [
    runScenario('base', 'Base', config, 0.2),
    runScenario('optimistic', 'Optimistic', optimistic, 0.05),
    runScenario('conservative', 'Conservative', conservative, 0.28),
    runScenario('crisis', 'Crisis', crisis, 0.42)
  ];
};