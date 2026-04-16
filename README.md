# ProfitLab MVP

Monorepo with a React + TypeScript frontend and Express + TypeScript backend.

## Stack
- Frontend: Vite, React, TypeScript, TailwindCSS, Recharts, Zustand
- Backend: Express, TypeScript
- Shared simulation model: duplicated minimal types + deterministic engine logic

## Run
```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8787

## MVP scope
- Setup tab with business presets and key inputs
- Simulation tab with time slider, KPI cards, controls, graph, risks, explanation, timeline
- Scenarios tab with base/optimistic/conservative/crisis comparison
- Insights tab with sensitivity ranking and recommendations
- Report tab with viability verdict and summary
- API endpoint for running the simulation

## Notes
This is the first working foundation focused on the simulator UX and extendable business logic.
