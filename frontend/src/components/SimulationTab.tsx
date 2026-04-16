import { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar
} from 'recharts';
import { Sparkles } from 'lucide-react';
import { requestAiAnalysis } from '../lib/api';
import { downloadAnalysisReport } from '../lib/exportAnalysis';
import { formatCurrency, formatMetricValue, formatMonths, formatNumber, formatPercent } from '../lib/format';
import { selectCurrentScenario, useAppStore } from '../lib/store';
import { AiAnalysis } from '../lib/types';
import { MetricCard, Panel, PillButton, SectionTitle, SliderField } from './ui';

const graphMap = {
  overview: { key: 'overview', label: 'Overlay' },
  revenue: { key: 'revenue', label: 'Revenue' },
  profit: { key: 'netProfit', label: 'Net Profit' },
  cash: { key: 'cashBalance', label: 'Cash Balance' },
  customers: { key: 'customers', label: 'Customer Base' },
  margin: { key: 'margin', label: 'Margin' }
} as const;

const metricColors = {
  revenue: '#60a5fa',
  netProfit: '#34d399',
  cashBalance: '#f59e0b',
  customers: '#c084fc',
  margin: '#fb7185'
};

const scenarioColors: Record<string, string> = {
  Base: '#60a5fa',
  Optimistic: '#34d399',
  Conservative: '#f59e0b',
  Crisis: '#f87171'
};

