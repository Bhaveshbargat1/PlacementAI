from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr


class StudentRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    branch: str
    semester: int


class StudentLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PredictionInput(BaseModel):
    cgpa: float
    tenth_pct: float
    twelfth_pct: float
    semester: int
    backlogs: int
    programming_skill: int
    dsa_rating: int
    communication_skill: int
    aptitude_score: int
    technical_test_score: int
    projects_completed: int
    internships: int
    hackathons: int
    certifications: int
    attendance_pct: float
    branch: str
    gender: str
    preferred_role: str
    expected_salary_lpa: float
    soft_skills_score: int
    linkedin_active: int
    github_activity_score: int
    resume_score: int


class FactorItem(BaseModel):
    feature: str
    impact: float


class PredictionResponse(BaseModel):
    placement_probability: float
    predicted_label: int
    confidence: float
    top_positive_factors: List[FactorItem]
    top_negative_factors: List[FactorItem]
    recommendations: List[str]


class AnalyticsResponse(BaseModel):
    total_students: int
    predicted_placed: int
    predicted_not_placed: int
    average_cgpa: float
    average_resume_score: float
    branch_wise_placement_rate: Dict[str, float]
    model_metrics: Dict[str, Any]
