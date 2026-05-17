/**
 * Country name → ISO-2 mapping for flagcdn.com.
 *
 * The fighters.csv has full country names (some with subtypes like
 * "Venezuela, Bolivarian Republic of"). Map them to 2-letter ISO codes
 * for the flag CDN lookup.
 */

const COUNTRY_TO_ISO2: Record<string, string> = {
  // Americas
  "United States": "us",
  "Canada": "ca",
  "Mexico": "mx",
  "Argentina": "ar",
  "Brazil": "br",
  "Colombia": "co",
  "Venezuela": "ve",
  "Venezuela, Bolivarian Republic of": "ve",
  "Chile": "cl",
  "Peru": "pe",
  "Ecuador": "ec",
  "Uruguay": "uy",
  "Paraguay": "py",
  "Bolivia": "bo",
  "Bolivia, Plurinational State of": "bo",
  "Cuba": "cu",
  "Dominican Republic": "do",
  "Puerto Rico": "pr",
  "Nicaragua": "ni",
  "Panama": "pa",
  "Costa Rica": "cr",
  "Honduras": "hn",
  "Guatemala": "gt",
  "El Salvador": "sv",
  "Haiti": "ht",
  "Jamaica": "jm",
  "Trinidad and Tobago": "tt",
  "Bahamas": "bs",

  // Europe
  "United Kingdom": "gb",
  "Ireland": "ie",
  "France": "fr",
  "Germany": "de",
  "Spain": "es",
  "Italy": "it",
  "Portugal": "pt",
  "Netherlands": "nl",
  "Belgium": "be",
  "Switzerland": "ch",
  "Austria": "at",
  "Denmark": "dk",
  "Sweden": "se",
  "Norway": "no",
  "Finland": "fi",
  "Iceland": "is",
  "Poland": "pl",
  "Czech Republic": "cz",
  "Slovakia": "sk",
  "Hungary": "hu",
  "Romania": "ro",
  "Bulgaria": "bg",
  "Greece": "gr",
  "Russia": "ru",
  "Russian Federation": "ru",
  "Ukraine": "ua",
  "Belarus": "by",
  "Croatia": "hr",
  "Serbia": "rs",
  "Slovenia": "si",
  "Bosnia and Herzegovina": "ba",
  "Albania": "al",
  "North Macedonia": "mk",
  "Moldova": "md",
  "Lithuania": "lt",
  "Latvia": "lv",
  "Estonia": "ee",
  "Georgia": "ge",
  "Armenia": "am",
  "Azerbaijan": "az",

  // Asia
  "Japan": "jp",
  "China": "cn",
  "South Korea": "kr",
  "Korea, Republic of": "kr",
  "North Korea": "kp",
  "Thailand": "th",
  "Vietnam": "vn",
  "Philippines": "ph",
  "Indonesia": "id",
  "Malaysia": "my",
  "Singapore": "sg",
  "India": "in",
  "Pakistan": "pk",
  "Bangladesh": "bd",
  "Sri Lanka": "lk",
  "Nepal": "np",
  "Kazakhstan": "kz",
  "Uzbekistan": "uz",
  "Kyrgyzstan": "kg",
  "Tajikistan": "tj",
  "Turkmenistan": "tm",
  "Mongolia": "mn",
  "Iran": "ir",
  "Iran, Islamic Republic of": "ir",
  "Iraq": "iq",
  "Israel": "il",
  "Turkey": "tr",
  "Saudi Arabia": "sa",
  "United Arab Emirates": "ae",
  "Qatar": "qa",
  "Lebanon": "lb",
  "Syria": "sy",
  "Jordan": "jo",
  "Afghanistan": "af",

  // Africa
  "South Africa": "za",
  "Nigeria": "ng",
  "Ghana": "gh",
  "Kenya": "ke",
  "Ethiopia": "et",
  "Egypt": "eg",
  "Morocco": "ma",
  "Algeria": "dz",
  "Tunisia": "tn",
  "Libya": "ly",
  "Senegal": "sn",
  "Cameroon": "cm",
  "Tanzania": "tz",
  "Uganda": "ug",
  "Zambia": "zm",
  "Zimbabwe": "zw",
  "Côte d'Ivoire": "ci",
  "Cote d'Ivoire": "ci",
  "Congo": "cg",
  "Democratic Republic of the Congo": "cd",
  "Angola": "ao",
  "Mozambique": "mz",

  // Oceania
  "Australia": "au",
  "New Zealand": "nz",
  "Fiji": "fj",
  "Papua New Guinea": "pg",
};


export function countryToIso2(country: string | null | undefined): string | null {
  if (!country) return null;
  const direct = COUNTRY_TO_ISO2[country];
  if (direct) return direct;
  // Fallback : essaye case-insensitive
  const lower = country.toLowerCase();
  for (const [k, v] of Object.entries(COUNTRY_TO_ISO2)) {
    if (k.toLowerCase() === lower) return v;
  }
  return null;
}


export function flagUrl(country: string | null | undefined): string | null {
  const iso = countryToIso2(country);
  return iso ? `https://flagcdn.com/${iso}.svg` : null;
}


/**
 * Derive a short country code for display (e.g. "USA", "MEX") when there's
 * no SVG flag available, or to display alongside the name.
 */
export function countryCode(country: string | null | undefined): string {
  if (!country) return "";
  const iso = countryToIso2(country);
  if (iso) return iso.toUpperCase();
  // Fallback: first 3 letters uppercase
  return country.slice(0, 3).toUpperCase();
}
