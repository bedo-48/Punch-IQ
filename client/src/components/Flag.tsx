import { flagUrl } from '../utils/country';


interface FlagProps {
  country: string | null | undefined;
  size?: number;
}


/**
 * Inline SVG country flag from flagcdn.com.
 * Returns null if the country can't be mapped (no flag shown).
 */
export default function Flag({ country, size = 16 }: FlagProps) {
  const url = flagUrl(country);
  if (!url) return null;

  return (
    <span
      className="flag-svg"
      title={country ?? undefined}
      style={{
        width: size,
        height: Math.round(size * 0.72),
        backgroundImage: `url(${url})`,
      }}
    />
  );
}
