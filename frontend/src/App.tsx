import { FileText, PlayCircle, SlidersHorizontal } from 'lucide-react';
import { ReportTab } from './components/ReportTab';
import { SetupTab } from './components/SetupTab';
import { SimulationTab } from './components/SimulationTab';
import { useAppStore } from './lib/store';

const tabs = [
  { name: 'Setup', icon: SlidersHorizontal },
  { name: 'Simulation', icon: PlayCircle },
  { name: 'Report', icon: FileText }
] as const;

export default function App() {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <div className="min-h-screen bg-app px-4 py-6 text-ink lg:px-8">
      <div className="mx-auto max-w-[1680px]">
        <header className="mb-6 flex flex-col gap-4 rounded-[28px] border border-borderSoft bg-panel px-6 py-5 shadow-soft xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-mutedInk">ProfitLab</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Business Mechanics Simulator</h1>
            <p className="mt-2 max-w-3xl text-sm text-mutedInk">A universal business modeling workstation for scenario planning, risk pressure-testing, AI narrative analysis, and formal reporting.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition ${activeTab === tab.name ? 'border-accent bg-accent text-white' : 'border-borderSoft bg-panelAlt text-mutedInk hover:border-slate-500 hover:text-ink'}`}
                >
                  <Icon size={16} />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </header>

        {activeTab === 'Setup' && <SetupTab />}
        {activeTab === 'Simulation' && <SimulationTab />}
        {activeTab === 'Report' && <ReportTab />}
      </div>
    </div>
  );
}
