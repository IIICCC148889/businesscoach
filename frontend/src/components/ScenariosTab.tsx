import { useAppStore } from '../lib/store';
import { Panel, SectionTitle } from './ui';

export function ScenariosTab() {
  const { scenarios, currentMonth } = useAppStore();

  return (
    <div className="space-y-6">
      <Panel className="p-6">
        <SectionTitle title="Scenario comparison" subtitle={`Compare all cases at month ${currentMonth}.`} />
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-mutedInk">
              <tr>
                <th className="pb-3">Scenario</th>
                <th className="pb-3">Revenue</th>
                <th className="pb-3">Net Profit</th>
                <th className="pb-3">Cash</th>
                <th className="pb-3">Break-even</th>
                <th className="pb-3">Resilience</th>
                <th className="pb-3">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((scenario) => {
                const point = scenario.timeline[currentMonth - 1];
                return (
                  <tr key={scenario.id} className="border-t border-borderSoft">
                    <td className="py-3 font-semibold text-ink">{scenario.name}</td>
                    <td className="py-3">${point.revenue.toLocaleString()}</td>
                    <td className="py-3">${point.netProfit.toLocaleString()}</td>
                    <td className="py-3">${point.cashBalance.toLocaleString()}</td>
                    <td className="py-3">{scenario.breakEvenMonth ? `M${scenario.breakEvenMonth}` : '—'}</td>
                    <td className="py-3">{scenario.resilienceScore}</td>
                    <td className="py-3">{scenario.viabilityVerdict}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
      <div className="grid gap-6 xl:grid-cols-2">
        {scenarios.map((scenario) => (
          <Panel key={scenario.id} className="p-6">
            <SectionTitle title={scenario.name} subtitle={scenario.explanation} />
            <div className="space-y-2 text-sm text-mutedInk">
              {scenario.recommendations.map((rec) => <div key={rec} className="rounded-2xl bg-slate-50 p-3">{rec}</div>)}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
