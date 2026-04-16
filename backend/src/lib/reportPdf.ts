import PDFDocument from 'pdfkit';
import SVGtoPDF from 'svg-to-pdfkit';
import { AiAnalysis, ScenarioResult, SetupConfig } from '../types.js';

const currencyMap: Record<SetupConfig['currencyCode'], string> = {
  USD: '$',
  EUR: '€',
  KZT: '₸',
  RUB: '₽'
};

const fmtMoney = (value: number, currency: SetupConfig['currencyCode']) => `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)} ${currencyMap[currency]}`;
const fmtPct = (value: number) => `${(value * 100).toFixed(1)}%`;

const lineSvg = (values: number[], color: string, width = 460, height = 180) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const path = values.map((value, index) => {
    const x = (index / Math.max(values.length - 1, 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  return `<svg width="${width}" height="${height + 30}" viewBox="0 0 ${width} ${height + 30}" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="${width}" height="${height + 30}" fill="#ffffff" rx="16"/>
    <line x1="0" y1="${height}" x2="${width}" y2="${height}" stroke="#d1d5db" stroke-width="1"/>
    <path d="${path}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
};

export const buildPdfReportBuffer = async ({
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
  const active = scenarios.find((item) => item.id === selectedScenarioId) ?? scenarios[0];
  const latest = active.timeline.at(-1)!;
  const chunks: Buffer[] = [];
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  doc.on('data', (chunk) => chunks.push(Buffer.from(chunk)));

  doc.fontSize(10).fillColor('#64748b').text('ProfitLab / Automated Business Report');
  doc.moveDown(0.5);
  doc.fontSize(24).fillColor('#0f172a').text(config.businessName);
  doc.moveDown(0.3);
  doc.fontSize(11).fillColor('#475569').text(`Prepared from the current simulation state | Region: ${config.region} | Horizon: ${config.timeHorizon} months | Currency: ${config.currencyCode}`);
  doc.moveDown(1.2);

  doc.roundedRect(50, doc.y, 495, 95, 16).fillAndStroke('#f8fafc', '#e2e8f0');
  doc.fillColor('#0f172a').fontSize(11).text('Executive summary', 70, doc.y - 82);
  doc.fontSize(18).text(active.viabilityVerdict, 70, doc.y - 62);
  doc.fontSize(11).fillColor('#334155').text(active.explanation, 70, doc.y - 35, { width: 455 });
  doc.moveDown(5.6);

  const metricY = doc.y;
  const metricWidth = 152;
  const metrics = [
    ['Final revenue', fmtMoney(latest.revenue, config.currencyCode)],
    ['Final net profit', fmtMoney(latest.netProfit, config.currencyCode)],
    ['Ending cash', fmtMoney(latest.cashBalance, config.currencyCode)]
  ];
  metrics.forEach(([label, value], index) => {
    const x = 50 + index * (metricWidth + 19.5);
    doc.roundedRect(x, metricY, metricWidth, 62, 14).fillAndStroke('#ffffff', '#e2e8f0');
    doc.fillColor('#64748b').fontSize(9).text(label, x + 14, metricY + 12);
    doc.fillColor('#0f172a').fontSize(15).text(value, x + 14, metricY + 30);
  });
  doc.moveDown(4.8);

  doc.fillColor('#0f172a').fontSize(14).text('Assumptions used');
  doc.moveDown(0.5);
  const assumptions = [
    `Strategy: ${config.strategy}`,
    `Starting cash: ${fmtMoney(config.startingCash, config.currencyCode)}`,
    `Average price: ${fmtMoney(config.averagePrice, config.currencyCode)}`,
    `Conversion rate: ${fmtPct(config.conversionRate)}`,
    `Repeat purchase rate: ${fmtPct(config.repeatPurchaseRate)}`,
    `Inflation: ${fmtPct(config.inflation)}`,
    `Competition pressure: ${fmtPct(config.competitionPressure)}`,
    `Break-even month: ${active.breakEvenMonth ? active.breakEvenMonth : 'Not reached'}`
  ];
  assumptions.forEach((item) => doc.fontSize(10.5).fillColor('#334155').text(`• ${item}`));
  doc.moveDown(1);

  doc.fillColor('#0f172a').fontSize(14).text('Scenario comparison');
  doc.moveDown(0.7);
  const startY = doc.y;
  const columns = [50, 150, 250, 355, 455];
  ['Scenario', 'Revenue', 'Net Profit', 'Cash', 'Verdict'].forEach((title, i) => doc.fontSize(10).fillColor('#64748b').text(title, columns[i], startY));
  let rowY = startY + 18;
  scenarios.forEach((scenario) => {
    const point = scenario.timeline.at(-1)!;
    doc.fillColor('#0f172a').fontSize(10.5).text(scenario.name, columns[0], rowY);
    doc.text(fmtMoney(point.revenue, config.currencyCode), columns[1], rowY);
    doc.text(fmtMoney(point.netProfit, config.currencyCode), columns[2], rowY);
    doc.text(fmtMoney(point.cashBalance, config.currencyCode), columns[3], rowY);
    doc.text(scenario.viabilityVerdict, columns[4], rowY);
    rowY += 18;
  });

  if (rowY > 650) doc.addPage(); else doc.y = rowY + 18;

  doc.fillColor('#0f172a').fontSize(14).text('Charts');
  doc.moveDown(0.5);
  SVGtoPDF(doc as any, lineSvg(active.timeline.map((item) => item.revenue), '#2563eb'), 50, doc.y, { width: 240, height: 120 });
  SVGtoPDF(doc as any, lineSvg(active.timeline.map((item) => item.netProfit), '#16a34a'), 305, doc.y, { width: 240, height: 120 });
  doc.moveDown(10.5);
  doc.fontSize(9).fillColor('#64748b').text('Revenue trend', 50, doc.y - 6);
  doc.text('Net profit trend', 305, doc.y - 6);
  SVGtoPDF(doc as any, lineSvg(active.timeline.map((item) => item.cashBalance), '#d97706'), 50, doc.y + 16, { width: 240, height: 120 });
  SVGtoPDF(doc as any, lineSvg(active.timeline.map((item) => item.customers), '#7c3aed'), 305, doc.y + 16, { width: 240, height: 120 });
  doc.moveDown(10.2);

  if (doc.y > 620) doc.addPage();

  doc.fillColor('#0f172a').fontSize(14).text('Recommendations');
  doc.moveDown(0.6);
  active.recommendations.forEach((item) => doc.fontSize(10.5).fillColor('#334155').text(`• ${item}`));
  doc.moveDown(0.8);

  if (aiAnalysis) {
    doc.fillColor('#0f172a').fontSize(14).text('AI analysis layer');
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#64748b').text(`Generated by: ${aiAnalysis.generatedBy}`);
    doc.moveDown(0.5);
    aiAnalysis.executiveSummary.forEach((item) => doc.fontSize(10.5).fillColor('#334155').text(`• ${item}`));
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#0f172a').text('Smart warnings');
    aiAnalysis.smartWarnings.forEach((item) => doc.fontSize(10.5).fillColor('#334155').text(`• ${item}`));
  }

  doc.moveDown(1.4);
  doc.fontSize(9).fillColor('#94a3b8').text('Prepared automatically from the ProfitLab simulation model.', { align: 'left' });
  doc.end();

  return new Promise<Buffer>((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });
};
