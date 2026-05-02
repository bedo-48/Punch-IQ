# PunchIQ — Architecture

> This is a living document. Fill in sections as the project progresses.

## System overview

```
┌────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│  React client  │ ────▶ │  FastAPI server  │ ────▶ │  ML inference    │
│ (Vercel)       │ HTTPS │  (Render)        │       │  (.pkl in memory)│
└────────────────┘       └──────────────────┘       └──────────────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │  Processed CSV       │
                         │ (server/data/processed)│
                         └──────────────────────┘
```

*(Replace this ASCII diagram with a proper diagram — e.g., Excalidraw export — before submission.)*

## Data flow

1. **Ingestion** — raw CSV lands in `server/data/raw/`. Never modified in place.
2. **Cleaning** — `server/ml/` scripts read raw, write to `server/data/interim/` then `server/data/processed/`.
3. **Training** — `server/ml/train.py` reads processed data, writes `.pkl` to `server/models/`.
4. **Serving** — `server/app/main.py` loads the latest `.pkl` at startup. `/predict` calls the inference wrapper.

## Why the `app/` vs `ml/` split

The deployed container should only ship inference code and dependencies (FastAPI, pydantic, joblib, a minimal numpy/scikit-learn). Training code (pandas-heavy, SHAP, matplotlib, jupyter) lives in `server/ml/` and is excluded from the production image. This keeps deploys fast and the attack surface small.

## Multi-sport extensibility

The MVP ships with **boxing only**, but the entire pipeline is keyed by a `sport` field to make a second sport (UFC) a plug-in rather than a rewrite.

Concretely:

- **Data schema.** Every processed row carries a `sport` column. Raw data is organized as `server/data/raw/{sport}/...`, processed outputs as `server/data/processed/{sport}/fights.csv`.
- **Feature registry.** `server/ml/features.py` groups feature functions by sport. Shared features (age diff, reach diff) live in a `common` bucket; sport-specific features (e.g., `takedown_diff` for UFC) live under their own bucket and are only applied when that sport is processed.
- **Model artifacts.** Trained models are named `models/{sport}_predictor.pkl`. The API loads every `*_predictor.pkl` it finds at startup into a dict keyed by sport.
- **API surface.** `POST /predict` takes a `sport` field in the request body. If only one sport is available, it defaults to `boxing`.
- **Frontend.** The sport selector is a no-op at MVP (boxing-only), but the component and state exist so that adding UFC is a matter of enabling the toggle.

**Resume bullet this unlocks** (valid even if UFC never ships): *"Designed a sport-agnostic feature registry and model loader so the system scales from one sport to many without refactor."*

## Dataset provenance

*To be filled in during Layer 2.*

| Source | License | # fights | Date range | Known issues |
|--------|---------|----------|------------|--------------|
| TBD    | TBD     | TBD      | TBD        | TBD          |

## Feature catalog

*To be filled in during Layer 4. Each feature documented here with definition, motivation, computation, and limitations.*

## Evaluation protocol

- **Split:** time-based. Train on fights through year X, validate on year X+1, test on year X+2 onward.
- **Baseline:** "higher historical win% wins" at time of fight.
- **Primary metric:** accuracy on *competitive* matchups (defined as: both fighters within 20% win% of each other AND both with ≥5 career fights). Reported alongside overall accuracy.
- **Calibration:** Brier score + reliability diagram.

## API surface (target)

| Method | Path              | Purpose                                   |
|--------|-------------------|-------------------------------------------|
| GET    | `/fighters`       | Paginated fighter list (name, record, weight class) |
| GET    | `/fighter/{name}` | Full profile for one fighter              |
| POST   | `/predict`        | Body: `{ fighter_a, fighter_b }` → probabilities + SHAP factors |
| GET    | `/health`         | Liveness probe for Render                 |

## Deployment

- **API:** Render free tier, Dockerfile in `server/`, autodeploy from `main`.
- **UI:** Vercel, autodeploy from `main`, env var `VITE_API_URL` points at Render URL.
- **Secrets:** none required for MVP (no auth, no third-party APIs).
