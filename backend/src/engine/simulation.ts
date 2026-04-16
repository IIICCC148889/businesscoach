import { SetupConfig } from '../types.js';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const seasonalityFactor = (month: number, strength: number) => 1 + Math.sin((month / 12) * Math.PI * 2) * strength;

export function runSimulation(config: SetupConfig, shockIntensity = 0.2) {
  let cash = config.startingCash;
  let breakEvenMonth: number | null = null;
  const timeline = [];

  for (let month = 1; month <= config.timeHorizon; month += 1) {
    const seasonality = seasonalityFactor(month, config.seasonalityStrength);
    const competitionDrag = 1 - config.competitionPressure * 0.08;
    const demandGrowth = 1 + config.monthlyGrowthRate * (month - 1) + config.demandTrend * (month - 1);
    const shockFactor = month >= 5 ? 1 - shockIntensity * 0.2 : 1;

    const traffic = config.traffic * demandGrowth * seasonality * competitionDrag * shockFactor;
    const repeatBoost = 1 + config.repeatPurchaseRate * 0.35 + config.referralRate * 0.2;
    const customers = traffic * clamp(config.conversionRate, 0.01, 0.95) * repeatBoost;
    const price = config.averagePrice * (1 + config.inflation * 0.3 * (month - 1));
    const revenue = customers * price;

    const rent = config.rent * (1 + config.rentGrowth * (month - 1));
    const salaries = config.salaries * (1 + config.wageGrowth * (month - 1));
    const utilities = config.utilities * (1 + config.inflation * 0.7 * (month - 1));
    const marketing = config.marketingSpend * (1 + config.adCostGrowth * (month - 1));
    const software = config.softwareTools * (1 + config.inflation * 0.25 * (month - 1));
    const otherFixed = config.otherFixedCosts * (1 + config.inflation * 0.5 * (month - 1));
    const variableCosts = customers * config.variableCostPerSale * (1 + config.inflation + config.currencyRisk * 0.4 * (month - 1));

    const grossProfit = revenue - variableCosts;
    const netProfit = grossProfit - rent - salaries - utilities - marketing - software - otherFixed;
    cash += netProfit;
    if (breakEvenMonth === null && netProfit > 0) breakEvenMonth = month;

    timeline.push({
      month,
      revenue: Math.round(revenue),
      grossProfit: Math.round(grossProfit),
      netProfit: Math.round(netProfit),
      cashBalance: Math.round(cash),
      customers: Math.round(customers),
      margin: revenue > 0 ? Number((netProfit / revenue).toFixed(3)) : 0,
      breakEvenMonth
    });
  }

  return { timeline, breakEvenMonth, endingCash: cash };
}
