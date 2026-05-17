"""
PunchIQ API — FastAPI entrypoint.
"""

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.fighters import router as fighters_router        # NOUVEAU
from app.api.predict import router as predict_router
from app.core.config import settings
from app.services.fighters_service import load_fighters       # NOUVEAU
from app.services.model_loader import load_artifacts


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Charge tous les artefacts ML + le CSV fighters au démarrage."""
    # === Startup ===
    models_dir = settings.model_path.parent
    app.state.artifacts = load_artifacts(models_dir)
    print(f"[startup] Artifacts loaded from {models_dir.resolve()}")

    # NOUVEAU : load fighters.csv pour l'autocomplete
    fighters_csv = Path("data/raw/boxing/fighters.csv")
    app.state.fighters_df = load_fighters(fighters_csv)
    print(f"[startup] Fighters loaded: {len(app.state.fighters_df)} rows from {fighters_csv.resolve()}")

    yield

    # === Shutdown ===
    # Nothing to clean up.


app = FastAPI(
    title="PunchIQ API",
    description="Boxing analytics and fight prediction.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["meta"])
def health() -> dict[str, str]:
    """Liveness probe."""
    return {"status": "ok", "version": app.version}


# Routes
app.include_router(predict_router)
app.include_router(fighters_router)        # NOUVEAU