export function SimulationTab() {
  const store = useAppStore();
  const scenario = selectCurrentScenario(store);
  const monthPoint = scenario.timeline[Math.max(0, store.currentMonth - 1)];
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (!store.isPlaying) return undefined;
    const interval = window.setInterval(() => {
      useAppStore.setState((state) => {
        if (state.currentMonth >= state.config.timeHorizon) return { isPlaying: false };
        return { currentMonth: state.currentMonth + 1 };
      });
    }, 1100 / store.playSpeed);
    return () => window.clearInterval(interval);
  }, [store.isPlaying, store.playSpeed]);

  const overlayData = useMemo(() => scenario.timeline.map((item) => ({
    ...item,
    marginScaled: Math.round(item.margin * 1000)
  })), [scenario.timeline]);

  const scenarioCompare = useMemo(() => {
    return scenario.timeline.map((point, index) => {
      const row: Record<string, string | number> = { label: point.label };
      store.scenarios.forEach((item) => {
        row[item.name] = item.timeline[index].netProfit;
      });
      return row;
    });
  }, [scenario.timeline, store.scenarios]);

  const loadAi = async () => {
    try {
      setLoadingAi(true);
      setAiError(null);
      const result = await requestAiAnalysis({ config: store.config, scenarios: store.scenarios, selectedScenarioId: store.selectedScenarioId });
      setAiAnalysis(result);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'AI analysis failed');
    } finally {
      setLoadingAi(false);
    }
  };

  const exportReport = async () => {
    try {
      await downloadAnalysisReport({
        config: store.config,
        scenarios: store.scenarios,
        selectedScenarioId: store.selectedScenarioId,
        aiAnalysis
      });
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Report export failed');
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="min-w-[220px] rounded-2xl border border-borderSoft bg-panel px-4 py-3 shadow-soft">
        <div className="mb-2 text-xs uppercase tracking-[0.16em] text-mutedInk">{label}</div>
        <div className="space-y-2 text-sm">
          {payload.map((entry: any) => (
            <div key={entry.dataKey} className="flex items-center justify-between gap-3">
              <span className="text-mutedInk">{entry.name}</span>
              <span className="font-medium text-ink">{formatMetricValue(entry.dataKey === 'marginScaled' ? 'margin' : entry.dataKey, entry.dataKey === 'marginScaled' ? entry.value / 1000 : entry.value, store.config.currencyCode)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Panel className="p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-mutedInk">Live simulation</div>
            <h2 className="mt-2 text-2xl font-semibold text-ink">{store.config.businessName}</h2>
            <p className="mt-2 max-w-3xl text-sm text-mutedInk">The main workspace now combines time controls, scenarios, risks, AI narrative, and formal export inside one serious simulation station.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {store.scenarios.map((item) => (
              <PillButton key={item.id} active={store.selectedScenarioId === item.id} onClick={() => store.setScenario(item.id)}>
                {item.name}
              </PillButton>
            ))}
            <PillButton onClick={() => store.setPlaying(!store.isPlaying)}>{store.isPlaying ? 'Pause' : 'Play'}</PillButton>
            <PillButton onClick={store.resetTimeline}>Reset</PillButton>
            {[1, 2, 4].map((speed) => <PillButton key={speed} active={store.playSpeed === speed} onClick={() => store.setPlaySpeed(speed as 1 | 2 | 4)}>x{speed}</PillButton>)}
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[24px] border border-borderSoft bg-panelAlt p-5">
            <div className="mb-3 flex items-center justify-between gap-3 text-sm">
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-mutedInk">Time controller</div>
                <div className="mt-1 font-medium text-ink">Current month: {store.currentMonth}</div>
              </div>
              <div className="text-right text-xs text-mutedInk">Horizon: {store.config.timeHorizon} months</div>
            </div>
            <input className="slider-dark w-full" type="range" min={1} max={store.config.timeHorizon} step={1} value={store.currentMonth} onChange={(e) => store.setMonth(Number(e.target.value))} />
          </div>
          <div className="rounded-[24px] border border-borderSoft bg-panelAlt p-5">
            <div className="text-xs uppercase tracking-[0.16em] text-mutedInk">Current status</div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-mutedInk">Risk level</span>
              <span className="font-medium text-ink">{scenario.riskLevel}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-mutedInk">Break-even</span>
              <span className="font-medium text-ink">{formatMonths(scenario.breakEvenMonth)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-mutedInk">Resilience</span>
              <span className="font-medium text-ink">{scenario.resilienceScore}/100</span>
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Panel className="p-5">
            <SectionTitle title="Control panel" subtitle="Live changes re-run scenarios reactively." />
            <div className="space-y-3">
              <SliderField label="Price" value={store.config.averagePrice} min={1} max={500} step={1} onChange={(v) => store.updateConfig('averagePrice', v)} displayValue={formatCurrency(store.config.averagePrice, store.config.currencyCode)} />
              <SliderField label="Traffic" value={store.config.traffic} min={100} max={50000} step={100} onChange={(v) => store.updateConfig('traffic', v)} displayValue={formatNumber(store.config.traffic)} />
              <SliderField label="Conversion" value={Number((store.config.conversionRate * 100).toFixed(1))} min={1} max={95} step={0.5} onChange={(v) => store.updateConfig('conversionRate', v / 100)} displayValue={formatPercent(store.config.conversionRate)} />
              <SliderField label="Repeat purchase" value={Number((store.config.repeatPurchaseRate * 100).toFixed(1))} min={0} max={95} step={0.5} onChange={(v) => store.updateConfig('repeatPurchaseRate', v / 100)} displayValue={formatPercent(store.config.repeatPurchaseRate)} />
              <SliderField label="Rent" value={store.config.rent} min={0} max={40000} step={100} onChange={(v) => store.updateConfig('rent', v)} displayValue={formatCurrency(store.config.rent, store.config.currencyCode)} />
              <SliderField label="Marketing" value={store.config.marketingSpend} min={0} max={30000} step={100} onChange={(v) => store.updateConfig('marketingSpend', v)} displayValue={formatCurrency(store.config.marketingSpend, store.config.currencyCode)} />
              <button className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white" onClick={store.rerun}>Recalculate model</button>
            </div>
          </Panel>

          <Panel className="p-5">
            <SectionTitle title="Sensitivity" subtitle="What drives the model fastest." />
            <div className="h-[250px] w-full">
              <ResponsiveContainer>
                <BarChart data={scenario.sensitivity} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis dataKey="label" type="category" stroke="#94a3b8" width={90} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 16, color: '#e2e8f0' }} />
                  <Bar dataKey="impact" fill="#60a5fa" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <MetricCard label="Revenue" value={formatCurrency(monthPoint.revenue, store.config.currencyCode)} helper="Current month" />
            <MetricCard label="Net Profit" value={formatCurrency(monthPoint.netProfit, store.config.currencyCode)} tone={monthPoint.netProfit >= 0 ? 'positive' : 'danger'} helper="Current month" />
            <MetricCard label="Cash Balance" value={formatCurrency(monthPoint.cashBalance, store.config.currencyCode)} tone={monthPoint.cashBalance >= 0 ? 'positive' : 'danger'} helper="Current month" />
            <MetricCard label="Gross Margin" value={formatPercent(monthPoint.margin)} tone={monthPoint.margin >= 0.18 ? 'positive' : 'warning'} />
            <MetricCard label="Break-even Month" value={formatMonths(scenario.breakEvenMonth)} />
            <MetricCard label="Resilience Score" value={`${scenario.resilienceScore}/100`} tone={scenario.riskLevel === 'Low' ? 'positive' : scenario.riskLevel === 'High' ? 'danger' : 'warning'} />
          </div>

          <Panel className="p-5">
            <SectionTitle
              title="Main visualization"
              subtitle="Overlay view shows all major curves at once; single-metric modes remain available for deeper reading."
              action={<div className="flex flex-wrap gap-2">{Object.keys(graphMap).map((mode) => <PillButton key={mode} active={store.graphMode === mode} onClick={() => store.setGraphMode(mode as any)}>{graphMap[mode as keyof typeof graphMap].label}</PillButton>)}</div>}
            />
            <div className="h-[420px] w-full">
              <ResponsiveContainer>
                <LineChart data={overlayData}>
                  <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                  <XAxis dataKey="label" stroke="#94a3b8" />
                  <YAxis tickFormatter={(value) => typeof value === 'number' ? formatNumber(value, true) : value} stroke="#94a3b8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {store.graphMode === 'overview' ? (
                    <>
                      <Line type="monotone" dataKey="revenue" stroke={metricColors.revenue} strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} name="Revenue" />
                      <Line type="monotone" dataKey="netProfit" stroke={metricColors.netProfit} strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} name="Net Profit" />
                      <Line type="monotone" dataKey="cashBalance" stroke={metricColors.cashBalance} strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} name="Cash Balance" />
                      <Line type="monotone" dataKey="customers" stroke={metricColors.customers} strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} name="Customer Base" />
                      <Line type="monotone" dataKey="marginScaled" stroke={metricColors.margin} strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} name="Margin" />
                    </>
                  ) : (
                    <Line type="monotone" dataKey={graphMap[store.graphMode].key} stroke={metricColors[graphMap[store.graphMode].key as keyof typeof metricColors]} strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} name={graphMap[store.graphMode].label} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel className="p-5">
            <SectionTitle title="Scenario comparison inside simulation" subtitle={`Comparing all scenarios at month ${store.currentMonth}.`} />
            <div className="mb-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-mutedInk">
                  <tr>
                    <th className="pb-3">Scenario</th>
                    <th className="pb-3">Revenue</th>
                    <th className="pb-3">Net Profit</th>
                    <th className="pb-3">Cash</th>
                    <th className="pb-3">Break-even</th>
                    <th className="pb-3">Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {store.scenarios.map((item) => {
                    const row = item.timeline[store.currentMonth - 1];
                    return (
                      <tr key={item.id} className="border-t border-borderSoft text-ink">
                        <td className="py-3 font-semibold">{item.name}</td>
                        <td className="py-3">{formatCurrency(row.revenue, store.config.currencyCode)}</td>
                        <td className="py-3">{formatCurrency(row.netProfit, store.config.currencyCode)}</td>
                        <td className="py-3">{formatCurrency(row.cashBalance, store.config.currencyCode)}</td>
                        <td className="py-3">{formatMonths(item.breakEvenMonth)}</td>
                        <td className="py-3 text-mutedInk">{item.viabilityVerdict}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer>
                <LineChart data={scenarioCompare}>
                  <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                  <XAxis dataKey="label" stroke="#94a3b8" />
                  <YAxis tickFormatter={(value) => typeof value === 'number' ? formatNumber(value, true) : value} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 16, color: '#e2e8f0' }} formatter={(value: any) => formatCurrency(Number(value), store.config.currencyCode)} />
                  <Legend />
                  {store.scenarios.map((item) => (
                    <Line key={item.id} type="monotone" dataKey={item.name} stroke={scenarioColors[item.name] ?? '#cbd5e1'} strokeWidth={3} dot={{ r: 2 }} activeDot={{ r: 5 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel className="p-5">
            <SectionTitle title="Risk & health" subtitle="Right rail for immediate decision signals." />
            <div className="space-y-3 text-sm text-mutedInk">
              <div className="rounded-2xl border border-borderSoft bg-panelAlt p-4"><span className="font-semibold text-ink">Risk level:</span> {scenario.riskLevel}</div>
              {scenario.mainRisks.map((risk) => (
                <div key={risk} className="rounded-2xl border border-borderSoft bg-panelAlt p-4">{risk}</div>
              ))}
            </div>
          </Panel>

          <Panel className="p-5">
            <SectionTitle title="Dynamic explanation" />
            <p className="text-sm leading-6 text-mutedInk">{scenario.explanation}</p>
          </Panel>

          <Panel className="p-5">
            <SectionTitle title="Founder action stack" subtitle="Practical priorities, not just labels." />
            <div className="space-y-4 text-sm text-mutedInk">
              <div>
                <div className="mb-2 text-xs uppercase tracking-[0.16em] text-mutedInk">Fix first</div>
                <div className="space-y-2">{scenario.founderActions.fixFirst.map((item) => <div key={item} className="rounded-2xl border border-borderSoft bg-panelAlt p-3">{item}</div>)}</div>
              </div>
              <div>
                <div className="mb-2 text-xs uppercase tracking-[0.16em] text-mutedInk">Improve next</div>
                <div className="space-y-2">{scenario.founderActions.improveNext.map((item) => <div key={item} className="rounded-2xl border border-borderSoft bg-panelAlt p-3">{item}</div>)}</div>
              </div>
              <div>
                <div className="mb-2 text-xs uppercase tracking-[0.16em] text-mutedInk">Avoid for now</div>
                <div className="space-y-2">{scenario.founderActions.avoidNow.map((item) => <div key={item} className="rounded-2xl border border-borderSoft bg-panelAlt p-3">{item}</div>)}</div>
              </div>
            </div>
          </Panel>

          <Panel className="p-5">
            <SectionTitle
              title="AI decision memo"
              subtitle="Executive narrative, investor view, and warnings generated from current scenarios."
              action={<button className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white" onClick={loadAi}><Sparkles size={16} /> {loadingAi ? 'Generating...' : 'Refresh AI memo'}</button>}
            />
            {aiError ? <div className="mb-3 rounded-2xl border border-danger/40 bg-panelAlt p-3 text-sm text-danger">{aiError}</div> : null}
            {aiAnalysis ? (
              <div className="space-y-4 text-sm text-mutedInk">
                <div>
                  <div className="mb-2 text-xs uppercase tracking-[0.16em] text-mutedInk">Executive summary</div>
                  <div className="space-y-2">{aiAnalysis.executiveSummary.map((item) => <div key={item} className="rounded-2xl border border-borderSoft bg-panelAlt p-3">{item}</div>)}</div>
                </div>
                <div>
                  <div className="mb-2 text-xs uppercase tracking-[0.16em] text-mutedInk">Smart warnings</div>
                  <div className="space-y-2">{aiAnalysis.smartWarnings.map((item) => <div key={item} className="rounded-2xl border border-borderSoft bg-panelAlt p-3">{item}</div>)}</div>
                </div>
              </div>
            ) : <div className="rounded-2xl border border-borderSoft bg-panelAlt p-4 text-sm text-mutedInk">Generate an AI memo to add executive commentary, investor framing, scenario delta analysis, and concrete action sequencing.</div>}
            <button className="mt-4 w-full rounded-2xl border border-borderSoft bg-panelAlt px-4 py-3 text-sm font-medium text-ink" onClick={exportReport}>Download formal PDF report</button>
          </Panel>
        </div>
      </div>

      <Panel className="p-5">
        <SectionTitle title="Event timeline" subtitle="Shocks and management actions across the horizon." />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {scenario.timeline.map((item) => (
            <div key={item.month} className={`rounded-2xl border p-4 ${item.month === store.currentMonth ? 'border-accent bg-panelAlt' : 'border-borderSoft bg-panel'}`}>
              <div className="text-sm font-semibold text-ink">Month {item.month}</div>
              <div className="mt-2 text-xs text-mutedInk">Cash: {formatCurrency(item.cashBalance, store.config.currencyCode)}</div>
              <div className="mt-2 text-xs text-mutedInk">{item.eventNotes[0] ?? 'Baseline progression'}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
