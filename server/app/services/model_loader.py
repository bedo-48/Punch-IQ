"""
Model loader — chargé une seule fois au démarrage de l'app via le lifespan event.

Évite de relire le disque à chaque requête (RF compressé ~50MB, ~1-2s à charger,
plus l'init de SHAP TreeExplainer).
"""

from dataclasses import dataclass
from pathlib import Path
import json

import joblib
import shap
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler


@dataclass
class Artifacts:
    """Conteneur des objets ML chargés en mémoire au démarrage."""
    model: RandomForestClassifier
    scaler: StandardScaler
    medians: dict[str, float]
    explainer: shap.TreeExplainer


def load_artifacts(models_dir: Path) -> Artifacts:
    """Charge le modèle, le scaler, les médianes, et instancie le SHAP explainer.

    Args:
        models_dir: dossier qui contient les artefacts (typiquement server/models/).

    Returns:
        Artifacts avec tous les objets prêts à servir des requêtes.
    """
    model = joblib.load(models_dir / "boxing_predictor.pkl")
    scaler = joblib.load(models_dir / "boxing_scaler.pkl")

    with open(models_dir / "boxing_medians.json", "r") as f:
        medians = json.load(f)

    # TreeExplainer pré-calcule les structures internes pour des SHAP rapides
    explainer = shap.TreeExplainer(model)

    return Artifacts(
        model=model,
        scaler=scaler,
        medians=medians,
        explainer=explainer,
    )