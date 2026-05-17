/**
 * Derive a boxing weight class (division) from a fighter's weight in kg.
 *
 * Approximate ranges from professional men's boxing weight classes
 * (rounded). Returns "—" if weight is unknown.
 */

export function weightToDivision(weightKg: number | null | undefined): string {
  if (weightKg === null || weightKg === undefined || isNaN(weightKg)) return "—";

  const w = weightKg;
  if (w <= 48) return "Light Flyweight";
  if (w <= 51) return "Flyweight";
  if (w <= 54) return "Bantamweight";
  if (w <= 57) return "Featherweight";
  if (w <= 61) return "Lightweight";
  if (w <= 64) return "Light Welterweight";
  if (w <= 67) return "Welterweight";
  if (w <= 70) return "Light Middleweight";
  if (w <= 73) return "Middleweight";
  if (w <= 76) return "Super Middleweight";
  if (w <= 79) return "Light Heavyweight";
  if (w <= 91) return "Cruiserweight";
  return "Heavyweight";
}
