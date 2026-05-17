import { useEffect, useState } from 'react';

import type { Fighter, PredictionResponse } from '../types';
import { prettyFeatureName } from '../utils/shap';
import Flag from './Flag';


interface PredictionEmptyProps {
  a: Fighter | null;
  b: Fighter | null;
}

export function PredictionEmpty({ a, b }: PredictionEmptyProps) {
  let msg = 'AWAITING BOTH FIGHTERS';
  if (a && !b) msg = 'SELECT FIGHTER B';
  else if (!a && b) msg = 'SELECT FIGHTER A';

  return (
    <div className="prediction-empty">
      <div className="pe-text">
        {msg}
        <span className="blink">_</span>
      </div>
      <div className="pe-sub">No prediction generated yet.</div>
    </div>
  );
}


function ShapInfo() {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="shap-info"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((o) => !o)}
    >
      <span className="shap-info-btn" aria-label="What is SHAP?">?</span>
      {open && (
        <span className="shap-info-pop" role="tooltip">
          <span className="pop-eyebrow">
            <span className="pop-mark"></span>
            Method · SHapley Additive exPlanations
          </span>
          <span className="pop-body">
            SHAP attributes each feature's contribution to a <em>single</em> prediction.
            <br /><br />
            <span className="pop-key" style={{ color: 'var(--green)' }}>Green bars</span>
            {' '}push the model toward Fighter&nbsp;A winning.{' '}
            <span className="pop-key" style={{ color: 'var(--accent-2)' }}>Red bars</span>
            {' '}push toward Fighter&nbsp;B. Bar length = magnitude of impact (|φ|).
            <br /><br />
            Sum of all φ + base rate = the predicted log-odds.
          </span>
          <span className="pop-foot">
            <span>Lundberg &amp; Lee · NeurIPS 2017</span>
            <span>·</span>
            <span>shap_v0.51</span>
          </span>
        </span>
      )}
    </span>
  );
}


interface PredictionProps {
  a: Fighter;
  b: Fighter;
  result: PredictionResponse;
}

