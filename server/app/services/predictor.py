"""
Predictor service — orchestre la chaîne complète d'une prédiction :
Fighter (raw) → imputation → diff features → scaling → prediction RF + SHAP → PredictionResponse.

C'est l'équivalent en production du pipeline du notebook 03_modeling.ipynb.
"""

import numpy as np

from app.schemas.prediction import (
    Fighter,
    FeatureContribution,
    PredictionResponse,
)
from app.services.model_loader import Artifacts


# Ordre EXACT des features comme à l'entraînement (cf. 03_modeling.ipynb).
# Critique : si tu changes cet ordre, les poids du scaler et du modèle ne
# correspondent plus aux bonnes colonnes → garbage in, garbage out.
FEATURE_COLS = [
    "age_diff",
    "height_diff",
    "weight_diff",
    "won_diff",
    "lost_diff",
    "drawn_diff",
    "kos_diff",
]

# Stats brutes utilisées pour calculer les diffs (une par boxeur).
RAW_FIELDS = ["age", "height", "weight", "won", "lost", "drawn", "kos"]


def _impute(value: float | None, key: str, medians: dict[str, float]) -> float:
    """Renvoie value si fournie, sinon la médiane training-time pour cette colonne."""
    if value is not None:
        return float(value)
    return medians[key]


def predict(
    fighter_a: Fighter,
    fighter_b: Fighter,
    artifacts: Artifacts,
) -> PredictionResponse:
    """Pipeline complet d'une prédiction."""
    medians = artifacts.medians
    print(f"DEBUG fighter_a: {fighter_a.model_dump()}")
    print(f"DEBUG fighter_b: {fighter_b.model_dump()}")

    # === Étapes 1+2 : imputation + calcul des diff features ===
    diffs: dict[str, float] = {}
    for field in RAW_FIELDS:
        val_a = _impute(getattr(fighter_a, field), f"{field}_A", medians)
        val_b = _impute(getattr(fighter_b, field), f"{field}_B", medians)
        diffs[f"{field}_diff"] = val_a - val_b

    print(f"DEBUG diffs: {diffs}")

    # === Étape 3 : construire le numpy array dans l'ordre exact, puis scaler ===
    X = np.array([[diffs[col] for col in FEATURE_COLS]])  # shape (1, 7)
    X_scaled = artifacts.scaler.transform(X)              # shape (1, 7)

    # === Étape 4 : prédiction (classe + probabilités) ===
    predicted_label = int(artifacts.model.predict(X_scaled)[0])
    probabilities = artifacts.model.predict_proba(X_scaled)[0]  # array (2,)
    predicted_class = "win_B" if predicted_label == 1 else "win_A"

    # === Étape 5 : SHAP — shape (1, 7, 2), on prend la classe win_B (positive) ===
    shap_values = artifacts.explainer.shap_values(X_scaled)
    sv_for_win_b = shap_values[0, :, 1]  # 7 contributions signées

    # === Étape 6 : assemblage de la réponse ===
    contributions = [
        FeatureContribution(
            feature=col,
            value=float(diffs[col]),              # diff brute (non scalée — plus lisible pour user)
            contribution=float(sv_for_win_b[i]),
        )
        for i, col in enumerate(FEATURE_COLS)
    ]

    return PredictionResponse(
        predicted_class=predicted_class,
        probability_win_a=float(probabilities[0]),
        probability_win_b=float(probabilities[1]),
        contributions=contributions,
    )
