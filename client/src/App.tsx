import { useState } from 'react';

import FighterCard from './components/FighterCard';
import PredictionPanel from './components/PredictionPanel';
import SplashScreen from './components/SplashScreen';
import { predictFight } from './api';
import type { Fighter, PredictionResponse } from './types';


const EMPTY_FIGHTER: Fighter = {
  name: null,
  age: null,
  height: null,
  weight: null,
  won: null,
  lost: null,
  drawn: null,
  kos: null,
};


function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [fighterA, setFighterA] = useState<Fighter>(EMPTY_FIGHTER);
  const [fighterB, setFighterB] = useState<Fighter>(EMPTY_FIGHTER);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePredict() {
    setLoading(true);
    setError(null);
    try {
      const response = await predictFight(fighterA, fighterB);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  const canPredict = fighterA.name !== null && fighterB.name !== null;

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
        <header className="border-b border-zinc-800 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-red-500">Punch</span>IQ
            </span>
            <span className="text-xs text-zinc-500 tracking-wider uppercase">
              Boxing prediction & analysis
            </span>
          </div>
        </header>

        <main className="flex-1 px-6 py-8">
          <div className="max-w-5xl mx-auto space-y-8">

            <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-lg font-semibold mb-1">Fight Setup</h2>
              <p className="text-sm text-zinc-400 mb-6">
                Search for two fighters by name. Stats pre-fill from the database — adjust if needed.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FighterCard label="Fighter A" fighter={fighterA} onChange={setFighterA} />
                <FighterCard label="Fighter B" fighter={fighterB} onChange={setFighterB} />
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handlePredict}
                  disabled={!canPredict || loading}
                  className="px-6 py-2 bg-red-600 hover:bg-red-500 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-md text-sm font-semibold tracking-wider uppercase transition-colors"
                >
                  {loading ? 'Predicting...' : 'Predict'}
                </button>
              </div>
            </section>

            <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-lg font-semibold mb-1">Prediction</h2>
              <p className="text-sm text-zinc-400 mb-6">
                Probabilities and per-feature SHAP contributions.
              </p>
              <PredictionPanel result={result} loading={loading} error={error} />
            </section>

          </div>
        </main>

        <footer className="border-t border-zinc-800 px-6 py-4">
          <div className="max-w-5xl mx-auto text-xs text-zinc-500">
            Random Forest · 80.9% accuracy · SHAP explainability
          </div>
        </footer>
      </div>
    </>
  );
}

export default App;