"""
Feature engineering for PunchIQ.

Each feature function should be pure: it takes a DataFrame with the
raw/cleaned columns and returns the DataFrame with new columns added.
Keep features documented here so they can be explained in interviews
and in the UI's "why this prediction?" panel.

Convention for pairwise features: `_diff` means `fighter_a - fighter_b`.
Symmetry matters — at training time each fight should also be inserted
with A and B swapped (and the label flipped) to prevent the model from
learning a positional bias.
"""

from __future__ import annotations

import pandas as pd


def add_age_diff(df: pd.DataFrame) -> pd.DataFrame:
    """
    age_diff = fighter_a.age - fighter_b.age (in years, at fight date).

    Why it matters: prime years in boxing are typically 27–33. Large
    positive diffs (A much older than B) trend unfavorable.

    Limitations: age alone is a weak signal; pair with experience_diff
    and recent_form_diff for a more honest picture.
    """
    # TODO: implement once the cleaned columns are finalized.
    raise NotImplementedError


def add_reach_diff(df: pd.DataFrame) -> pd.DataFrame:
    """reach_diff = fighter_a.reach - fighter_b.reach (inches)."""
    raise NotImplementedError


def add_win_pct_diff(df: pd.DataFrame) -> pd.DataFrame:
    """win_pct_diff = fighter_a.win_pct - fighter_b.win_pct, computed
    from records *at the time of the fight* (no leakage)."""
    raise NotImplementedError


def add_ko_rate_diff(df: pd.DataFrame) -> pd.DataFrame:
    """ko_rate_diff = fighter_a.ko_rate - fighter_b.ko_rate."""
    raise NotImplementedError


def add_recent_form_diff(df: pd.DataFrame, n_last: int = 5) -> pd.DataFrame:
    """
    recent_form_diff: win rate over each fighter's last N fights before
    the fight date. Time-weighted is a nice stretch.
    """
    raise NotImplementedError


# Orchestrator that later ties all feature functions together.
def build_feature_frame(df: pd.DataFrame) -> pd.DataFrame:
    """Run all feature functions in order. Called from train.py and
    from the inference service."""
    raise NotImplementedError
