import { currencySymbols, formatCurrency, formatPercent } from '../lib/format';
import { useAppStore } from '../lib/store';
import { CurrencyCode } from '../lib/types';
import { Panel, PillButton, SectionTitle, SliderField } from './ui';

const strategies = ['Low-Cost', 'Balanced', 'Premium', 'Growth-First'] as const;
const horizons = [6, 12, 24] as const;
const currencies: CurrencyCode[] = ['USD', 'EUR', 'KZT', 'RUB'];

export function SetupTab() {
  const { config, updateConfig, rerun } = useAppStore();

  return (
    <div className="space-y-6">
      <Panel className="p-6">
        <SectionTitle title="Model setup" subtitle="Configure a universal business model before launching the simulation." />
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-5">
          <label className="rounded-2xl border border-borderSoft bg-panelAlt p-4">
            <div className="mb-2 text-xs uppercase tracking-[0.18em] text-mutedInk">Business name</div>
            <input className="w-full rounded-xl border border-borderSoft bg-panel px-3 py-2 text-sm text-ink outline-none" value={config.businessName} onChange={(e) => updateConfig('businessName', e.target.value)} />
          </label>
          <label className="rounded-2xl border border-borderSoft bg-panelAlt p-4">
            <div className="mb-2 text-xs uppercase tracking-[0.18em] text-mutedInk">Starting cash</div>
            <input className="w-full rounded-xl border border-borderSoft bg-panel px-3 py-2 text-sm text-ink outline-none" type="number" value={config.startingCash} onChange={(e) => updateConfig('startingCash', Number(e.target.value))} />
          </label>
          <label className="rounded-2xl border border-borderSoft bg-panelAlt p-4">
            <div className="mb-2 text-xs uppercase tracking-[0.18em] text-mutedInk">Launch month</div>
            <input className="w-full rounded-xl border border-borderSoft bg-panel px-3 py-2 text-sm text-ink outline-none" type="month" value={config.launchMonth} onChange={(e) => updateConfig('launchMonth', e.target.value)} />
          </label>
          <label className="rounded-2xl border border-borderSoft bg-panelAlt p-4">
            <div className="mb-2 text-xs uppercase tracking-[0.18em] text-mutedInk">Region / market</div>
            <input className="w-full rounded-xl border border-borderSoft bg-panel px-3 py-2 text-sm text-ink outline-none" value={config.region} onChange={(e) => updateConfig('region', e.target.value)} />
          </label>
          <label className="rounded-2xl border border-borderSoft bg-panelAlt p-4">
            <div className="mb-2 text-xs uppercase tracking-[0.18em] text-mutedInk">Currency</div>
            <select className="w-full rounded-xl border border-borderSoft bg-panel px-3 py-2 text-sm text-ink outline-none" value={config.currencyCode} onChange={(e) => updateConfig('currencyCode', e.target.value as CurrencyCode)}>
              {currencies.map((currency) => <option key={currency} value={currency}>{currency} ({currencySymbols[currency]})</option>)}
            </select>
          </label>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Panel className="p-6">
          <SectionTitle title="Strategy mode" subtitle="Strategy changes how the model is interpreted by scoring, recommendations, and AI narrative." />
          <div className="flex flex-wrap gap-3">
            {strategies.map((strategy) => (
              <PillButton key={strategy} active={config.strategy === strategy} onClick={() => updateConfig('strategy', strategy)}>
                {strategy}
              </PillButton>
            ))}
          </div>

          <div className="mt-6">
            <div className="mb-3 text-xs uppercase tracking-[0.18em] text-mutedInk">Time horizon</div>
            <div className="flex gap-3">
              {horizons.map((months) => (
                <PillButton key={months} active={config.timeHorizon === months} onClick={() => updateConfig('timeHorizon', months)}>
                  {months} months
                </PillButton>
              ))}
            </div>
          </div>
        </Panel>

        <Panel className="p-6">
          <SectionTitle title="Launch simulation" subtitle="This version works as a serious custom simulator, without starter business templates." />
          <div className="space-y-3 text-sm text-mutedInk">
            <div className="rounded-2xl border border-borderSoft bg-panelAlt p-4">The same engine can be used for service, retail, product, online, education, or mixed business models by adjusting pricing, demand, margin, and cost assumptions.</div>
            <div className="rounded-2xl border border-borderSoft bg-panelAlt p-4">AI analysis and PDF export use the same scenario data, so the report stays aligned with the simulation state.</div>
          </div>
          <button className="mt-5 w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white" onClick={rerun}>Run simulation</button>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel className="p-6">
          <SectionTitle title="Revenue drivers" />
          <div className="space-y-3">
            <SliderField label="Average price" value={config.averagePrice} min={1} max={500} step={1} onChange={(v) => updateConfig('averagePrice', v)} displayValue={formatCurrency(config.averagePrice, config.currencyCode)} />
            <SliderField label="Traffic / customers" value={config.traffic} min={100} max={50000} step={100} onChange={(v) => updateConfig('traffic', v)} displayValue={config.traffic.toLocaleString()} />
            <SliderField label="Conversion" value={Number((config.conversionRate * 100).toFixed(1))} min={1} max={95} step={0.5} onChange={(v) => updateConfig('conversionRate', v / 100)} displayValue={formatPercent(config.conversionRate)} />
            <SliderField label="Repeat purchase" value={Number((config.repeatPurchaseRate * 100).toFixed(1))} min={0} max={95} step={0.5} onChange={(v) => updateConfig('repeatPurchaseRate', v / 100)} displayValue={formatPercent(config.repeatPurchaseRate)} />
            <SliderField label="Monthly growth" value={Number((config.monthlyGrowthRate * 100).toFixed(1))} min={-10} max={20} step={0.5} onChange={(v) => updateConfig('monthlyGrowthRate', v / 100)} displayValue={formatPercent(config.monthlyGrowthRate)} />
          </div>
        </Panel>

        <Panel className="p-6">
          <SectionTitle title="Cost structure" />
          <div className="space-y-3">
            <SliderField label="Rent" value={config.rent} min={0} max={40000} step={100} onChange={(v) => updateConfig('rent', v)} displayValue={formatCurrency(config.rent, config.currencyCode)} />
            <SliderField label="Salaries" value={config.salaries} min={0} max={60000} step={100} onChange={(v) => updateConfig('salaries', v)} displayValue={formatCurrency(config.salaries, config.currencyCode)} />
            <SliderField label="Utilities" value={config.utilities} min={0} max={10000} step={50} onChange={(v) => updateConfig('utilities', v)} displayValue={formatCurrency(config.utilities, config.currencyCode)} />
            <SliderField label="Variable cost / sale" value={config.variableCostPerSale} min={0} max={250} step={1} onChange={(v) => updateConfig('variableCostPerSale', v)} displayValue={formatCurrency(config.variableCostPerSale, config.currencyCode)} />
            <SliderField label="Marketing spend" value={config.marketingSpend} min={0} max={30000} step={100} onChange={(v) => updateConfig('marketingSpend', v)} displayValue={formatCurrency(config.marketingSpend, config.currencyCode)} />
          </div>
        </Panel>

        <Panel className="p-6">
          <SectionTitle title="External conditions" />
          <div className="space-y-3">
            <SliderField label="Inflation" value={Number((config.inflation * 100).toFixed(1))} min={0} max={20} step={0.5} onChange={(v) => updateConfig('inflation', v / 100)} displayValue={formatPercent(config.inflation)} />
            <SliderField label="Rent growth" value={Number((config.rentGrowth * 100).toFixed(1))} min={0} max={15} step={0.5} onChange={(v) => updateConfig('rentGrowth', v / 100)} displayValue={formatPercent(config.rentGrowth)} />
            <SliderField label="Ad cost growth" value={Number((config.adCostGrowth * 100).toFixed(1))} min={0} max={20} step={0.5} onChange={(v) => updateConfig('adCostGrowth', v / 100)} displayValue={formatPercent(config.adCostGrowth)} />
            <SliderField label="Competition pressure" value={Number((config.competitionPressure * 100).toFixed(1))} min={0} max={40} step={0.5} onChange={(v) => updateConfig('competitionPressure', v / 100)} displayValue={formatPercent(config.competitionPressure)} />
            <SliderField label="Seasonality strength" value={Number((config.seasonalityStrength * 100).toFixed(1))} min={0} max={30} step={0.5} onChange={(v) => updateConfig('seasonalityStrength', v / 100)} displayValue={formatPercent(config.seasonalityStrength)} />
          </div>
        </Panel>
      </div>
    </div>
  );
}
