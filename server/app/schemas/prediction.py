"""
Pydantic schemas for the /predict endpoint.

Ces classes définissent le contrat JSON entre le client et l'API.
FastAPI les utilise automatiquement pour :
- valider les requêtes entrantes (rejette le JSON malformé en 422)
- sérialiser les réponses en JSON
- générer la doc Swagger interactive sur /docs
"""

from pydantic import BaseModel


class Fighter(BaseModel):
    """Stats d'un boxeur au moment du combat.

    Tous les champs numériques sont optionnels. Si le client omet une valeur,
    le service de prédiction imputera avec la médiane du training set.
    Noms alignés sur les colonnes du raw CSV (won/lost/drawn, PAS wins/losses/draws).
    """
    name: str | None = None       # pour affichage UI uniquement, non utilisé par le modèle
    age: float | None = None
    height: float | None = None
    weight: float | None = None
    won: float | None = None
    lost: float | None = None
    drawn: float | None = None
    kos: float | None = None


class PredictionRequest(BaseModel):
    """Corps de la requête POST /predict."""
    fighter_a: Fighter
    fighter_b: Fighter


class FeatureContribution(BaseModel):
    """Une ligne de l'explication SHAP pour une prédiction donnée."""
    feature: str           # ex: "age_diff"
    value: float           # valeur de la feature pour ce combat (après imputation/diff)
    contribution: float    # contribution SHAP signée (négatif = pousse vers win_A, positif = vers win_B)


class PredictionResponse(BaseModel):
    """Corps de la réponse de POST /predict."""
    predicted_class: str                          # "win_A" ou "win_B"
    probability_win_a: float
    probability_win_b: float
    contributions: list[FeatureContribution]
