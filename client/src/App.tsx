import { useEffect, useState } from 'react';

import FighterCard from './components/FighterCard';
import PredictionPanel from './components/PredictionPanel';
import SplashScreen from './components/SplashScreen';
import { predictFight } from './api';
import type { Fighter, PredictionResponse } from './types';


const SIDE_A_COLOR = 'var(--accent-2)';
const SIDE_B_COLOR = 'var(--blue)';


function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [fighterA, setFighterA] = useState<Fighter | null>(null);
  const [fighterB, setFighterB] = useState<Fighter | null>(null);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canPredict = !!(fighterA && fighterB && fighterA.name && fighterB.name);

  async function runPredict() {
    if (!canPredict || !fighterA || !fighterB) return;
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

  function swap() {
    const tmp = fighterA;
    setFighterA(fighterB);
    setFighterB(tmp);
  }

  useEffect(() => {
    setResult(null);
  }, [fighterA, fighterB]);

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      <div className="app">
        <header className="header">
          <div className="header-brand">
            <div className="brand-mark">
              <span className="punch">Punch</span>
              <span className="iq">IQ</span>
            </div>
            <div className="brand-tag">Boxing prediction &amp; analysis</div>
          </div>
          <div className="header-meta">
            <div className="model-badge">
              <span className="pip"></span>
              MODEL v0.1 · ONLINE
            </div>
            <div className="eyebrow">Random Forest · 80.9% accuracy · SHAP</div>
          </div>
        </header>

        <section className="section">
          <div className="section-head">
            <div className="section-title">
              <span className="idx">001 /</span>
              <span className="mark"></span>
              <span className="label">Fight Setup</span>
            </div>
            <span className="section-aside">Select two fighters · stats editable inline</span>
          </div>

          <div className="fight-setup">
            <FighterCard
              side="A"
              sideColor={SIDE_A_COLOR}
              fighter={fighterA}
              onChange={setFighterA}
            />
            <div className="vs-divider">
              <span className="vs-mark">vs.</span>
              <button
                className="vs-swap"
                onClick={swap}
                title="Swap fighters"
                aria-label="Swap fighters"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="17 1 21 5 17 9"></polyline>
                  <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                  <polyline points="7 23 3 19 7 15"></polyline>
                  <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                </svg>
              </button>
            </div>
            <FighterCard
              side="B"
              sideColor={SIDE_B_COLOR}
              fighter={fighterB}
              onChange={setFighterB}
            />
          </div>

          <button
            className="predict-btn"
            disabled={!canPredict || loading}
            onClick={runPredict}
          >
            {loading ? (
              <>
                <span className="pulse"></span>
                <span>Running Random Forest…</span>
              </>
            ) : (
              <>
                <span>Predict Fight</span>
                <span className="arrow">→</span>
              </>
            )}
          </button>
        </section>

        <section className="section">
          <div className="section-head">
            <div className="section-title">
              <span className="idx">002 /</span>
              <span className="mark"></span>
              <span className="label">Prediction</span>
            </div>
            <span className="section-aside">
              {result
                ? `Model confidence · margin ${(Math.abs(result.probability_win_a - 0.5) * 200).toFixed(1)}%`
                : 'Output pending'}
            </span>
          </div>

          <PredictionPanel
            result={result}
            loading={loading}
            error={error}
            a={fighterA}
            b={fighterB}
          />
        </section>

        <footer className="footer">
          <div className="credit">
            <span className="key">Random Forest</span>
            <span className="sep">·</span>
            <span>80.9% accuracy</span>
            <span className="sep">·</span>
            <span>SHAP explainability</span>
          </div>
          <div className="credit">
            <span>BoxRec ingest 2026.05</span>
            <span className="sep">·</span>
            <span className="key">Portfolio v0.1</span>
          </div>
        </footer>
      </div>
    </>
  );
}

export default App;
