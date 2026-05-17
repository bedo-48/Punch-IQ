import { useEffect, useState } from 'react';

import { searchFighters } from '../api';
import type { FighterMatch } from '../types';


interface FighterSearchProps {
  label: string;
  onSelect: (fighter: FighterMatch) => void;
}


export default function FighterSearch({ label, onSelect }: FighterSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FighterMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounced search : attend 300ms d'inactivité avant de fire la requête
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);

    const timeoutId = setTimeout(async () => {
      try {
        const matches = await searchFighters(query);
        setResults(matches);
        setShowResults(true);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    // Cleanup : si query change avant 300ms, on annule le timeout en cours
    return () => clearTimeout(timeoutId);
  }, [query]);

  function handleSelect(fighter: FighterMatch) {
    setQuery(fighter.name);
    setShowResults(false);
    onSelect(fighter);
  }

  return (
    <div className="relative">
      <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setShowResults(true)}
        placeholder="Type a name (ex: tyson, alvarez)..."
        className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
      />

      {/* Dropdown des résultats */}
      {showResults && results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-md max-h-60 overflow-y-auto shadow-lg">
          {results.map((f) => (
            <li
              key={f.name}
              onClick={() => handleSelect(f)}
              className="px-3 py-2 cursor-pointer hover:bg-zinc-700 text-sm border-b border-zinc-800 last:border-0"
            >
              <div className="font-medium text-zinc-100">{f.name}</div>
              <div className="text-xs text-zinc-500">
                {f.won ?? '?'}-{f.lost ?? '?'}-{f.drawn ?? '?'}
                {f.country && <span> · {f.country}</span>}
                {f.stance && <span> · {f.stance}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}

      {loading && (
        <div className="absolute right-3 top-8 text-xs text-zinc-500">
          Searching...
        </div>
      )}
    </div>
  );
}