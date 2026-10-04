import json
import os
import joblib
import numpy as np
import pandas as pd

MODEL_DIR = os.getenv("MODEL_DIR", "/app/models")

_model = joblib.load(f"{MODEL_DIR}/xgb_model.joblib")
_scaler = joblib.load(f"{MODEL_DIR}/scaler.joblib")
_encoders = joblib.load(f"{MODEL_DIR}/encoders.joblib")
_explainer = joblib.load(f"{MODEL_DIR}/shap_explainer.joblib")

with open(f"{MODEL_DIR}/feature_columns.json") as f:
    FEATURE_COLUMNS = json.load(f)

CATEGORICAL_COLS = ["branch", "gender", "preferred_role"]


def _prepare_row(input_dict: dict) -> pd.DataFrame:
    row = {col: input_dict[col] for col in FEATURE_COLUMNS}
    df = pd.DataFrame([row])

    for col in CATEGORICAL_COLS:
        le = _encoders[col]
        # handle unseen categories gracefully by mapping to the first known class
        val = df[col].iloc[0]
        if val not in le.classes_:
            val = le.classes_[0]
        df[col] = le.transform([val])

    scaled = _scaler.transform(df[FEATURE_COLUMNS])
    return pd.DataFrame(scaled, columns=FEATURE_COLUMNS)


def predict_with_explanation(input_dict: dict) -> dict:
    X = _prepare_row(input_dict)

    proba = float(_model.predict_proba(X)[0][1])
    label = int(proba >= 0.5)
    confidence = float(max(proba, 1 - proba))

    shap_values = _explainer.shap_values(X)[0]
    contributions = list(zip(FEATURE_COLUMNS, shap_values.tolist()))
    contributions.sort(key=lambda x: x[1], reverse=True)

    top_positive = [
        {"feature": f, "impact": round(v, 4)} for f, v in contributions if v > 0
    ][:5]
    top_negative = [
        {"feature": f, "impact": round(v, 4)} for f, v in contributions if v < 0
    ][-5:]
    top_negative.sort(key=lambda x: x["impact"])

    return {
        "placement_probability": round(proba, 4),
        "predicted_label": label,
        "confidence": round(confidence, 4),
        "top_positive_factors": top_positive,
        "top_negative_factors": top_negative,
    }
