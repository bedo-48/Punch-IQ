# PunchIQ

> Machine learning-powered boxing fight predictor with per-prediction SHAP explanations.

Predict the outcome of a hypothetical match between any two fighters from a database of 2,700+ boxers, with calibrated probabilities and a breakdown of *why* the model favors one fighter over the other.

---

## What it does

1. **Search** two boxers by name (autocomplete over a curated fighter database).
2. **Edit** any of their stats — age, height, weight, wins, losses, draws, KOs.
3. **Predict** the winner with calibrated probabilities.
4. **Explain** the prediction with SHAP — each feature's signed contribution shown as a bar.

The model has learned that the strongest predictors are, in order: **fewer career losses**, **fewer wins than the opponent**, **age**, and **KO count**. Height, weight, and draws carry surprisingly little signal in this dataset.

## Results

Trained on **725,310 fights** (after cleaning and symmetric encoding) from the public boxing matches dataset.

| Model                          | Accuracy   | F1 macro |
|--------------------------------|------------|----------|
| Naive baseline (majority)      | 0.500      | 0.33     |
| Logistic Regression            | 0.7803     | 0.78     |
| HistGradientBoosting           | 0.7994     | 0.80     |
| **Random Forest** (deployed)   | **0.8091** | **0.81** |

The Random Forest is the model served by the API. Symmetric encoding (each fight inserted in both A→B and B→A orientations during training) eliminates positional bias — the confusion matrix is nearly diagonal-symmetric, with both classes scoring 0.78 precision/recall/F1.

## Tech stack

| Layer        | Tooling                                                |
|--------------|--------------------------------------------------------|
| Data         | Python 3.14, Pandas 3.0, NumPy 2.4                     |
| ML           | scikit-learn 1.8 (LogReg, RF, HistGBM), SHAP 0.51      |
| API          | FastAPI, Pydantic v2, Uvicorn                          |
| Frontend     | React 18 + TypeScript, Vite, Tailwind CSS v4, Recharts |
| Deployment   | _(planned)_ Render for API, Vercel for frontend       |

## Architecture

```
┌──────────────────┐         ┌─────────────────┐        ┌─────────────────┐
│  React frontend  │  HTTPS  │  FastAPI server │  joblib│  RandomForest   │
│  (Vite + TS)     ├─────────►   /predict      ├────────►  + Scaler       │
│  Tailwind +      │         │   /fighters     │        │  + Medians      │
│  Recharts        │         │   /health       │        │  + TreeExplainer│
└──────────────────┘         └────────┬────────┘        └─────────────────┘
                                      │
                                      │ pandas
                                      ▼
                              fighters.csv (autocomplete database)
                              boxing_cleaned.csv (training data)
```

All ML artifacts are loaded **once at startup** via FastAPI's lifespan event. Predictions (including SHAP computation) complete in <100ms.

## Repository layout

```
punch-iq/
├── client/                          # React + TS + Tailwind frontend
│   ├── public/splash.png            # splash-screen anatomy illustration
│   └── src/
│       ├── components/
│       │   ├── SplashScreen.tsx     # 2.5s intro splash
│       │   ├── FighterSearch.tsx    # debounced autocomplete
│       │   ├── FighterCard.tsx      # search + editable stat form
│       │   └── PredictionPanel.tsx  # bar chart + SHAP waterfall
│       ├── api.ts                   # fetch wrapper for the backend
│       ├── types.ts                 # TS interfaces mirroring API schemas
│       └── App.tsx
│
├── server/
│   ├── app/
│   │   ├── api/                     # FastAPI routes: predict, fighters
│   │   ├── core/config.py           # pydantic-settings
│   │   ├── schemas/                 # Pydantic request/response models
│   │   ├── services/
│   │   │   ├── model_loader.py      # joblib + SHAP TreeExplainer init
│   │   │   ├── predictor.py         # impute → diff → scale → predict + SHAP
│   │   │   └── fighters_service.py  # CSV parsing + name search
│   │   └── main.py                  # FastAPI entrypoint + lifespan
│   ├── ml/                          # training scripts (placeholders)
│   ├── data/
│   │   ├── raw/boxing/              # boxing_matches.csv, fighters.csv
│   │   └── processed/boxing/        # cleaned dataset
│   ├── models/                      # boxing_predictor.pkl, scaler, medians
│   └── notebooks/
│       ├── 01_eda.ipynb
│       ├── 02_cleaning.ipynb
│       └── 03_modeling.ipynb
│
└── docs/
    ├── architecture.md
    └── handoff.md                   # session handoff for AI-assisted work
```

