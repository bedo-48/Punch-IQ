"""
HTTP route for fighter search (autocomplete frontend).

GET /fighters?q=tyson&limit=10 — case-insensitive substring search.
"""

import pandas as pd
from fastapi import APIRouter, Depends, Query, Request

from app.schemas.fighter import FighterMatch
from app.services.fighters_service import search


router = APIRouter()


def get_fighters_df(request: Request) -> pd.DataFrame:
    """Dépendance : récupère le DataFrame fighters chargé au démarrage."""
    return request.app.state.fighters_df


@router.get("/fighters", response_model=list[FighterMatch], tags=["fighters"])
def search_fighters(
    q: str = Query(..., min_length=2, description="Search query (min 2 chars)"),
    limit: int = Query(10, ge=1, le=50, description="Max results to return"),
    df: pd.DataFrame = Depends(get_fighters_df),
) -> list[FighterMatch]:
    """Cherche un boxeur par nom (substring, case-insensitive)."""
    return search(df, q, limit=limit)