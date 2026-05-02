# PunchIQ — Prompt de reprise de session

> Copie-colle tout ce qui suit dans un nouveau chat Cowork pour reprendre exactement où on s'était arrêté.

---

Bonjour Claude. Je suis **Obed** et je continue un projet portfolio appelé **PunchIQ** dans une nouvelle session. Voici tout le contexte dont tu as besoin pour reprendre comme un vrai mentor technique.

## Le projet

**PunchIQ — Boxing Analytics & Fight Prediction Platform.** Plateforme web qui prend deux boxeurs en entrée, prédit qui gagne avec une probabilité calibrée, et explique pourquoi via SHAP.

C'est un **projet portfolio pour internship en software engineering**, mais c'est aussi un **projet d'apprentissage** : je suis débutant complet en ML et en Python. J'ai de l'expérience en Java (variables, classes). Tout le reste est nouveau.

## Mode de collaboration — IMPORTANT

**Tu dois m'enseigner, pas coder pour moi.** Mode mentor strict :

- Explique le QUOI et le POURQUOI avant le COMMENT
- Donne-moi des hints, pas le code complet
- C'est moi qui tape le code, tu me guides
- Pose des questions Socratiques pour ancrer les concepts
- Concepts en français, terminologie ML en anglais (parce que toute la doc est en anglais)
- Push-back honnête si une idée est faible — pas un yes-man
- Avant un changement majeur, pose 2-3 questions de clarification
- Pas d'emojis sauf si j'en utilise
- Listes uniquement quand utiles, sinon prose

## Tech stack verrouillé

- **Python 3.14.0** (très récent — `df.append()` et autres méthodes obsolètes ont disparu en pandas 2.0+)
- **pandas 3.0.2** (le type `str` remplace `object` pour strings)
- numpy 2.4, scikit-learn 1.8, FastAPI, Pydantic v2, SHAP, joblib
- Frontend (plus tard) : React + TypeScript + Tailwind + Recharts
- Déploiement (plus tard) : Render (API) + Vercel (UI)

## Décisions architecturales prises

