# PunchIQ — Prompt de reprise de session

> Copie-colle tout ce qui suit dans un nouveau chat Cowork pour reprendre exactement où on s'était arrêté.

---

Bonjour Claude. Je suis **Obed** et je continue un projet portfolio appelé **PunchIQ** dans une nouvelle session. Voici tout le contexte dont tu as besoin pour reprendre comme un vrai mentor technique.

## Le projet

**PunchIQ — Boxing Analytics & Fight Prediction Platform.** Plateforme web qui prend deux boxeurs en entrée, prédit qui gagne avec une probabilité calibrée, et explique pourquoi via SHAP.

C'est un **projet portfolio pour internship en software engineering**, mais c'est aussi un **projet d'apprentissage** : je suis débutant en ML et Python. J'ai de l'expérience en Java. Tout le reste est nouveau.

## Mode de collaboration — IMPORTANT

**Tu dois m'enseigner, pas coder pour moi.** Mode mentor strict :

- Explique le QUOI et le POURQUOI avant le COMMENT
- Donne-moi des hints, pas le code complet
- C'est moi qui tape le code, tu me guides
- Pose des questions Socratiques pour ancrer les concepts
- Concepts en français, terminologie ML en anglais
- Push-back honnête si une idée est faible — pas un yes-man
- Avant un changement majeur, pose 2-3 questions de clarification
- Pas d'emojis sauf si j'en utilise
- Listes uniquement quand utiles, sinon prose

## Tech stack verrouillé

- **Python 3.14.0**
- **pandas 3.0.2**, numpy 2.4, scikit-learn 1.8, SHAP 0.51, joblib, matplotlib 3.10
- FastAPI, Pydantic v2 (pour Layer 7)
- Frontend (plus tard) : React + TypeScript + Tailwind + Recharts
- Déploiement (plus tard) : Render (API) + Vercel (UI)

## Décisions architecturales prises

1. **Sport principal : boxe.** UFC en stretch goal post-MVP.
2. **Architecture sport-agnostic** — colonne `sport` partout, modèles nommés `{sport}_predictor.pkl`.
3. **Pas de scraper BoxRec dans le MVP.**
4. **Vertical slice first** — pipeline complet boxe avant d'élargir.
5. **Évaluer contre baseline naïve** ("plus haut win% gagne" ou "toujours win_A") — fait, RF bat la baseline naïve 50% par 31 points.
6. **Split aléatoire** stratifié (pas de colonne date).
7. **Symmetric encoding appliqué APRÈS le train/test split**, pas dans le CSV — évite le leakage de structure entre original et miroir.
8. **Drop `stance_diff`** — l'imputation au mode a collapsé toute la variance, feature devenue constante.

## Timeline

2-3 semaines intense. **Layers 1-6 terminés.** Prochaine étape : **Layer 7 (API FastAPI)**.

Plan en 10 layers :
1. Scope & structure ✅
2. Data acquisition + EDA ✅
3. Cleaning ✅
4. Train/test split + feature scaling ✅
5. Baseline models (LogReg, RF, GBM) ✅ — RF winner à 80.9% accuracy
6. Évaluation + SHAP ✅ — summary + waterfall plots interprétés
7. **API FastAPI ← prochaine étape**
8. Frontend React
9. Charts + explainability UI
10. Deploy + polish

## État actuel du repo

