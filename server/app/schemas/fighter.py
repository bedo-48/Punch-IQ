"""
Pydantic schema for fighter search results.

Format renvoyé par GET /fighters?q=xxx, conçu pour pré-remplir
le formulaire Fighter du frontend.
"""

from pydantic import BaseModel


class FighterMatch(BaseModel):
    """Un résultat de recherche dans fighters.csv.

    Tous les champs (sauf name) sont optionnels parce que beaucoup de
    boxeurs dans le CSV ont des stats partielles ('Unknown').
    """
    name: str
    age: float | None = None
    height: float | None = None     # en cm, parsé depuis le format "X.X ft (Y m)"
    won: float | None = None
    lost: float | None = None
    drawn: float | None = None
    kos: float | None = None        # estimé = won × (ko_rate / 100)
    stance: str | None = None       # info bonus, pas utilisée par le modèle
    country: str | None = None      # info bonus, pour affichage UI