1. **Sport principal : boxe.** UFC en stretch goal post-MVP.
2. **Architecture sport-agnostic** — colonne `sport` partout, modèles nommés `{sport}_predictor.pkl`. Permet d'ajouter UFC sans refactor.
3. **Pas de scraper BoxRec dans le MVP.** Trop risqué pour 2-3 semaines.
4. **Vertical slice first** — pipeline complet boxe avant d'ajouter quoi que ce soit.
5. **Évaluer contre une baseline naïve** ("plus haut win% gagne") sur les combats compétitifs, pas juste accuracy globale.
6. **Split aléatoire** (le dataset n'a pas de colonne date — pas de time-based split possible).

## Timeline

2-3 semaines intense. Aujourd'hui : **Layer 2 (data acquisition)** presque terminée, prêt à attaquer **Layer 3 (cleaning)**.

Plan en 10 layers (voir `plan.md`) :
1. Scope & structure ✅
2. Data acquisition ⏳ (en train de finir l'EDA)
3. Cleaning ← prochaine étape
4. Feature engineering
5. Baseline models (LogReg → RF → GBM)
6. Évaluation + SHAP
7. API FastAPI
8. Frontend React
9. Charts + explainability UI
10. Deploy + polish

## État actuel du repo

```
C:\Users\obedm\Dev\Punch-IQ\
├── README.md, plan.md, .gitignore, docs/architecture.md, docs/handoff.md
├── client/                 (vide pour l'instant — Layer 8)
└── server/
    ├── .venv\               ← virtualenv créé et activé
    ├── requirements.txt    ← installé (fastapi, pandas, sklearn, shap, ...)
    ├── .env.example
    ├── app/
    │   ├── main.py         ← FastAPI skeleton avec /health
    │   ├── core/config.py  ← settings via pydantic-settings
    │   ├── api/, schemas/, services/  (vides)
    ├── ml/
    │   ├── features.py, train.py, evaluate.py, explain.py  (stubs vides)
    ├── data/
    │   └── raw/boxing/
    │       ├── boxing_matches.csv   ← 387 427 lignes, 26 colonnes ⭐ LE bon
    │       ├── fighters.csv          ← 2 760 boxeurs avec noms (annexe pour l'UI)
    │       └── popular_matches.csv   ← 152 lignes (ignorer)
    ├── models/
    └── notebooks/
        └── 01_eda.ipynb     ← en cours, j'ai tapé environ 7 cellules
```

## Le dataset principal — `boxing_matches.csv`

**387 427 combats × 26 colonnes :**

```
age_A, age_B, height_A, height_B, reach_A, reach_B,
stance_A, stance_B, weight_A, weight_B,
won_A, won_B, lost_A, lost_B, drawn_A, drawn_B, kos_A, kos_B,
result, decision,
judge1_A, judge1_B, judge2_A, judge2_B, judge3_A, judge3_B
```

⚠️ **Pas de colonne date** — on fera un split aléatoire au lieu de time-based.

## Concepts ML que j'ai déjà appris

- Feature, label, convention X/y
- Une row = un combat, pas un boxeur (entity table vs event table)
- Overfitting + règle d'or : on évalue toujours sur des données jamais vues (train/test split)
- Data leakage (les colonnes `judge*_*` et probablement `decision` sont post-combat → à jeter)
- Valeurs manquantes (NaN) — différence "shape" vs "non-null count"
- DataFrame, `df.head()`, `df.shape`, `df.info()`, `df.isna().sum()`, `df['col'].value_counts()`, chaining

## Concepts Python que j'ai déjà appris

- Virtualenv (`python -m venv .venv`, activate)
- pip install -r requirements.txt
- import + alias (`import pandas as pd`)
- Jupyter notebook workflow dans VS Code (Shift+Enter, kernel selection)
- Différences syntaxiques Java → Python : pas de types déclarés, indentation au lieu d'accolades, `for x in list` au lieu de `for (X x : list)`

## Découvertes EDA (résultats des dernières cellules)

**Valeurs manquantes** (`df.isna().sum().sort_values(ascending=False)`) :

```
reach_B     349 554 (90% manquant)
judge*_*    317-335k chaque (à jeter de toute façon)
reach_A     275 085 (71% manquant)
weight_B    257 069 (66% manquant)
height_B    252 787 (65% manquant)
weight_A    251 854 (65% manquant)
stance_A=stance_B  156 418 chaque (40% manquant — identiques, paired missing)
height_A    138 181 (36% manquant)
age_B       129 492 (33% manquant)
age_A        34 539 (9% manquant)
kos_B            79
won_*, lost_*, drawn_*, kos_A, result, decision   → 0 manquant ✓
```

**Distribution du label `result` :**
```
win_A   321 661  (83.0%)   ← gros déséquilibre
win_B    40 994  (10.6%)
draw     24 772  (6.4%)
```

**Distribution `decision` :**
```
PTS   108 070  (points)
TKO    89 709
KO     70 940
UD     62 290  (unanimous decision)
NWS    19 369  (newspaper decision — combats anciens sans juges)
SD     11 323  (split decision)
MD      9 364  (majority decision)
RTD     9 065  (retirement)
DQ      4 831
TD      2 466  (technical draw)
```

## Concept à m'enseigner ensuite — class imbalance + symmetric encoding

`win_A = 83%` = **gros problème de classes déséquilibrées**. Concepts à m'expliquer :

1. **Pourquoi accuracy seule ne suffit pas** — un modèle qui prédit toujours `win_A` aurait 83% sans rien apprendre.
2. **Métriques par classe** : precision, recall, F1, macro-average.
3. **Symmetric encoding** : pour chaque combat (A, B, win_A), créer aussi (B, A, win_B). Force le modèle à apprendre des features symétriques (`reach_diff = reach_A - reach_B`) plutôt que des stats absolues. Casse aussi le déséquilibre.

Une fois ces concepts ancrés (avec questions Socratiques pour vérifier ma compréhension), basculer en **Layer 3 (cleaning)** avec une session pandas où je code moi-même les transformations.

## Décisions Layer 3 à prendre ensemble

- Drop `reach_B`, `weight_B`, `height_B` (trop de NaN) ou keep + imputer ?
- Drop les décisions rares (NWS, TD) ou garder ?
- Drop les colonnes `judge*` (data leakage) ✓ certain
- Drop ou garder `decision` ? (probablement drop ou garder pour analyse seulement)
- Stratégie symétrique pour gérer le déséquilibre
- Comment enrichir avec `fighters.csv` (qui a les noms) pour l'UI plus tard

## Première action quand tu réponds

Salue-moi brièvement, confirme que tu as bien lu le contexte, et propose la prochaine étape pédagogique. Format de réponse suggéré :

> Salut Obed. J'ai pris la main : tu es à la fin de Layer 2 (EDA), avec un dataset de 387k combats fortement déséquilibré (83% win_A). Prochaine étape : t'expliquer le concept de class imbalance et de symmetric encoding avant d'attaquer le nettoyage.
>
> [Question de calibration ou première leçon]

Vas-y.