```
C:\Users\obedm\Dev\Punch-IQ\
├── README.md, plan.md, .gitignore, docs/architecture.md, docs/handoff.md
├── .venv\                        ⚠️ doublon (à nettoyer plus tard)
├── client/                       (vide — Layer 8)
└── server/
    ├── .venv\                    ← le venv utilisé par le kernel Jupyter
    ├── requirements.txt          ← à mettre à jour avec matplotlib
    ├── .env.example
    ├── app/
    │   ├── main.py               ← FastAPI skeleton avec /health
    │   ├── core/config.py
    │   ├── api/, schemas/, services/   (vides — Layer 7)
    ├── ml/
    │   ├── features.py, train.py, evaluate.py, explain.py   (stubs vides)
    ├── data/
    │   ├── raw/boxing/
    │   │   ├── boxing_matches.csv      ← 387 427 lignes, 26 colonnes (source)
    │   │   ├── fighters.csv            ← 2 760 boxeurs avec noms (pour UI plus tard)
    │   │   └── popular_matches.csv     ← (ignoré)
    │   └── processed/boxing/
    │       └── boxing_cleaned.csv      ⭐ 362 655 × 9, pré-symmetric encoding
    ├── models/
    │   ├── boxing_predictor.pkl        ⭐ Random Forest entraîné (compress=3)
    │   └── boxing_scaler.pkl           ⭐ StandardScaler fitté sur train
    └── notebooks/
        ├── 01_eda.ipynb                ← exploration initiale
        ├── 02_cleaning.ipynb           ← pipeline cleaning
        └── 03_modeling.ipynb           ← split, scaling, training, SHAP
```

## Ce qu'on a fait, en bref

### Layer 3 — Cleaning (`02_cleaning.ipynb`)

- Drop 7 colonnes leakage : `judge1_A..judge3_B` + `decision` (info post-combat)
- Drop draws (24 772 lignes) → classification binaire
- Drop `reach_A` (71% NaN) et `reach_B` (90% NaN) — trop trouées pour imputer
- Imputation : médiane pour numériques, mode pour stances
- Création de 7 diff features : `age_diff`, `height_diff`, `weight_diff`, `won_diff`, `lost_diff`, `drawn_diff`, `kos_diff`
- Encoding du label : `label = (result == "win_B").astype(int)`
- **Sauvegarde du CSV pré-symmetric encoding** : `boxing_cleaned.csv` (362 655 × 9)

### Layer 4 — Préparation (`03_modeling.ipynb`)

- Drop `stance_diff` (constante après imputation → 0 info)
- Train/test split stratifié 80/20 : 290k train, 72k test (avant doublage)
- Symmetric encoding appliqué séparément sur chaque split : `apply_symmetric_encoding(X, y)` qui négate les 7 diffs et flippe le label
- Après doublage : train 580 248 lignes, test 145 062 lignes — 50/50 balanced
- `StandardScaler` fit sur train uniquement, transform sur les deux

### Layer 5 — Modèles baseline

Résultats finaux sur test set balancé 50/50 :

| Modèle | Accuracy | F1 (macro) |
|---|---|---|
| Baseline naïve | 0.500 | 0.33 |
| LogReg (max_iter=1000) | 0.7803 | 0.78 |
| HistGradientBoosting (max_iter=200, lr=0.1, max_depth=8) | 0.7994 | 0.80 |
| **Random Forest (n_estimators=100, max_depth=20)** | **0.8091** | **0.81** |

Surprenant : RF > GBM ici (sans doute parce que seulement 7 features). RF sérialisé via `joblib.dump(..., compress=3)`.

### Layer 6 — SHAP

`TreeExplainer(rf)` sur un sample de 1000 lignes du test (le shap_values est 3D `(1000, 7, 2)` — slicer `[:, :, 1]` pour la classe positive).

**Hiérarchie des features (SHAP summary plot)** :
1. `lost_diff` — plus A a perdu, plus le modèle prédit `win_B`
2. `won_diff` — plus A a gagné, plus le modèle prédit `win_A`
3. `age_diff` — plus A est vieux, plus le modèle prédit `win_B` (le jeune gagne)
4. `kos_diff` — plus A a de KO, plus le modèle prédit `win_A`
5-7. `drawn_diff`, `height_diff`, `weight_diff` — quasi nulle contribution

Convergence forte avec les coefficients LogReg → patterns robustes, pas un artefact du modèle.

**Waterfall plot fonctionnel** pour expliquer une prédiction individuelle — exactement ce que le produit promet en explainability UI (Layer 9).

