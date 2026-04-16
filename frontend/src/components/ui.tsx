import { ReactNode } from 'react';
import clsx from 'clsx';

export const Panel = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={clsx('rounded-[28px] border border-borderSoft bg-panel shadow-soft', className)}>{children}</div>
);

export const SectionTitle = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) => (
  <div className="mb-4 flex items-start justify-between gap-4">
    <div>
      <h3 className="text-base font-semibold tracking-wide text-ink">{title}</h3>
      {subtitle ? <p className="mt-1 text-sm text-mutedInk">{subtitle}</p> : null}
    </div>
    {action}
  </div>
);

export const MetricCard = ({ label, value, tone = 'default', helper }: { label: string; value: string; tone?: 'default' | 'positive' | 'warning' | 'danger'; helper?: string }) => {
  const toneClass = {
    default: 'text-ink',
    positive: 'text-positive',
    warning: 'text-warning',
    danger: 'text-danger'
  }[tone];

  return (
    <Panel className="p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-mutedInk">{label}</div>
      <div className={clsx('mt-3 text-2xl font-semibold', toneClass)}>{value}</div>
      {helper ? <div className="mt-2 text-xs text-mutedInk">{helper}</div> : null}
    </Panel>
  );
};

export const SliderField = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  displayValue
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  displayValue?: string;
}) => (
  <label className="block rounded-2xl border border-borderSoft bg-panelAlt p-3">
    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
      <span className="font-medium text-ink">{label}</span>
      <span className="text-mutedInk">{displayValue ?? value}</span>
    </div>
    <input className="slider-dark w-full" type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
  </label>
);

export const PillButton = ({ active, children, onClick }: { active?: boolean; children: ReactNode; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={clsx(
      'rounded-full border px-4 py-2 text-sm transition',
      active ? 'border-accent bg-accent text-white' : 'border-borderSoft bg-panelAlt text-mutedInk hover:border-slate-500 hover:text-ink'
    )}
  >
    {children}
  </button>
);
