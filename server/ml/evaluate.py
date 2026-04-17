"""
Evaluation utilities for PunchIQ.

Reports we care about:
  - Overall accuracy, ROC-AUC, log loss, Brier score.
  - Accuracy on the *competitive* subset (both fighters within a
    win-rate band of each other and with enough career fights).
  - Delta vs. the naive baseline ("higher historical win% wins").
  - Calibration curve data points for a reliability diagram.

Keep this module free of plotting code; that lives in notebooks.
"""

from __future__ import annotations


def naive_baseline_predict(df) -> list[int]:
    """Return 1 if fighter_a has the higher pre-fight win%, else 0.
    Breaks ties in favor of fighter_a (can be randomized later)."""
    raise NotImplementedError


def report(y_true, y_prob, df_meta) -> dict:
    """Produce a dict of metrics for the given predictions. The
    `df_meta` frame carries fight metadata (dates, records) used to
    bucket by competitive vs. lopsided and to compute the baseline."""
    raise NotImplementedError
