import json
import os
import pandas as pd
from sqlalchemy.orm import Session
import models

DATASET_PATH = os.getenv("DATASET_PATH", "/app/dataset/students.csv")
METRICS_PATH = os.getenv("METRICS_PATH", "/app/models/metrics.json")


def get_analytics(db: Session) -> dict:
    df = pd.read_csv(DATASET_PATH)

    branch_rate = (
        df.groupby("branch")["placement_status"].mean().round(4) * 100
    ).to_dict()

    with open(METRICS_PATH) as f:
        model_metrics = json.load(f)["metrics"]

    total_predictions = db.query(models.Prediction).count()
    placed_predictions = db.query(models.Prediction).filter(
        models.Prediction.predicted_label == 1
    ).count()

    return {
        "total_students": int(len(df)),
        "predicted_placed": int(placed_predictions) if total_predictions else int(df["placement_status"].sum()),
        "predicted_not_placed": int(total_predictions - placed_predictions) if total_predictions
            else int(len(df) - df["placement_status"].sum()),
        "average_cgpa": round(float(df["cgpa"].mean()), 2),
        "average_resume_score": round(float(df["resume_score"].mean()), 2),
        "branch_wise_placement_rate": {k: round(v, 2) for k, v in branch_rate.items()},
        "model_metrics": model_metrics,
    }
