import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { requestAiAnalysis } from '../lib/api';
import { downloadAnalysisReport } from '../lib/exportAnalysis';
import { formatCurrency, formatMonths, formatPercent } from '../lib/format';
import { selectCurrentScenario, useAppStore } from '../lib/store';
import { AiAnalysis } from '../lib/types';
import { MetricCard, Panel, SectionTitle } from './ui';

export function ReportTab() {
  const store = useAppStore();
  const scenario = selectCurrentScenario(store);
  const latest = scenario.timeline[scenario.timeline.length - 1];
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAi = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await requestAiAnalysis({ config: store.config, scenarios: store.scenarios, selectedScenarioId: store.selectedScenarioId });
      setAiAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load AI analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setError(null);
      await downloadAnalysisReport({ config: store.config, scenarios: store.scenarios, selectedScenarioId: store.selectedScenarioId, aiAnalysis });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export report');
    }
  };

  return (
    <div className="space-y-6">
      <Panel className="p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <SectionTitle title="Executive report" subtitle="Formal business output for sharing with founders, investors, or reviewers." />
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 rounded-full border border-borderSoft bg-panelAlt px-4 py-2 text-sm font-medium text-ink" onClick={handleAi}><Sparkles size={16} /> {loading ? 'Generating...' : 'Generate AI analysis'}</button>
            <button className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white" onClick={handleExport}>Download PDF report</button>
          </div>
        </div>
        {error ? <div className="mb-4 rounded-2xl border border-danger/40 bg-panelAlt p-3 text-sm text-danger">{error}</div> : null}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Final Revenue" value={formatCurrency(latest.revenue, store.config.currencyCode)} />
          <MetricCard label="Final Net Profit" value={formatCurrency(latest.netProfit, store.config.currencyCode)} tone={latest.netProfit >= 0 ? 'positive' : 'danger'} />
          <MetricCard label="Ending Cash" value={formatCurrency(latest.cashBalance, store.config.currencyCode)} tone={latest.cashBalance >= 0 ? 'positive' : 'danger'} />
          <MetricCard label="Viability Verdict" value={scenario.viabilityVerdict} tone={scenario.viabilityVerdict === 'Viable' ? 'positive' : scenario.viabilityVerdict === 'Not Viable' ? 'danger' : 'warning'} />
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel className="p-6">
          <SectionTitle title="Assumptions used" />
          <div className="space-y-2 text-sm text-mutedInk">
            <div>Model type: custom universal model</div>
            <div>Strategy: {store.config.strategy}</div>
            <div>Region: {store.config.region}</div>
            <div>Time horizon: {store.config.timeHorizon} months</div>
            <div>Currency: {store.config.currencyCode}</div>
            <div>Inflation: {formatPercent(store.config.inflation)}</div>
            <div>Competition pressure: {formatPercent(store.config.competitionPressure)}</div>
            <div>Break-even month: {formatMonths(scenario.breakEvenMonth)}</div>
          </div>
        </Panel>
        <Panel className="p-6">
          <SectionTitle title="Key recommendations" />
          <div className="space-y-3 text-sm text-mutedInk">
            {scenario.recommendations.map((item) => <div key={item} className="rounded-2xl border border-borderSoft bg-panelAlt p-4">{item}</div>)}
          </div>
        </Panel>
      </div>

      {aiAnalysis ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <Panel className="p-6">
            <SectionTitle title="AI executive summary" subtitle={`Generated using ${aiAnalysis.generatedBy === 'openai' ? 'OpenAI-backed analysis' : 'fallback heuristic analysis'}.`} />
            <div className="space-y-3 text-sm text-mutedInk">
              {aiAnalysis.executiveSummary.map((item) => <div key={item} className="rounded-2xl border border-borderSoft bg-panelAlt p-4">{item}</div>)}
            </div>
          </Panel>
          <Panel className="p-6">
            <SectionTitle title="Founder plan" />
            <div className="space-y-4 text-sm text-mutedInk">
              <div>
                <div className="mb-2 text-xs uppercase tracking-[0.16em] text-mutedInk">Next 7 days</div>
                <div className="space-y-2">{aiAnalysis.founderPlan.next7Days.map((item) => <div key={item} className="rounded-2xl border border-borderSoft bg-panelAlt p-3">{item}</div>)}</div>
              </div>
              <div>
                <div className="mb-2 text-xs uppercase tracking-[0.16em] text-mutedInk">Next 30 days</div>
                <div className="space-y-2">{aiAnalysis.founderPlan.next30Days.map((item) => <div key={item} className="rounded-2xl border border-borderSoft bg-panelAlt p-3">{item}</div>)}</div>
              </div>
            </div>
          </Panel>
        </div>
      ) : null}
    </div>
  );
}
