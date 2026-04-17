"""
Training entrypoint.

Usage (from `server/`):
    python -m ml.train

Reads the processed CSV, builds features, fits a pipeline, writes a
serialized model + metadata to `models/`. This script is intentionally
small — the actual feature/evaluation logic lives in sibling modules.
"""

from __future__ import annotations


def main() -> None:
    # TODO (Layer 5):
    # 1. Load processed/fights.csv
    # 2. Build features via ml.features.build_feature_frame
    # 3. Time-based split (train <= 2017, val 2018, test 2019+)
    # 4. Fit a sklearn Pipeline (preprocessing + classifier)
    # 5. Evaluate via ml.evaluate.report (accuracy, ROC-AUC, Brier, baseline delta)
    # 6. Save to models/fight_predictor.pkl via joblib.dump
    raise NotImplementedError


if __name__ == "__main__":
    main()
