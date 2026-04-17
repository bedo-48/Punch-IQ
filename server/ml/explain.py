"""
SHAP-based explanations for the PunchIQ model.

Purpose: for any single prediction, return a ranked list of the top
features and their signed contributions, ready to be rendered in the
UI's "why this prediction?" panel.

Keep the SHAP explainer built once per model load; SHAP is heavy.
"""

from __future__ import annotations


def build_explainer(model, background_sample):
    """Build a SHAP explainer appropriate to the model type
    (TreeExplainer for tree-based, LinearExplainer for logreg)."""
    raise NotImplementedError


def explain_prediction(explainer, feature_row) -> list[dict]:
    """
    Return a list like:
        [{"feature": "reach_diff", "value": 3.5, "contribution": 0.12}, ...]
    sorted by |contribution| descending. The top ~5 are what the UI
    will show.
    """
    raise NotImplementedError
