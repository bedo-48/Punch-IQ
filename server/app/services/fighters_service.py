"""
Fighters service — chargement et recherche dans fighters.csv.

Le CSV brut est messy (colonnes mal nommées, valeurs 'Unknown', formats
texte mixed pour height/ko_rate). Ce service normalise tout au démarrage
et expose une fonction de recherche utilisée par l'autocomplete frontend.
"""

from pathlib import Path
import re

import pandas as pd

from app.schemas.fighter import FighterMatch


def _parse_height_cm(value) -> float | None:
    """Parse '5.74 ft (1.75 m)' → 175.0. None pour 'Unknown' ou NaN."""
    if pd.isna(value) or value == "Unknown":
        return None
    match = re.search(r"\(([\d.]+)\s*m\)", str(value))
    if match:
        return float(match.group(1)) * 100
    return None


def _parse_age(value) -> float | None:
    """Parse age. 'Unknown' → None."""
    if pd.isna(value) or value == "Unknown":
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None


def _parse_ko_count(won: float, ko_rate_str) -> float | None:
    """Estime le nombre de KO : won × (ko_rate%) / 100."""
    if pd.isna(ko_rate_str) or won is None or pd.isna(won) or won == 0:
        return 0.0
    rate_match = re.match(r"([\d.]+)%", str(ko_rate_str))
    if rate_match:
        return won * float(rate_match.group(1)) / 100
    return None


def load_fighters(csv_path: Path) -> pd.DataFrame:
    """Charge fighters.csv, renomme/normalise les colonnes, filtre le bruit.

    Returns:
        DataFrame avec colonnes : name, age, height (cm), won, lost, drawn,
        kos (estimé), stance, country. Toutes les valeurs sont prêtes à
        être servies en JSON via FighterMatch.
    """
    df = pd.read_csv(csv_path)

    # Renommer pour matcher la convention du modèle (won/lost/drawn)
    df = df.rename(columns={
        "wins": "won",
        "looses": "lost",
        "draws": "drawn",
    })

    # Parsing colonnes texte → numériques
    df["age"] = df["age"].apply(_parse_age)
    df["height"] = df["height"].apply(_parse_height_cm)
    df["kos"] = df.apply(lambda row: _parse_ko_count(row["won"], row["ko_rate"]), axis=1)

    # Filtre : on garde uniquement les boxeurs avec au moins un combat (won + lost + drawn > 0)
    has_record = (df["won"] > 0) | (df["lost"] > 0) | (df["drawn"] > 0)
    df = df[has_record].reset_index(drop=True)

    return df


def search(df: pd.DataFrame, query: str, limit: int = 10) -> list[FighterMatch]:
    """Recherche substring case-insensitive sur le nom.

    Trie par nombre de victoires desc — les boxeurs les plus expérimentés
    apparaissent en premier dans l'autocomplete.
    """
    if not query or len(query.strip()) < 2:
        return []

    mask = df["name"].str.contains(query, case=False, na=False)
    matches = df[mask].sort_values("won", ascending=False).head(limit)

    return [
        FighterMatch(
            name=row["name"],
            age=row["age"] if pd.notna(row["age"]) else None,
            height=row["height"] if pd.notna(row["height"]) else None,
            won=float(row["won"]) if pd.notna(row["won"]) else None,
            lost=float(row["lost"]) if pd.notna(row["lost"]) else None,
            drawn=float(row["drawn"]) if pd.notna(row["drawn"]) else None,
            kos=row["kos"] if pd.notna(row["kos"]) else None,
            stance=row["stance"] if pd.notna(row["stance"]) and row["stance"] != "Unknown" else None,
            country=row["country"] if pd.notna(row["country"]) and row["country"] != "Unknown" else None,
        )
        for _, row in matches.iterrows()
    ]