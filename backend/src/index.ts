import cors from 'cors';
import express from 'express';
import { aiRouter } from './routes/ai.js';
import { reportRouter } from './routes/report.js';
import { simulateRouter } from './routes/simulate.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'profitlab-backend' });
});

app.use('/api/simulate', simulateRouter);
app.use('/api/report', reportRouter);
app.use('/api/ai', aiRouter);

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => {
  console.log(`ProfitLab backend running on http://localhost:${port}`);
});