export function Prediction({ a, b, result }: PredictionProps) {
  const winnerSide: 'A' | 'B' = result.predicted_class === 'win_A' ? 'A' : 'B';
  const winner = winnerSide === 'A' ? a : b;
  const loser = winnerSide === 'A' ? b : a;
  const probA = result.probability_win_a;
  const probB = result.probability_win_b;
  const winP = winnerSide === 'A' ? probA : probB;
  const loseP = 1 - winP;

  const pctA = Math.round(probA * 1000) / 10;
  const pctB = Math.round(probB * 1000) / 10;

  const sortedContribs = [...result.contributions].sort(
    (x, y) => Math.abs(y.contribution) - Math.abs(x.contribution),
  );
  const shap = sortedContribs.map((c) => ({
    name: prettyFeatureName(c.feature),
    value: -c.contribution,
  }));
  const maxAbs = Math.max(...shap.map((s) => Math.abs(s.value)), 0.0001);

  const [animPct, setAnimPct] = useState(0);
  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const target = winP * 100;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 900);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimPct(target * eased);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [winP, winner.name]);

  const animPctInt = Math.floor(animPct);
  const animPctFrac = Math.floor((animPct - animPctInt) * 10);

  const winnerName = winner.name ?? '—';
  const winnerWords = winnerName.toUpperCase().split(' ');

  return (
    <div className="prediction">
      <div className="winner-block">
        <div className="winner-meta">
          <div className="winner-eyebrow">
            <span className="pip"></span>
            <span>Predicted Winner · {winnerSide === 'A' ? 'Fighter A' : 'Fighter B'}</span>
          </div>
          <div className="winner-name">
            {winnerWords.map((w, i, arr) => (
              <span key={i}>
                {i === arr.length - 1 ? <span className="accent">{w}</span> : w}
                {i < arr.length - 1 ? ' ' : ''}
              </span>
            ))}
          </div>
          <div className="winner-sub">
            <Flag country={winner.country} size={18} />
            {winner.country && <span>{winner.country}</span>}
            <span className="vs">vs</span>
            <span>
              {loser.name ?? '—'} ·{' '}
              <span className="loser-prob">{(loseP * 100).toFixed(1)}%</span>
            </span>
          </div>
        </div>
        <div className="winner-prob">
          <div>
            <span className="num tnum">
              {animPctInt}
              <span style={{ fontSize: '0.5em', opacity: 0.85 }}>.{animPctFrac}</span>
            </span>
            <span className="pct">%</span>
          </div>
          <span className="label">Probability</span>
        </div>
      </div>

      <div className="prob-bar-block">
        <div className="prob-bar-head">
          <div className="l">
            <span className="badge">A</span>
            <span className={`name ${winnerSide === 'A' ? 'winner' : ''}`}>{a.name ?? 'A'}</span>
            <span className={`pct ${winnerSide === 'A' ? 'winner' : ''}`}>{pctA.toFixed(1)}%</span>
          </div>
          <div className="r">
            <span className="badge">B</span>
            <span className={`name ${winnerSide === 'B' ? 'winner' : ''}`}>{b.name ?? 'B'}</span>
            <span className={`pct ${winnerSide === 'B' ? 'winner' : ''}`}>{pctB.toFixed(1)}%</span>
          </div>
        </div>
        <div className="prob-bar">
          <div className="seg-a" style={{ width: `${pctA}%` }}></div>
          <div className="seg-b"></div>
        </div>
        <div className="prob-bar-ticks">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="shap-block">
        <div className="section-head" style={{ marginTop: 8, marginBottom: 0 }}>
          <div className="section-title">
            <span className="idx">003 /</span>
            <span className="mark"></span>
            <span className="label">Feature Contributions · SHAP</span>
            <ShapInfo />
          </div>
          <span className="section-aside">Ordered by |φ|</span>
        </div>
        <div className="shap-legend">
          <span className="l">← Favors {b.name ?? 'B'} <span className="arrow">·</span></span>
          <span style={{ color: 'var(--text-5)' }}>FEATURE IMPACT (φ)</span>
          <span className="r"><span className="arrow">·</span> Favors {a.name ?? 'A'} →</span>
        </div>
        <div className="shap-chart">
          {shap.map((s, i) => {
            const pct = (Math.abs(s.value) / maxAbs) * 50;
            const positive = s.value >= 0;
            return (
              <div className="shap-row" key={s.name + i}>
                <div className="shap-label">
                  <span className="feat-num tnum">{String(i + 1).padStart(2, '0')}</span>
                  <span>{s.name}</span>
                </div>
                <div className="shap-bar-cell">
                  <div
                    className={`shap-bar ${positive ? 'pos' : 'neg'}`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
                <div className="shap-value">
                  <span className={positive ? 'pos' : 'neg'}>
                    {positive ? '+' : '−'}
                    {Math.abs(s.value).toFixed(3)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


interface PredictionPanelProps {
  result: PredictionResponse | null;
  loading: boolean;
  error: string | null;
  a: Fighter | null;
  b: Fighter | null;
}

export default function PredictionPanel({ result, loading, error, a, b }: PredictionPanelProps) {
  if (loading) {
    return (
      <div className="prediction-empty">
        <div className="pe-text">
          RUNNING RANDOM FOREST<span className="blink">_</span>
        </div>
        <div className="pe-sub">Computing SHAP attributions…</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="prediction-empty">
        <div className="pe-text" style={{ color: 'var(--accent-2)' }}>ERROR</div>
        <div className="pe-sub">{error}</div>
      </div>
    );
  }
  if (!result || !a || !b) {
    return <PredictionEmpty a={a} b={b} />;
  }
  return <Prediction a={a} b={b} result={result} />;
}
