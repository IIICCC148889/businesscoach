import { create } from 'zustand';
import { buildScenarios } from './simulation';
import { defaultConfig } from './presets';
import { GraphMode, ScenarioResult, SetupConfig } from './types';

interface AppState {
  activeTab: 'Setup' | 'Simulation' | 'Report';
  config: SetupConfig;
  scenarios: ScenarioResult[];
  currentMonth: number;
  graphMode: GraphMode;
  selectedScenarioId: string;
  playSpeed: 1 | 2 | 4;
  isPlaying: boolean;
  updateConfig: <K extends keyof SetupConfig>(key: K, value: SetupConfig[K]) => void;
  rerun: () => void;
  setActiveTab: (tab: AppState['activeTab']) => void;
  setMonth: (month: number) => void;
  setGraphMode: (mode: GraphMode) => void;
  setScenario: (scenarioId: string) => void;
  setPlaying: (value: boolean) => void;
  setPlaySpeed: (speed: 1 | 2 | 4) => void;
  resetTimeline: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'Setup',
  config: defaultConfig,
  scenarios: buildScenarios(defaultConfig),
  currentMonth: 1,
  graphMode: 'overview',
  selectedScenarioId: 'base',
  playSpeed: 1,
  isPlaying: false,
  updateConfig: (key, value) => set((state) => ({ config: { ...state.config, [key]: value } })),
  rerun: () => set((state) => ({ scenarios: buildScenarios(state.config), activeTab: 'Simulation', selectedScenarioId: 'base', currentMonth: 1 })),
  setActiveTab: (activeTab) => set({ activeTab }),
  setMonth: (currentMonth) => set({ currentMonth }),
  setGraphMode: (graphMode) => set({ graphMode }),
  setScenario: (selectedScenarioId) => set({ selectedScenarioId }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setPlaySpeed: (playSpeed) => set({ playSpeed }),
  resetTimeline: () => set({ currentMonth: 1, isPlaying: false })
}));

export const selectCurrentScenario = (state: AppState) => state.scenarios.find((item) => item.id === state.selectedScenarioId) ?? state.scenarios[0];