## Concepts ML que j'ai appris dans la session précédente

- Class imbalance + pourquoi accuracy seule trompe
- Precision, recall, F1 par classe, macro-F1
- Confusion matrix (lecture, interprétation TP/FP/FN/TN)
- Data leakage : info post-combat (decision, judges), info de structure (mirror dans train+test)
- Symmetric encoding : doubler dataset + négater diffs + flipper label → balance 50/50
- Diff features : encoder la symétrie structurellement
- Imputation : médiane (robuste outliers) vs mode (catégoriel) — piège du mode qui collapse la variance
- Train/test split, `stratify=y`, `random_state=42`
- StandardScaler : fit on train, transform on both (règle universelle de prévention du leakage)
- LogReg, RF, GBM — quand chacun brille
- `feature_importances_` (RF) vs `coef_` (LogReg) vs SHAP (per-prediction)
- `TreeExplainer`, `summary_plot`, `waterfall_plot`

## Concepts Python appris

- Notebook workflow : kernel state, ordre d'exécution, Run All, restart
- pandas : `df.drop(columns=)`, boolean indexing `df[df["col"] != val]`, `df.fillna()`, `.median()`, `.mode()[0]`, `.astype(int)`, `pd.concat([...], ignore_index=True)`
- f-strings : `f"{var}_suffix"`
- For loop sur liste de strings
- Fonctions : `def`, `return`, retour multiple en tuple
- Joblib pour sérialiser les modèles sklearn
- `!pip install` depuis Jupyter (vs terminal — piège : si le venv n'est pas activé, ça installe au mauvais endroit)

## Tickets ouverts / dettes techniques

1. **Deux `.venv` dans le repo** — `Punch-IQ/.venv` (utilisé par le kernel) et `Punch-IQ/server/.venv` (probablement vestige). À nettoyer.
2. **`matplotlib` installé via `!pip install` mais pas (encore ?) ajouté à `server/requirements.txt`** — à vérifier et ajouter.
3. **`stance_diff` dropped** — imputation par mode trop brutale. Stretch goal : imputer par sampling aléatoire selon la distribution observée des stances.
4. **Tuning des hyperparamètres** — RF et GBM testés avec valeurs par défaut/raisonnables. Pas de GridSearch ni CV systématique. Stretch goal : `RandomizedSearchCV` pour grappiller des points.
5. **Class weights / oversampling pas testés** — alternative au symmetric encoding qu'on n'a pas explorée. Note pour future itération.

## Plan Layer 7 — API FastAPI

L'objectif : exposer le modèle via une route HTTP, pour que le frontend (Layer 8) puisse l'appeler.

Endpoints à implémenter :
- `GET /health` — déjà là, juste à vérifier qu'il tourne
- `POST /predict` — reçoit deux boxeurs (features), retourne probabilité + classe prédite
- `POST /explain` — reçoit deux boxeurs, retourne probabilité + contributions SHAP par feature

Décisions à prendre ensemble en Layer 7 :
- Schéma Pydantic d'entrée : on demande les valeurs brutes (age_A, age_B, ...) ou les diffs pré-calculées ?
- On expose `predict` et `explain` séparément, ou un seul endpoint qui retourne tout ?
- Comment gérer le scaler (charger une seule fois au démarrage de l'app, pas à chaque requête) ?
- Validation : que faire si des features sont manquantes côté requête ? (médiane par défaut comme à l'entraînement ?)

## Première action quand tu réponds

Salue-moi brièvement, confirme que tu as bien lu le contexte, et propose la prochaine étape pédagogique. Format de réponse suggéré :

> Salut Obed. J'ai pris la main : tu as un RF à 80.9% sérialisé, SHAP fonctionnel, prêt à attaquer Layer 7 (API FastAPI). Avant qu'on code, je veux te poser 2-3 questions de clarification sur le design de l'API.
>
> [Questions de clarification]

Vas-y.
