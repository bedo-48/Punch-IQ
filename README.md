# PunchIQ — Boxing Analytics & Fight Prediction Platform

A full-stack machine learning project that analyzes boxer statistics, predicts match outcomes, and explains *why* the model favors one fighter over another.

> Status: early development. See [`plan.md`](./plan.md) for the current roadmap.

---

## What it does

Given two fighters, PunchIQ:

1. Surfaces their core statistics side-by-side.
2. Predicts a calibrated win probability for each fighter.
3. Explains the top contributing factors (reach advantage, KO rate, recent form, etc.) using SHAP values.
4. Provides broader visual insights across the historical dataset.

## Why this project

Most "predict the winner" projects beat 50% and call it a day. PunchIQ is designed around a stronger benchmark: **beat a naive records-only baseline on competitive matchups**, with honest evaluation (time-based split, calibration, per-matchup breakdown).

## Tech stack

| Layer       | Tooling                                            |
|-------------|----------------------------------------------------|
| Data        | Python, Pandas, NumPy (+ BoxRec scraper later)     |
| ML          | scikit-learn (Logistic Regression, RF, GBM), SHAP  |
| Backend     | FastAPI, Pydantic, Uvicorn                         |
| Frontend    | React, TypeScript, Tailwind CSS, Recharts          |
| Deployment  | Render (API) + Vercel (UI), Docker for reproducibility |

## Repository layout

```
punch-iq/
├── client/                    # React + TS + Tailwind frontend
├── server/
│   ├── app/                   # FastAPI serving code (deployed)
│   │   ├── api/               # route handlers
│   │   ├── core/              # config, logging
│   │   ├── schemas/           # Pydantic request/response models
│   │   └── services/          # business logic
│   ├── ml/                    # training + explanation code (not deployed)
│   ├── data/{raw,interim,processed}/
│   ├── models/                # saved .pkl artifacts
│   ├── notebooks/             # EDA only
│   ├── scripts/               # one-off scripts (scraper, data exports)
│   └── tests/
├── docs/
│   └── architecture.md
├── plan.md                    # living project plan
└── README.md
```

The `app/` vs `ml/` split means the deployed container only ships inference dependencies — no scikit-learn training code or SHAP in production.

## Getting started (local)

> This section will be filled in as the project stabilizes. For now, see `plan.md`.

```bash
# Backend
cd server
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (later)
cd client
npm install
npm run dev
```

## Roadmap

See [`plan.md`](./plan.md) for the week-by-week plan. At a glance:

- [x] Repository scaffold
- [ ] Bootstrap dataset selected
- [ ] Data cleaning + feature engineering
- [ ] Baseline models (LogReg, RF, GBM) with naive-baseline comparison
- [ ] FastAPI `/predict` endpoint with SHAP explanations
- [ ] React dashboard (Home, Compare, Insights)
- [ ] Deployment (Render + Vercel)
- [ ] BoxRec scraper (data upgrade)

## Author

Built by Obed as a portfolio project focused on clean ML engineering, honest evaluation, and explainable predictions.
