"""
HTTP route for predictions.

POST /predict — accepte deux boxeurs en JSON, renvoie la prédiction + l'explication SHAP.
"""

from fastapi import APIRouter, Depends, Request

from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.services.model_loader import Artifacts
from app.services.predictor import predict as predict_service


router = APIRouter()


def get_artifacts(request: Request) -> Artifacts:
    """Dépendance FastAPI : récupère les artefacts chargés au démarrage de l'app.
    
    Stockés dans app.state par le lifespan event (cf. main.py).
    Cette indirection rend le tout testable : on peut remplacer get_artifacts
    par un mock dans les tests sans toucher la route.
    """
    return request.app.state.artifacts


@router.post("/predict", response_model=PredictionResponse, tags=["prediction"])
def predict_endpoint(
    body: PredictionRequest,
    artifacts: Artifacts = Depends(get_artifacts),
) -> PredictionResponse:
    """Prédit l'issue d'un combat entre deux boxeurs.

    Tout champ absent dans la requête est imputé avec la médiane du training set.
    Retourne la classe prédite, les probabilités win_A/win_B, et les contributions
    SHAP par feature pour expliquer la décision.
    """
    return predict_service(body.fighter_a, body.fighter_b, artifacts)