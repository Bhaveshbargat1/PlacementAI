from datetime import timedelta

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

import models
import schemas
import predict
import analytics
from database import engine, get_db
from auth import (
    hash_password, verify_password, create_access_token, get_current_student,
)
from recommendation import generate_recommendations
from utils import get_logger

logger = get_logger("placementai")

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PlacementAI API",
    description="Intelligent Placement Prediction System using Student Academic Data",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "service": "PlacementAI API"}


@app.post("/register", response_model=schemas.Token)
def register(payload: schemas.StudentRegister, db: Session = Depends(get_db)):
    existing = db.query(models.Student).filter(models.Student.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    student = models.Student(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        branch=payload.branch,
        semester=payload.semester,
    )
    db.add(student)
    db.commit()
    db.refresh(student)

    token = create_access_token({"sub": student.email}, timedelta(hours=24))
    logger.info(f"New student registered: {student.email}")
    return {"access_token": token}


@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.email == form_data.username).first()
    if not student or not verify_password(form_data.password, student.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token({"sub": student.email}, timedelta(hours=24))
    return {"access_token": token}


@app.post("/predict", response_model=schemas.PredictionResponse)
def predict_placement(
    payload: schemas.PredictionInput,
    db: Session = Depends(get_db),
    current_student: models.Student = Depends(get_current_student),
):
    input_dict = payload.dict()
    result = predict.predict_with_explanation(input_dict)
    recs = generate_recommendations(input_dict)

    record = models.Prediction(
        student_id=current_student.id,
        input_features=input_dict,
        placement_probability=result["placement_probability"],
        predicted_label=result["predicted_label"],
        confidence=result["confidence"],
        top_positive_factors=result["top_positive_factors"],
        top_negative_factors=result["top_negative_factors"],
        recommendations=recs,
    )
    db.add(record)
    db.commit()

    return {**result, "recommendations": recs}


@app.get("/history")
def get_history(
    db: Session = Depends(get_db),
    current_student: models.Student = Depends(get_current_student),
):
    records = (
        db.query(models.Prediction)
        .filter(models.Prediction.student_id == current_student.id)
        .order_by(models.Prediction.created_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "placement_probability": r.placement_probability,
            "predicted_label": r.predicted_label,
            "confidence": r.confidence,
            "recommendations": r.recommendations,
            "created_at": r.created_at.isoformat(),
        }
        for r in records
    ]


@app.get("/recommendations")
def get_recommendations(
    db: Session = Depends(get_db),
    current_student: models.Student = Depends(get_current_student),
):
    latest = (
        db.query(models.Prediction)
        .filter(models.Prediction.student_id == current_student.id)
        .order_by(models.Prediction.created_at.desc())
        .first()
    )
    if not latest:
        raise HTTPException(status_code=404, detail="No predictions yet for this student")
    return {"recommendations": latest.recommendations}


@app.get("/analytics", response_model=schemas.AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db)):
    return analytics.get_analytics(db)


@app.post("/train")
def retrain_model():
    """Triggers offline retraining. In production this should be an async job/queue."""
    import subprocess
    import os as _os

    script_path = _os.getenv("TRAIN_SCRIPT_PATH", "/app/training/train_model.py")
    result = subprocess.run(
        ["python3", script_path],
        capture_output=True, text=True,
        env={**_os.environ},
    )
    if result.returncode != 0:
        raise HTTPException(status_code=500, detail=result.stderr[-2000:])
    return {"status": "retrained", "log_tail": result.stdout[-2000:]}