## Running locally

**Backend:**

```bash
cd server
python -m venv .venv
.venv\Scripts\activate            # Windows (Linux/Mac: source .venv/bin/activate)
pip install -r requirements.txt
uvicorn app.main:app
```

API at http://localhost:8000. Interactive Swagger docs at http://localhost:8000/docs.

**Frontend:**

```bash
cd client
npm install
npm run dev
```

UI at http://localhost:5173.

## Methodology highlights

A few non-trivial decisions made during the build:

- **Drop high-NaN columns rather than impute.** `reach_B` was 90% missing — imputing such a column generates noise, not signal. Honest acknowledgment that reach data is unusable.
- **Median imputation, not mean.** Robust to outliers (the dataset has boxers with absurd record counts that would skew a mean).
- **Symmetric encoding.** Each fight is inserted twice — once with each fighter as A. Diff features (`age_diff`, etc.) are negated, label is flipped. Breaks positional bias and balances the dataset to 50/50.
- **Train/test split BEFORE encoding doubling.** Doubling first then splitting would leak each fight's mirror across the train/test boundary — invisible data leakage that would inflate test metrics by ~10 points.
- **`StandardScaler.fit` on train only.** Transform applied to both. Standard rule to prevent test statistics leaking into training.
- **Three baselines compared, not one.** Naive majority class, then LogReg (linear), then trees (non-linear). The +3 point gain from LogReg to RF confirmed non-linear signal exists.

## Known limitations

Deliberate trade-offs to ship within a 2-3 week timebox:

- **Weight class is invisible.** Heavyweight vs flyweight matchups would never happen in real boxing, but the model accepts them silently.
- **Champion status not encoded.** "Current titleholder" is a strong real-world predictor; not in the feature set.
- **Fighting style ignored.** Southpaw matchups, puncher vs technician dynamics — none captured.
- **Era-agnostic.** A 1920s fight and a 2024 fight are treated identically.
- **Stance feature dropped.** Mode imputation on paired-missing data collapsed all variance. Fixable via sampling imputation in v2.
- **No hyperparameter tuning.** Models trained with default-ish parameters; a `RandomizedSearchCV` pass would likely yield 1-2 more points.

These are documented in [`docs/handoff.md`](./docs/handoff.md) as future work.

## Roadmap

- [x] Layer 1-2: Repo scaffold + EDA on raw dataset
- [x] Layer 3: Cleaning (drop leakage, drop draws, impute, symmetric encoding)
- [x] Layer 4: Train/test split + feature scaling
- [x] Layer 5: Baseline models — RF winner at 80.9% accuracy
- [x] Layer 6: SHAP global + per-prediction explanations
- [x] Layer 7: FastAPI with `/predict` and `/fighters` endpoints
- [x] Layer 8: React frontend (autocomplete, editable form, charts, SHAP waterfall)
- [x] Layer 9: Splash screen + visual polish
- [ ] Layer 10: Deployment to Render + Vercel
- [ ] BoxRec scraper for current data
- [ ] Weight class as a feature
- [ ] Hyperparameter tuning
- [ ] UFC variant (architecture is sport-agnostic)

## Author

Built by **Obed Mavungu** as a portfolio project — focused on clean ML engineering, honest evaluation, and explainable predictions.
