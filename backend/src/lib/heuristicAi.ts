import { AiAnalysis, ScenarioResult, SetupConfig } from '../types.js';

const fmtPct = (value: number) => `${(value * 100).toFixed(1)}%`;

export const buildHeuristicAiAnalysis = (config: SetupConfig, scenarios: ScenarioResult[], selectedScenarioId: string): AiAnalysis => {
  const active = scenarios.find((item) => item.id === selectedScenarioId) ?? scenarios[0];
  const base = scenarios.find((item) => item.id === 'base') ?? active;
  const crisis = scenarios.find((item) => item.id === 'crisis') ?? active;
  const latest = active.timeline.at(-1)!;
  const crisisLatest = crisis.timeline.at(-1)!;
  const baseLatest = base.timeline.at(-1)!;
  const shockGap = baseLatest.netProfit - crisisLatest.netProfit;

  return {
    generatedBy: 'heuristic',
    executiveSummary: [
      `${active.viabilityVerdict}: the model ends with ${latest.netProfit >= 0 ? 'positive' : 'negative'} monthly profit and a resilience score of ${active.resilienceScore}/100.`,
      `The largest sensitivities are ${active.sensitivity.slice(0, 3).map((item) => item.label).join(', ')}, so management attention should stay concentrated there.`,
      `Current pricing at ${config.averagePrice.toFixed(0)} ${config.currencyCode} and conversion at ${fmtPct(config.conversionRate)} create a business that is ${active.riskLevel.toLowerCase()} risk under the selected scenario.`
    ],
    investorView: [
      `Runway quality is driven by ending cash of ${latest.cashBalance.toFixed(0)} ${config.currencyCode} and break-even timing of ${active.breakEvenMonth ? `month ${active.breakEvenMonth}` : 'not reached'}.`,
      `The downside gap between base and crisis profit is ${shockGap.toFixed(0)} ${config.currencyCode}, which shows how vulnerable the model is to external pressure.`,
      `Fixed-cost intensity remains a core diligence question because rent plus salaries absorb a material share of monthly contribution.`
    ],
    founderPlan: {
      next7Days: active.founderActions.fixFirst,
      next30Days: active.founderActions.improveNext,
      avoidNow: active.founderActions.avoidNow
    },
    stressNarrative: `Under stress, the business weakens primarily through demand compression, higher acquisition pressure, and compounding fixed-cost growth. In the crisis path, profitability moves by ${shockGap.toFixed(0)} ${config.currencyCode} versus the base path by the final month.`,
    scenarioDelta: [
      `Optimistic upside comes from stronger traffic and conversion efficiency, not just higher spend.`,
      `Conservative downside is driven by slower demand and cost inflation before the business compounds enough scale.`,
      `Crisis downside shows whether the current cost structure can survive simultaneous revenue softness and cost pressure.`
    ],
    smartWarnings: [
      latest.cashBalance < config.startingCash * 0.5 ? 'Cash reserve is being consumed too quickly relative to the starting runway.' : 'Cash reserve remains acceptable, but should still be monitored under downside scenarios.',
      config.competitionPressure > 0.12 ? 'Competition pressure is high enough to justify scenario planning before expansion.' : 'Competition pressure is moderate, but conversion still remains a critical control point.',
      latest.margin < 0.15 ? 'Contribution margin is too thin for comfortable shock absorption.' : 'Margin is acceptable, though price and variable-cost discipline still matter.'
    ]
  };
};
