import { selectCurrentScenario, useAppStore } from '../lib/store';
import { Panel, SectionTitle } from './ui';

export function InsightsTab() {
  const store = useAppStore();
  const scenario = selectCurrentScenario(store);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <Panel className="p-6">
        <SectionTitle title="Sensitivity analysis" subtitle="Which variables move the outcome the most." />
        <div className="space-y-3">
          {scenario.sensitivity.map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex justify-between text-sm"><span>{item.label}</span><span>{item.impact}</span></div>
              <div className="h-3 rounded-full bg-slate-100">
                <div className="h-3 rounded-full bg-slate-900" style={{ width: `${Math.min(100, item.impact / 14)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel className="p-6">
        <SectionTitle title="Main risks" />
        <div className="space-y-3 text-sm text-mutedInk">
          {scenario.mainRisks.map((item) => <div key={item} className="rounded-2xl border border-borderSoft p-4">{item}</div>)}
        </div>
      </Panel>
      <Panel className="p-6">
        <SectionTitle title="What should I change first?" />
        <ol className="space-y-3 text-sm text-mutedInk">
          {scenario.recommendations.map((item, index) => <li key={item} className="rounded-2xl bg-slate-50 p-4"><span className="font-semibold text-ink">{index + 1}.</span> {item}</li>)}
        </ol>
      </Panel>
      <Panel className="p-6">
        <SectionTitle title="Explanation layer" />
        <p className="text-sm leading-7 text-mutedInk">This model behaves like a system: price, conversion, retention, fixed costs, and demand shocks interact over time. The simulator is most useful when you treat it as a way to test cause-and-effect, not just profitability in a single month.</p>
      </Panel>
    </div>
  );
}
