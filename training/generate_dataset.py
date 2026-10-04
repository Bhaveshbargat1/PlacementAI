"""Generate a realistic synthetic student placement dataset (10,000 rows)."""
import os
import numpy as np
import pandas as pd

DATASET_OUT = os.getenv("DATASET_PATH", "/app/dataset/students.csv")

np.random.seed(42)
N = 10000

branches = ["CSE", "IT", "AI-DS", "ECE", "Mechanical", "Civil", "EEE"]
roles = ["SDE", "Data Analyst", "ML Engineer", "Backend Dev", "Frontend Dev", "Core Engineer"]

df = pd.DataFrame({
    "cgpa": np.round(np.random.normal(7.5, 1.0, N).clip(4.0, 10.0), 2),
    "tenth_pct": np.round(np.random.normal(82, 8, N).clip(45, 100), 2),
    "twelfth_pct": np.round(np.random.normal(78, 9, N).clip(40, 100), 2),
    "semester": np.random.randint(5, 9, N),
    "backlogs": np.random.choice([0, 0, 0, 1, 2, 3], N),
    "programming_skill": np.random.randint(1, 11, N),
    "dsa_rating": np.random.randint(0, 2200, N),
    "communication_skill": np.random.randint(1, 11, N),
    "aptitude_score": np.random.randint(20, 100, N),
    "technical_test_score": np.random.randint(20, 100, N),
    "projects_completed": np.random.poisson(2.2, N).clip(0, 10),
    "internships": np.random.poisson(0.6, N).clip(0, 4),
    "hackathons": np.random.poisson(0.8, N).clip(0, 6),
    "certifications": np.random.poisson(1.5, N).clip(0, 8),
    "attendance_pct": np.round(np.random.normal(85, 10, N).clip(40, 100), 2),
    "branch": np.random.choice(branches, N),
    "gender": np.random.choice(["Male", "Female", "Other"], N, p=[0.6, 0.38, 0.02]),
    "preferred_role": np.random.choice(roles, N),
    "expected_salary_lpa": np.round(np.random.normal(6, 2.5, N).clip(2, 25), 1),
    "soft_skills_score": np.random.randint(1, 11, N),
    "linkedin_active": np.random.choice([0, 1], N, p=[0.4, 0.6]),
    "github_activity_score": np.random.randint(0, 100, N),
    "resume_score": np.random.randint(30, 100, N),
})

# Latent score drives placement probability (adds realistic signal)
score = (
    df.cgpa * 8
    + df.dsa_rating * 0.02
    + df.programming_skill * 3
    + df.communication_skill * 2.5
    + df.technical_test_score * 0.4
    + df.aptitude_score * 0.3
    + df.projects_completed * 4
    + df.internships * 6
    + df.hackathons * 2
    + df.certifications * 1.5
    + df.resume_score * 0.3
    + df.github_activity_score * 0.15
    + df.soft_skills_score * 2
    - df.backlogs * 12
    - (100 - df.attendance_pct) * 0.5
)
score = (score - score.mean()) / score.std()
prob = 1 / (1 + np.exp(-score))
df["placement_status"] = (prob > np.random.uniform(0.35, 0.65, N)).astype(int)

os.makedirs(os.path.dirname(DATASET_OUT), exist_ok=True)
df.to_csv(DATASET_OUT, index=False)
print("Dataset generated:", df.shape)
print(df["placement_status"].value_counts(normalize=True))
