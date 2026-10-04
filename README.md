# PlacementAI — Intelligent Placement Prediction System

An AI-powered web app that predicts whether a student is likely to get placed based on
academic and skill data, explains **why** using SHAP, and gives personalized
recommendations to improve placement chances.

## Architecture

```
PlacementAI/
├── backend/        FastAPI service — auth, prediction, analytics, recommendations
├── training/        Dataset generation + ML training pipeline (model comparison, XGBoost, SHAP)
├── models/          Saved model artifacts (xgb_model.joblib, scaler, encoders, SHAP explainer, metrics.json)
├── dataset/          Generated synthetic dataset (students.csv)
├── frontend/         React + Vite + Tailwind SPA
└── docker-compose.yml
```

**Flow:** `training/generate_dataset.py` → `training/train_model.py` → saves artifacts to
`models/` → `backend/predict.py` loads them at startup → `/predict` endpoint runs
inference + SHAP explanation + rule-based recommendations → results stored in Postgres
and shown in the React dashboard.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Recharts, Axios, React Router, Lucide Icons
- **Backend:** FastAPI, SQLAlchemy, JWT auth (python-jose), bcrypt password hashing
- **ML:** scikit-learn, XGBoost, SHAP, pandas, numpy, joblib
- **Database:** PostgreSQL
- **Deployment:** Docker, Docker Compose (Render/Railway/Vercel-ready)

## Model Performance

Trained on 10,000 synthetic student records, 5 models compared
(Logistic Regression, Decision Tree, Random Forest, Gradient Boosting, XGBoost),
with the tuned XGBoost model selected for production:

| Metric | Score |
|---|---|
| Accuracy | 87.1% |
| Precision | 87.1% |
| Recall | 86.9% |
| F1 | 87.0% |
| ROC-AUC | 95.4% |

Full model comparison and SHAP feature-importance values are saved in `models/metrics.json`.

## Installation & Local Development (without Docker)

### 1. Generate the dataset and train the model
```bash
cd training
pip install pandas numpy scikit-learn xgboost shap joblib
python3 generate_dataset.py
python3 train_model.py
```
This writes `dataset/students.csv` and the model bundle to `models/`.

### 2. Run the backend
```bash
cd backend
pip install -r requirements.txt
# Point at a running Postgres instance, or use SQLite for quick local testing:
export DATABASE_URL="sqlite:///./dev.db"
export MODEL_DIR="../models"
export DATASET_PATH="../dataset/students.csv"
export METRICS_PATH="../models/metrics.json"
uvicorn main:app --reload
```
API docs available at `http://localhost:8000/docs`.

### 3. Run the frontend
```bash
cd frontend
npm install
npm run dev
```
App available at `http://localhost:5173`. Set `VITE_API_URL` in a `.env` file if your
backend isn't on `localhost:8000`.

## Deployment with Docker Compose

```bash
# 1. Generate dataset + train model once, so models/ and dataset/ are populated
cd training && python3 generate_dataset.py && python3 train_model.py && cd ..

# 2. Build and start everything (Postgres + FastAPI + React)
docker-compose up --build
```

- Backend: `http://localhost:8000` (Swagger docs at `/docs`)
- Frontend: `http://localhost:4173`
- Postgres: `localhost:5432` (user/pass `postgres`/`postgres`, db `placementai`)

Set a strong `SECRET_KEY` env var in production (used for JWT signing).

## Deploying to Render / Railway / Vercel

- **Backend (Render/Railway):** point at `backend/Dockerfile`, add a managed Postgres
  add-on, and set `DATABASE_URL`, `SECRET_KEY`, `MODEL_DIR=/app/models`,
  `DATASET_PATH=/app/dataset/students.csv` as environment variables. Mount or bake in
  the trained `models/` and `dataset/` directories (they aren't regenerated automatically).
- **Frontend (Vercel):** deploy the `frontend/` folder, set `VITE_API_URL` to your
  deployed backend URL.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Create a student account, returns JWT |
| POST | `/login` | OAuth2 password login, returns JWT |
| POST | `/predict` | Predict placement probability + SHAP explanation + recommendations (auth required) |
| GET | `/history` | Past predictions for the logged-in student (auth required) |
| GET | `/recommendations` | Latest recommendation set (auth required) |
| GET | `/analytics` | Aggregate dashboard stats + model metrics |
| POST | `/train` | Trigger offline retraining (runs `training/train_model.py`) |

## Environment Variables

| Variable | Used by | Default |
|---|---|---|
| `DATABASE_URL` | backend | `postgresql://postgres:postgres@localhost:5432/placementai` |
| `SECRET_KEY` | backend | dev placeholder — **change in production** |
| `MODEL_DIR` | backend, training | `/app/models` |
| `DATASET_PATH` | backend, training | `/app/dataset/students.csv` |
| `METRICS_PATH` | backend | `/app/models/metrics.json` |
| `TRAIN_SCRIPT_PATH` | backend (`/train` endpoint) | `/app/training/train_model.py` |
| `VITE_API_URL` | frontend | `http://localhost:8000` |

## Screenshots

_Add screenshots of the Landing, Dashboard, Prediction, and Analytics pages here after
running the app locally._

## Known Limitations / Future Scope

- Admin panel (dataset upload UI, student management, prediction logs) is not yet built —
  the `/train` endpoint exists for retraining, but there's no UI for dataset upload or
  student CRUD yet.
- CSV/PDF export buttons are not implemented.
- `/train` retraining runs synchronously in-process; production use should move this to
  an async job queue (Celery/RQ) so it doesn't block the API worker.
- Dark mode toggle is a UI stub (Tailwind `dark:` classes aren't wired to all components yet).
- Add rate limiting and refresh tokens for production-grade auth.

---

## 👨‍💻 Author

**Bhavesh Bargat**  
GitHub: [@Bhaveshbargat1](https://github.com/Bhaveshbargat1)
