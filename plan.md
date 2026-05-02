# PunchIQ — Project Plan

**Timeline:** 2–3 weeks to resume-ready MVP.
**Deployment target:** Live deployed (Render + Vercel).
**Primary sport:** Boxing.
**Data strategy:** Bootstrap with a public CSV boxing dataset. BoxRec scraping is dropped from the MVP (too risky for the timeline) and only revisited if the stretch permits.
**Architectural choice:** Sport-agnostic design. The MVP ships with boxing only, but the schema, feature registry, and model loader are keyed by `sport` so that a second sport (UFC) can be plugged in without refactor.

This document is the single source of truth for project scope. Update it as decisions change.

---

## Guiding principles

1. **Vertical slice first.** Get data → model → API → UI → deployed all working on a small slice, then deepen each layer. Never let one layer block the others for more than a day.
2. **Beat the naive baseline, not just 50%.** Our headline metric is accuracy on *competitive* matchups (fight records within N wins of each other), compared to the "higher win% wins" baseline.
3. **Time-based splits, not random.** Train on older fights, test on newer ones. Boxing data has temporal leakage.
4. **Explainability is a feature, not decoration.** SHAP values ship with the `/predict` response from day one.
5. **Every commit should keep the project runnable.** No broken `main`.
6. **Sport-agnostic architecture from day one.** Every data row carries a `sport` column; features are grouped by sport in `ml/features.py`; trained models are saved as `models/{sport}_predictor.pkl`. We ship boxing first; UFC is a plug-in, not a rewrite.

---

## Layered roadmap

### Layer 1 — Scope & folder structure  `[in progress]`
- Repo scaffold (`client/`, `server/app/`, `server/ml/`, `server/data/{raw,interim,processed}`, etc.)
- `README.md`, `plan.md`, `.gitignore`, `.env.example`
- First commit to GitHub

### Layer 2 — Data acquisition & inspection
- **Bootstrap dataset (boxing):** evaluate 2–3 candidate Kaggle / public CSV boxing datasets. Pick one based on:
  - Size (aim for >10k fights)
  - Feature coverage (at minimum: fighter names, record, age, height, reach, stance, fight date, outcome)
  - Freshness
  - License (must allow portfolio/demo use)
- Load into `server/data/raw/boxing/`, inspect in `server/notebooks/01_eda.ipynb`.
- Document dataset provenance + known limitations in `docs/architecture.md`.
- Processed output includes a `sport` column (value `boxing` for now, reserved for UFC later).

### Layer 3 — Data cleaning & preprocessing
- Normalize fighter names, handle missing heights/reaches (flag vs. impute, decide per column).
- Deduplicate fights.
- Parse dates, records (e.g., "28-1-0" → wins/losses/draws).
- Output a single `server/data/processed/fights.csv`.

### Layer 4 — Feature engineering
Each feature gets: **definition → why it matters → computation → limitations.** Documented in `server/ml/features.py` and in `docs/architecture.md`.
- `age_diff` = fighter_a.age − fighter_b.age
- `reach_diff` = fighter_a.reach − fighter_b.reach
- `height_diff` = fighter_a.height − fighter_b.height
- `win_pct_diff`
- `ko_rate_diff`
- `experience_diff` (total pro fights)
- `recent_form_diff` (last 5 fights win%, time-weighted)
- `avg_rounds_diff`
- `stance_matchup` (categorical: orthodox-vs-southpaw, etc.)
- Symmetric encoding: ensure the model doesn't learn "fighter_a is always favored."

### Layer 5 — Baseline ML model
- Models, in order: **Logistic Regression → Random Forest → Gradient Boosting** (HistGradientBoostingClassifier).
- Pipeline via `sklearn.pipeline.Pipeline` + `ColumnTransformer`.
- Save best model as `server/models/boxing_predictor.pkl` (sport prefix — keeps the door open for `ufc_predictor.pkl` later without collision).

