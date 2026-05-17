/**
 * Wrapper autour de fetch() pour les appels à l'API PunchIQ.
 * Hardcoded sur localhost:8000 — à externaliser via .env quand on déploie.
 */

import type { FighterMatch, Fighter, PredictionResponse } from './types';

const API_BASE = 'http://localhost:8000';


export async function searchFighters(
  query: string,
  limit = 10,
): Promise<FighterMatch[]> {
  if (query.length < 2) return [];
  const url = `${API_BASE}/fighters?q=${encodeURIComponent(query)}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Search failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}


export async function predictFight(
  fighterA: Fighter,
  fighterB: Fighter,
): Promise<PredictionResponse> {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fighter_a: fighterA, fighter_b: fighterB }),
  });
  if (!res.ok) {
    throw new Error(`Predict failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}