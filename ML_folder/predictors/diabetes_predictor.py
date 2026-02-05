import numpy as np
import joblib

model = joblib.load("models/diabetes_model.pkl")
scaler = joblib.load("models/diabetes_scaler.pkl")

def predict_diabetes(data):
    input_array = np.array([[
        data.pregnancies,
        data.glucose,
        data.bp,
        data.skin,
        data.insulin,
        data.bmi,
        data.dpf,
        data.age
    ]])

    scaled = scaler.transform(input_array)

    prediction = model.predict(scaled)[0]
    probability = model.predict_proba(scaled)[0][1] * 100

    if probability < 30:
        risk = "LOW"
    elif probability < 70:
        risk = "MODERATE"
    else:
        risk = "HIGH"

    return {
        "prediction": int(prediction),
        "risk_percentage": round(probability, 2),
        "risk_level": risk
    }
