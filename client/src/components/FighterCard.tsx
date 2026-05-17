import { useEffect, useRef, useState } from 'react';

import { searchFighters } from '../api';
import type { Fighter, FighterMatch } from '../types';
import { weightToDivision } from '../utils/division';
import Flag from './Flag';


interface FighterCardProps {
  side: 'A' | 'B';
  sideColor: string;
  fighter: Fighter | null;
  onChange: (fighter: Fighter | null) => void;
}


export default function FighterCard({ side, sideColor, fighter, onChange }: FighterCardProps) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<FighterMatch[]>([]);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = search.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const matches = await searchFighters(q);
        setResults(matches);
        setActiveIdx(0);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timeoutId);
  }, [search]);

  function pickMatch(match: FighterMatch) {
    onChange({
      name: match.name,
      age: match.age,
      height: match.height,
      weight: null,
      won: match.won,
      lost: match.lost,
      drawn: match.drawn,
      kos: match.kos,
      country: match.country,
      stance: match.stance,
    });
    setSearch('');
    setOpenDropdown(false);
    setResults([]);
  }

  function clearAndFocus() {
    onChange(null);
    setSearch('');
    setOpenDropdown(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter' && results[activeIdx]) {
      e.preventDefault();
      pickMatch(results[activeIdx]);
    } else if (e.key === 'Escape') {
      setOpenDropdown(false);
    }
  }

  function setField<K extends keyof Fighter>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!fighter) return;
      const raw = e.target.value;
      if (raw === '') {
        onChange({ ...fighter, [key]: null });
        return;
      }
      const num = parseFloat(raw.replace(/[^\d.]/g, ''));
      if (!isNaN(num)) {
        onChange({ ...fighter, [key]: num as Fighter[K] });
      }
    };
  }

  const division = fighter ? weightToDivision(fighter.weight) : '';
  const koPct =
    fighter && fighter.won
      ? Math.round(((fighter.kos ?? 0) / fighter.won) * 100)
      : 0;

  return (
    <div
      className={`fighter-card side-${side}`}
      style={{ '--side-color': sideColor } as React.CSSProperties}
    >
      <div className="fc-head">
        <span className="fc-side-badge">
          <span className="dot"></span>
          Fighter&nbsp;{side}
        </span>
        {fighter ? (
          <button
            className="fc-division"
            onClick={clearAndFocus}
            style={{
              appearance: 'none',
              background: 'transparent',
              border: 0,
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            ↻ change
          </button>
        ) : (
          <span className="fc-division">
            {loading
              ? 'searching…'
              : search.length >= 2
              ? `${results.length} matches`
              : 'type to search'}
          </span>
        )}
      </div>

      {!fighter && (
        <div className="fc-search-wrap">
          <svg
            className="fc-search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7"></circle>
            <path d="M21 21l-4.3-4.3"></path>
          </svg>
          <input
            ref={inputRef}
            className="fc-search-input"
            placeholder="Search fighter by name…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpenDropdown(true);
            }}
            onFocus={() => setOpenDropdown(true)}
            onBlur={() => setTimeout(() => setOpenDropdown(false), 180)}
            onKeyDown={onKey}
          />
          {openDropdown && search.trim().length >= 2 && (
            <div className="fc-dropdown">
              {results.length === 0 && !loading && (
                <div className="fc-dropdown-empty">
                  No fighter matches "{search}".
                </div>
              )}
              {results.map((f, i) => (
                <button
                  key={f.name}
                  className="fc-dropdown-item"
                  style={
                    i === activeIdx
                      ? { background: 'var(--surface-3)', color: 'var(--text)' }
                      : undefined
                  }
                  onMouseEnter={() => setActiveIdx(i)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pickMatch(f);
                  }}
                >
                  <Flag country={f.country} size={18} />
                  <span className="name">{f.name}</span>
                  <span className="meta">
                    {f.country ?? '—'}
                    {f.stance ? ` · ${f.stance}` : ''}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {fighter && (
        <>
          <div className="fc-identity">
            <div className="fc-name">{fighter.name}</div>
            <div className="fc-sub">
              <span>{division}</span>
              <span className="dot"></span>
              <span>
                Record {fighter.won ?? '?'}–{fighter.lost ?? '?'}
                {fighter.drawn ? `–${fighter.drawn}` : ''}
              </span>
            </div>
          </div>

          <div className="stats-grid">
            <StatCell label="Age"     value={fighter.age}    unit="yr" onChange={setField('age')} />
            <StatCell label="Height"  value={fighter.height} unit="cm" onChange={setField('height')} />
            <StatCell label="Weight"  value={fighter.weight} unit="kg" onChange={setField('weight')} />
            <StatCell label="Wins"    value={fighter.won}    onChange={setField('won')} />
            <StatCell label="Losses"  value={fighter.lost}   onChange={setField('lost')} />
            <StatCell label="Draws"   value={fighter.drawn}  onChange={setField('drawn')} />
            <StatCell label="KO Wins" value={fighter.kos}    onChange={setField('kos')} accent />
            <StatCell label="KO %"    value={koPct}          unit="%" readOnly />
          </div>
        </>
      )}
    </div>
  );
}


interface StatCellProps {
  label: string;
  value: number | null;
  unit?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  accent?: boolean;
}

function StatCell({ label, value, unit, onChange, readOnly, accent }: StatCellProps) {
  return (
    <div className={`stat-cell ${accent ? 'accent' : ''}`}>
      <span className="label">{label}</span>
      <span className="value">
        {readOnly ? (
          <span className="ro tnum">{value !== null ? value : '—'}</span>
        ) : (
          <input
            className="tnum"
            type="text"
            inputMode="numeric"
            value={value !== null ? value : ''}
            onChange={onChange}
          />
        )}
        {unit && <span className="unit">{unit}</span>}
      </span>
    </div>
  );
}
