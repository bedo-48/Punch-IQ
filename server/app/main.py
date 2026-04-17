"""
PunchIQ API — FastAPI entrypoint.

Run locally from the `server/` directory:
    uvicorn app.main:app --reload

The app is intentionally minimal at Layer 1. Routes will be registered
from `app.api` as they are built in later layers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

app = FastAPI(
    title="PunchIQ API",
    description="Boxing analytics and fight prediction.",
    version="0.1.0",
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


# Routers will be included here as they are implemented:
# from app.api import fighters, predict
# app.include_router(fighters.router)
# app.include_router(predict.router)
