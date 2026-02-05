import joblib
import numpy as np

# Load trained model and scaler
model = joblib.load("models/adherence_model.pkl")
scaler = joblib.load("models/adherence_scaler.pkl")

def predict_adherence(data):
    """
    data: object with attributes
    """

    # Arrange input in SAME ORDER as training
    input_data = np.array([
        data.missed_doses_last_7_days,
        data.avg_delay_minutes,
        data.adherence_rate_30_days
    ]).reshape(1, -1)

    # Scale input
    scaled_data = scaler.transform(input_data)

    # Prediction
    prediction = int(model.predict(scaled_data)[0])
    risk_percentage = model.predict_proba(scaled_data)[0][1] * 100

    # Risk level logic
    if risk_percentage < 30:
        risk_level = "LOW"
    elif risk_percentage < 70:
        risk_level = "MODERATE"
    else:
        risk_level = "HIGH"

    return {
        "will_miss_next_dose": bool(prediction),
        "risk_percentage": round(risk_percentage, 2),
        "risk_level": risk_level
    }
