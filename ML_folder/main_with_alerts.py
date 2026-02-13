from fastapi import FastAPI, File, UploadFile, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import tempfile
import os

from predictors.diabetes_predictor import predict_diabetes
from predictors.adherence_predictor import predict_adherence
from predictors.summary_pipeline import generate_summary
from extractors.pdf_extractor import PDFExtractor
from extractors.medical_parser import MedicalDataParser
from services.alert_service import alert_service, Alert
from services.notification_service import notification_service

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


class PDFProcessingResponse(BaseModel):
    success: bool
    extracted_data: Dict[str, Any]
    prediction: Dict[str, Any]
    confidence: float
    warnings: list
    message: str


class AlertResponse(BaseModel):
    id: str
    type: str
    priority: str
    title: str
    message: str
    patient_id: str
    timestamp: str
    action_required: bool
    acknowledged: bool


class NotificationConfig(BaseModel):
    channels: List[str] = ['email']
    email: Optional[str] = None
    phone: Optional[str] = None
    device_token: Optional[str] = None


# =======================
# ALERT SYSTEM ENDPOINTS
# =======================

@app.post("/alerts/check-diabetes", response_model=List[AlertResponse])
async def check_diabetes_alerts(patient_id: str, risk_percentage: float, confidence: float):
    """
    Check for diabetes-related alerts based on prediction results
    """
    try:
        alerts = alert_service.check_diabetes_risk(patient_id, risk_percentage, confidence)
        
        # Store alerts
        for alert in alerts:
            alert_service.add_alert(alert)
        
        # Convert to response format
        return [
            AlertResponse(
                id=alert.id,
                type=alert.type.value,
                priority=alert.priority.value,
                title=alert.title,
                message=alert.message,
                patient_id=alert.patient_id,
                timestamp=alert.timestamp.isoformat(),
                action_required=alert.action_required,
                acknowledged=alert.acknowledged
            )
            for alert in alerts
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking diabetes alerts: {str(e)}")


@app.post("/alerts/check-adherence", response_model=List[AlertResponse])
async def check_adherence_alerts(patient_id: str, adherence_data: Dict[str, Any]):
    """
    Check for adherence-related alerts based on medication data
    """
    try:
        alerts = alert_service.check_adherence(patient_id, adherence_data)
        
        # Store alerts
        for alert in alerts:
            alert_service.add_alert(alert)
        
        # Convert to response format
        return [
            AlertResponse(
                id=alert.id,
                type=alert.type.value,
                priority=alert.priority.value,
                title=alert.title,
                message=alert.message,
                patient_id=alert.patient_id,
                timestamp=alert.timestamp.isoformat(),
                action_required=alert.action_required,
                acknowledged=alert.acknowledged
            )
            for alert in alerts
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking adherence alerts: {str(e)}")


@app.get("/alerts/{patient_id}", response_model=List[AlertResponse])
async def get_patient_alerts(patient_id: str, unacknowledged_only: bool = True):
    """
    Get alerts for a specific patient
    """
    try:
        alerts = alert_service.get_active_alerts(patient_id)
        
        if unacknowledged_only:
            alerts = [a for a in alerts if not a.acknowledged]
        
        return [
            AlertResponse(
                id=alert.id,
                type=alert.type.value,
                priority=alert.priority.value,
                title=alert.title,
                message=alert.message,
                patient_id=alert.patient_id,
                timestamp=alert.timestamp.isoformat(),
                action_required=alert.action_required,
                acknowledged=alert.acknowledged
            )
            for alert in alerts
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching alerts: {str(e)}")


@app.post("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str):
    """
    Acknowledge an alert (mark as read/seen)
    """
    try:
        success = alert_service.acknowledge_alert(alert_id)
        if success:
            return {"message": "Alert acknowledged successfully", "alert_id": alert_id}
        else:
            raise HTTPException(status_code=404, detail="Alert not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error acknowledging alert: {str(e)}")


@app.post("/notifications/send")
async def send_notification(alert_data: Dict[str, Any], config: NotificationConfig):
    """
    Send notification through configured channels
    """
    try:
        success = notification_service.send_notification(config.dict(), alert_data)
        
        if success:
            return {"message": "Notification sent successfully", "channels": config.channels}
        else:
            raise HTTPException(status_code=500, detail="Failed to send notification")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending notification: {str(e)}")


@app.post("/alerts/weekly-report")
async def generate_weekly_report(patient_id: str, health_data: Dict[str, Any]):
    """
    Generate and send weekly health report
    """
    try:
        # Create weekly report alert
        weekly_alert = alert_service.create_weekly_report(patient_id, health_data)
        alert_service.add_alert(weekly_alert)
        
        return {
            "message": "Weekly report generated",
            "alert_id": weekly_alert.id,
            "report_data": health_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating weekly report: {str(e)}")


@app.post("/alerts/achievement")
async def create_achievement_alert(patient_id: str, achievement: str):
    """
    Create achievement alert for patient milestones
    """
    try:
        achievement_alert = alert_service.create_achievement_alert(patient_id, achievement)
        alert_service.add_alert(achievement_alert)
        
        return {
            "message": "Achievement alert created",
            "alert_id": achievement_alert.id,
            "achievement": achievement
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating achievement alert: {str(e)}")


# Include all original endpoints for diabetes/adherence prediction
# (Copy all the original endpoints from main.py here)
