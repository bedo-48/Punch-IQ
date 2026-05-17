import {
  BarChart, Bar, XAxis, YAxis, Cell,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

import type { PredictionResponse } from '../types';


interface PredictionPanelProps {
  result: PredictionResponse | null;
  loading: boolean;
  error: string | null;
}


export default function PredictionPanel({ result, loading, error }: PredictionPanelProps) {
  if (loading) {
    return <div className="text-zinc-500 italic">Computing prediction...</div>;
  }
  if (error) {
    return <div className="text-red-400">Error: {error}</div>;
  }
  if (!result) {
    return <div className="text-zinc-600 italic">[No prediction yet — fill in both fighters and click Predict]</div>;
  }

  const winnerLabel = result.predicted_class === 'win_A' ? 'Fighter A' : 'Fighter B';
  const winnerProb = result.predicted_class === 'win_A'
    ? result.probability_win_a
    : result.probability_win_b;

  // Data pour le bar chart des probabilités
  const probData = [
    { name: 'Fighter A', value: result.probability_win_a, color: '#ef4444' },
    { name: 'Fighter B', value: result.probability_win_b, color: '#3b82f6' },
  ];

  // SHAP contributions, triées par magnitude absolue décroissante
  const shapData = [...result.contributions]
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
    .map((c) => ({
      feature: c.feature,
      contribution: c.contribution,
      // Négatif = pousse vers win_A (vert), positif = pousse vers win_B (rouge)
      color: c.contribution < 0 ? '#22c55e' : '#ef4444',
    }));

  return (
    <div className="space-y-8">
      {/* Banner avec le winner */}
      <div>
        <p className="text-sm text-zinc-400">Predicted winner</p>
        <p className="text-3xl font-bold mt-1">
          {winnerLabel}{' '}
          <span className="text-red-500">({(winnerProb * 100).toFixed(1)}%)</span>
        </p>
      </div>

      {/* Bar chart des probabilités */}
      <div>
        <h3 className="text-sm uppercase tracking-wider text-zinc-500 mb-3">Win probabilities</h3>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={probData} layout="vertical" margin={{ left: 60 }}>
            <XAxis type="number" domain={[0, 1]} tick={{ fill: '#71717a' }} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#71717a' }} />
            <Bar dataKey="value" radius={4}>
              {probData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* SHAP feature contributions */}
      <div>
        <h3 className="text-sm uppercase tracking-wider text-zinc-500 mb-2">
          Feature contributions (SHAP)
        </h3>
        <p className="text-xs text-zinc-500 mb-3">
          Green pushes toward Fighter A. Red pushes toward Fighter B.
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={shapData} layout="vertical" margin={{ left: 80 }}>
            <XAxis type="number" tick={{ fill: '#71717a' }} />
            <YAxis type="category" dataKey="feature" tick={{ fill: '#71717a' }} width={75} />
            <ReferenceLine x={0} stroke="#52525b" />
            <Bar dataKey="contribution" radius={4}>
              {shapData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}