### Layer 6 — Evaluation & interpretation
- **Time-based split** (e.g., train ≤ 2017, val 2018, test 2019+).
- Metrics: accuracy, ROC-AUC, log loss, **Brier score** (calibration), per-bucket accuracy (lopsided vs. competitive matchups).
- **Naive baseline:** "higher historical win% wins." Headline number = our accuracy − baseline accuracy on competitive subset.
- Calibration curve plot in `server/notebooks/02_evaluation.ipynb`.
- SHAP global feature importance + one example per-fighter SHAP waterfall.

### Layer 7 — Backend API
- `GET /fighters` — paginated fighter list.
- `GET /fighter/{name}` — single fighter profile.
- `POST /predict` — returns probabilities + top SHAP-ranked factors.
- Request/response schemas in `server/app/schemas/`.
- Inference wrapper in `server/app/services/prediction.py` (loads `models/*.pkl` once at startup).

### Layer 8 — Frontend UI
- Vite + React + TS + Tailwind scaffold inside `client/`.
- Pages: **Home**, **Compare Fighters**, **Data Insights**.
- API client in `client/src/services/`.
- Type definitions in `client/src/types/` generated from / mirroring the Pydantic schemas.

### Layer 9 — Charts & prediction explanation
- Recharts for stat comparison bars + probability gauge.
- "Why this prediction?" panel: SHAP factors rendered as a horizontal bar chart with signed contributions.
- Insights page: KO rate by weight class, upset rate by reach gap, etc.

### Layer 10 — README, polishing, deployment, resume bullets
- Dockerfile for the API, deployed to Render.
- Frontend deployed to Vercel.
- Architecture diagram in `docs/architecture.md`.
- README: screenshots, live link, tech stack badges.
- Final resume bullets derived from measurable outcomes (accuracy lift over baseline, calibration score, etc.).

---

## Stretch goals (only after MVP is deployed)

Ordered by expected resume value:

1. **UFC as a second sport.** Plug the Kaggle UFC dataset into the existing pipeline. Because the architecture is sport-agnostic, this should be hours, not days: download → clean → register UFC-specific features in `ml/features.py` → train `ufc_predictor.pkl` → add a sport toggle to the UI. Headline resume bullet: *"Extended the platform from boxing to MMA in N days by reusing the sport-agnostic pipeline."*
2. **BoxRec scraper** (`server/scripts/scrape_boxrec.py`) with caching + rate limiting, to refresh/enrich the boxing dataset.
3. **Weight-class awareness** (separate model per division, or weight-class as a feature).
4. **Cross-sport insights page.** e.g., "Is reach more predictive in boxing or MMA?" — uses both datasets purely for the analytics/visualization layer.
5. **SQLite DB** for fighter lookup if CSV filter gets slow.

---

## Open questions / decisions to revisit

- [x] **Primary sport?** Boxing (user's passion). UFC is a stretch goal, not a parallel track.
- [x] **BoxRec scraping in the MVP?** No. Dropped from MVP due to 2–3 week timeline risk. Revisit as stretch after deployment.
- [x] **Architecture?** Sport-agnostic from day one (schema, features, models all keyed by sport). Ships with boxing only.
- [ ] Which bootstrap boxing dataset? (resolve in Layer 2 — next task)
- [ ] Cutoff year for time-based split? (resolve in Layer 6, depends on data recency)
- [ ] Do we predict method of victory (KO vs. decision) as a stretch? *Current answer: no — win/loss only for MVP.*
- [ ] LFS for `models/*.pkl` or release attachments? *Current answer: decide when model is trained.*

---

## Weekly checkpoints

### Week 1 (Layers 1–6)
- End of Day 1: repo scaffold committed, plan.md live.
- End of Day 2: bootstrap dataset chosen + loaded.
- End of Day 4: cleaned data + feature engineering done.
- End of Day 7: baseline models trained, evaluated, beating naive baseline on competitive subset.

### Week 2 (Layers 7–9)
- End of Day 10: FastAPI `/predict` working locally with SHAP.
- End of Day 12: Compare Fighters page functional end-to-end.
- End of Day 14: Insights page + charts polished.

### Week 3 (Layer 10 + stretch)
- End of Day 16: deployed to Render + Vercel.
- End of Day 18: README + screenshots + architecture diagram.
- Days 19–21: buffer + optional BoxRec scraper.
