/**
 * Maps backend SHAP feature names ("age_diff", "won_diff", etc.)
 * to user-friendly display labels.
 */

const FEATURE_LABELS: Record<string, string> = {
  age_diff: "Age Differential",
  height_diff: "Height Differential",
  weight_diff: "Weight Differential",
  won_diff: "Wins Differential",
  lost_diff: "Losses Differential",
  drawn_diff: "Draws Differential",
  kos_diff: "KO Count Differential",
};


export function prettyFeatureName(rawName: string): string {
  return FEATURE_LABELS[rawName] ?? rawName;
}
