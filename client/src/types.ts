/**
 * Types matching the FastAPI backend schemas.
 * Keep in sync with server/app/schemas/*.py.
 */

export interface FighterMatch {
  name: string;
  age: number | null;
  height: number | null;
  won: number | null;
  lost: number | null;
  drawn: number | null;
  kos: number | null;
  stance: string | null;
  country: string | null;
}


export interface Fighter {
  name: string | null;
  age: number | null;
  height: number | null;
  weight: number | null;
  won: number | null;
  lost: number | null;
  drawn: number | null;
  kos: number | null;
  // UI-only fields (ignored by the backend Pydantic Fighter schema).
  country?: string | null;
  stance?: string | null;
}


export interface FeatureContribution {
  feature: string;
  value: number;
  contribution: number;
}


export interface PredictionResponse {
  predicted_class: string;
  probability_win_a: number;
  probability_win_b: number;
  contributions: FeatureContribution[];
}
