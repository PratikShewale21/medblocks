from fastapi import FastAPI
from pydantic import BaseModel

from predictors.diabetes_predictor import predict_diabetes
from predictors.adherence_predictor import predict_adherence
from predictors.summary_pipeline import generate_summary

app = FastAPI(title="MedBlocks ML Backend")


# =======================
# DATA SCHEMAS
# =======================

class DiabetesInput(BaseModel):
    pregnancies: int
    glucose: float
    bp: float
    skin: float
    insulin: float
    bmi: float
    dpf: float
    age: int


class AdherenceInput(BaseModel):
    missed_doses_last_7_days: int
    avg_delay_minutes: int
    adherence_rate_30_days: float


class SummaryInput(BaseModel):
    text: str
    classification: str


# =======================
# ROUTES
# =======================

@app.post("/predict/diabetes")
def diabetes_prediction(data: DiabetesInput):
    """
    Predicts diabetes risk with percentage and risk level
    """
    return predict_diabetes(data)


@app.post("/predict/adherence")
def adherence_prediction(data: AdherenceInput):
    """
    Predicts missed-dose risk and adherence level
    """
    features = [
        data.missed_doses_last_7_days,
        data.avg_delay_minutes,
        data.adherence_rate_30_days
    ]
    return predict_adherence(features)


@app.post("/summary")
def summary_generation(data: SummaryInput):
    """
    Generates readable medical report summary
    """
    summary = generate_summary(
        text=data.text,
        classification=data.classification
    )
    return {"summary": summary}
