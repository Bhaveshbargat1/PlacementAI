"""
Full ML training pipeline for PlacementAI.
Cleans data, encodes/scales features, compares 5 models, tunes the best one,
computes SHAP explainability artifacts, and saves the production model bundle.
"""
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, roc_curve,
)
from xgboost import XGBClassifier
import shap
import os

DATA_PATH = os.getenv("DATASET_PATH", "/app/dataset/students.csv")
MODEL_DIR = os.getenv("MODEL_DIR", "/app/models")

CATEGORICAL_COLS = ["branch", "gender", "preferred_role"]
TARGET = "placement_status"


def load_and_clean():
    df = pd.read_csv(DATA_PATH)
    df = df.drop_duplicates()
    # Missing value handling (median for numeric, mode for categorical)
    for col in df.columns:
        if df[col].isnull().sum() > 0:
            if df[col].dtype == "object":
                df[col] = df[col].fillna(df[col].mode()[0])
            else:
                df[col] = df[col].fillna(df[col].median())
    return df


def encode_and_scale(df):
    encoders = {}
    for col in CATEGORICAL_COLS:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        encoders[col] = le

    feature_cols = [c for c in df.columns if c != TARGET]
    X = df[feature_cols]
    y = df[TARGET]

    scaler = StandardScaler()
    X_scaled = pd.DataFrame(scaler.fit_transform(X), columns=feature_cols)

    return X_scaled, y, encoders, scaler, feature_cols


def compare_models(X_train, y_train, X_test, y_test):
    candidates = {
        "logistic_regression": LogisticRegression(max_iter=1000),
        "decision_tree": DecisionTreeClassifier(random_state=42),
        "random_forest": RandomForestClassifier(n_estimators=200, random_state=42),
        "gradient_boosting": GradientBoostingClassifier(random_state=42),
        "xgboost": XGBClassifier(
            n_estimators=300, max_depth=5, learning_rate=0.05,
            use_label_encoder=False, eval_metric="logloss", random_state=42
        ),
    }

    results = {}
    for name, model in candidates.items():
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        proba = model.predict_proba(X_test)[:, 1]
        cv_score = cross_val_score(model, X_train, y_train, cv=5, scoring="roc_auc").mean()
        results[name] = {
            "model": model,
            "accuracy": accuracy_score(y_test, preds),
            "precision": precision_score(y_test, preds),
            "recall": recall_score(y_test, preds),
            "f1": f1_score(y_test, preds),
            "roc_auc": roc_auc_score(y_test, proba),
            "cv_roc_auc": cv_score,
        }
        print(f"{name:20s} | acc={results[name]['accuracy']:.3f} "
              f"f1={results[name]['f1']:.3f} roc_auc={results[name]['roc_auc']:.3f} "
              f"cv_roc_auc={cv_score:.3f}")

    return results


def tune_xgboost(X_train, y_train):
    param_grid = {
        "n_estimators": [200, 300],
        "max_depth": [4, 5, 6],
        "learning_rate": [0.03, 0.05, 0.1],
    }
    base = XGBClassifier(use_label_encoder=False, eval_metric="logloss", random_state=42)
    search = GridSearchCV(base, param_grid, cv=3, scoring="roc_auc", n_jobs=-1)
    search.fit(X_train, y_train)
    print("Best XGBoost params:", search.best_params_)
    return search.best_estimator_


def main():
    df = load_and_clean()
    X, y, encoders, scaler, feature_cols = encode_and_scale(df)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    results = compare_models(X_train, y_train, X_test, y_test)

    best_name = max(results, key=lambda k: results[k]["roc_auc"])
    print(f"\nBest baseline model: {best_name}")

    # Fine-tune XGBoost regardless (production model), since it's the target algorithm
    tuned_model = tune_xgboost(X_train, y_train)
    preds = tuned_model.predict(X_test)
    proba = tuned_model.predict_proba(X_test)[:, 1]

    metrics = {
        "accuracy": accuracy_score(y_test, preds),
        "precision": precision_score(y_test, preds),
        "recall": recall_score(y_test, preds),
        "f1": f1_score(y_test, preds),
        "roc_auc": roc_auc_score(y_test, proba),
        "confusion_matrix": confusion_matrix(y_test, preds).tolist(),
    }
    fpr, tpr, _ = roc_curve(y_test, proba)
    roc_data = {"fpr": fpr.tolist(), "tpr": tpr.tolist()}

    print("\nFinal tuned XGBoost metrics:", json.dumps(metrics, indent=2))

    # Feature importance
    importance = dict(zip(feature_cols, tuned_model.feature_importances_.tolist()))
    importance = dict(sorted(importance.items(), key=lambda x: -x[1]))

    # SHAP explainability
    explainer = shap.TreeExplainer(tuned_model)
    shap_values = explainer.shap_values(X_test.iloc[:200])  # sample for speed
    mean_abs_shap = dict(zip(feature_cols, np.abs(shap_values).mean(axis=0).tolist()))

    # Save everything needed for inference + explanation
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(tuned_model, f"{MODEL_DIR}/xgb_model.joblib")
    joblib.dump(scaler, f"{MODEL_DIR}/scaler.joblib")
    joblib.dump(encoders, f"{MODEL_DIR}/encoders.joblib")
    joblib.dump(explainer, f"{MODEL_DIR}/shap_explainer.joblib")

    with open(f"{MODEL_DIR}/feature_columns.json", "w") as f:
        json.dump(feature_cols, f)
    with open(f"{MODEL_DIR}/metrics.json", "w") as f:
        json.dump({
            "metrics": metrics,
            "roc_curve": roc_data,
            "feature_importance": importance,
            "mean_abs_shap": mean_abs_shap,
            "model_comparison": {
                k: {mk: mv for mk, mv in v.items() if mk != "model"}
                for k, v in results.items()
            },
        }, f, indent=2)

    print(f"\nSaved model bundle to {MODEL_DIR}/")


if __name__ == "__main__":
    main()
