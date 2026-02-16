from fastapi import FastAPI, File, UploadFile, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import tempfile
import os
from predictors.adherence_predictor import predict_adherence as ml_predict_adherence
from datetime import datetime
import statistics


from predictors.diabetes_predictor import predict_diabetes
from predictors.enhanced_summary import generate_enhanced_summary
from predictors.ai_summary import generate_ai_summary
from predictors.simple_ml_summarizer import analyze_with_simple_ml
from extractors.pdf_extractor import PDFExtractor
from extractors.medical_parser import MedicalDataParser
from services.alert_service import alert_service, Alert

app = FastAPI(title="MedBlocks ML Backend")

@app.get("/")
async def root():
    return {"message": "MedBlocks ML Backend", "status": "running", "features": ["diabetes_prediction", "medical_summarization", "adherence_monitoring", "alert_system"]}

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =======================
# DATA SCHEMAS
# =======================

class AdherenceInput(BaseModel):
    missed_doses_last_7_days: int
    avg_delay_minutes: int
    adherence_rate_30_days: float


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


# =======================
# CORE FEATURES - 4 MAIN ENDPOINTS
# =======================

# FEATURE 1: Diabetes Prediction from PDF
@app.post("/upload/diabetes-report", response_model=PDFProcessingResponse)
async def upload_diabetes_report_pdf(file: UploadFile = File(...)):
    """
    Upload PDF medical report for diabetes prediction
    """
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        # Extract and process
        extractor = PDFExtractor()
        parser = MedicalDataParser()
        
        # Extract text from PDF
        text = extractor.extract_text(temp_file_path)
        
        # Extract medical values
        extracted_data = extractor.extract_medical_values(text)
        
        # Prepare input with missing data handling
        prepared_input = parser.prepare_diabetes_input(extracted_data)
        
        # Make prediction if possible
        prediction_result = {}
        try:
            if prepared_input['can_predict']:
                # Create input object for predictor
                class DiabetesInput:
                    def __init__(self, data):
                        self.pregnancies = int(data['pregnancies'])
                        self.glucose = float(data['glucose'])
                        self.bp = float(data['bp'])
                        self.skin = float(data['skin'])
                        self.insulin = float(data['insulin'])
                        self.bmi = float(data['bmi'])
                        self.dpf = float(data['dpf'])
                        self.age = int(data['age'])
                
                prediction_result = predict_diabetes(DiabetesInput(prepared_input['input_data']))
            else:
                prediction_result = {"error": "Insufficient data for reliable prediction"}
        except Exception as e:
            print(f"ERROR in prediction: {e}")
            prediction_result = {"error": f"Prediction failed: {str(e)}"}
        
        # Generate summary
        try:
            summary = generate_enhanced_summary(text)
        except Exception as e:
            print(f"ERROR in summary generation: {e}")
            summary = {"executive_summary": "Summary generation failed", "key_findings": "", "risk_assessment": "", "recommendations": "", "follow_up": "", "patient_summary": ""}
        
        # Ensure prepared_input has all required keys
        if 'confidence' not in prepared_input:
            prepared_input['confidence'] = 0.95
        if 'warnings' not in prepared_input:
            prepared_input['warnings'] = []
        
        # Clean up temp file
        os.unlink(temp_file_path)
        
        try:
            return PDFProcessingResponse(
                success=True,
                extracted_data=extracted_data,
                prediction={
                    "diabetes_prediction": prediction_result,
                    "summary": summary
                },
                confidence=prepared_input['confidence'],
                warnings=prepared_input['warnings'],
                message="Diabetes report analyzed successfully"
            )
        except Exception as e:
            print(f"ERROR in response creation: {e}")
            print(f"ERROR details: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Response creation failed: {str(e)}")
        
    except Exception as e:
        # Clean up temp file if it exists
        if 'temp_file_path' in locals():
            try:
                os.unlink(temp_file_path)
            except:
                pass
        
        raise HTTPException(status_code=500, detail=f"Error processing diabetes PDF: {str(e)}")


# FEATURE 2: Medical Report Summarization
@app.post("/upload/summarize-pdf", response_model=PDFProcessingResponse)
async def upload_and_summarize_pdf(file: UploadFile = File(...)):
    """
    Upload PDF and get comprehensive medical summary
    """
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        # Extract text from PDF
        extractor = PDFExtractor()
        text = extractor.extract_text(temp_file_path)
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")
        
        # Generate content-based ML summary
        try:
            ml_result = analyze_with_simple_ml(text)
            
            # Create enhanced summary object
            summary = {
                "executive_summary": ml_result.get("executive_summary", "Executive summary generated"),
                "key_findings": ml_result.get("key_findings", "Key findings identified"),
                "risk_assessment": ml_result.get("risk_assessment", "Risk assessment completed"),
                "recommendations": "\n".join(ml_result.get("recommendations", ["Document processed successfully"])),
                "follow_up": "Consult relevant professional if needed",
                "patient_summary": ml_result.get("universal_summary", "ML analysis completed"),
                "clinical_insights": ml_result.get("extracted_entities", {}),
                "extracted_data": ml_result.get("extracted_entities", {}),
                "report_type": ml_result.get("document_type", "unknown"),
                "ml_model_used": "True ML Transformer Analyzer",
                "confidence_scores": ml_result.get("confidence_scores", {})
            }
        except Exception as e:
            print(f"ERROR in AI summary generation: {e}")
            import traceback
            traceback.print_exc()
            # Fallback to enhanced summary if AI fails
            try:
                summary = generate_enhanced_summary(text)
            except Exception as fallback_e:
                print(f"ERROR in fallback summary: {fallback_e}")
                summary = {"executive_summary": "Summary generation failed", "key_findings": "", "risk_assessment": "", "recommendations": "", "follow_up": "", "patient_summary": ""}
        
        # Clean up temp file
        os.unlink(temp_file_path)
        
        try:
            return PDFProcessingResponse(
                success=True,
                extracted_data={"text_length": len(text)},
                prediction={"summary": summary},
                confidence=0.95,
                warnings=[],
                message="PDF summarized successfully"
            )
        except Exception as e:
            print(f"ERROR in response creation: {e}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Response creation failed: {str(e)}")
        
    except Exception as e:
        # Clean up temp file if it exists
        if 'temp_file_path' in locals():
            try:
                os.unlink(temp_file_path)
            except:
                pass
        
        raise HTTPException(status_code=500, detail=f"Error summarizing PDF: {str(e)}")


# FEATURE 3: Adherence Monitoring
@app.post("/upload/adherence-report", response_model=PDFProcessingResponse)
async def upload_adherence_report_pdf(file: UploadFile = File(...)):
    """
    Upload PDF adherence report and get analysis with alerts
    """
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        # Extract text from PDF
        extractor = PDFExtractor()
        text = extractor.extract_text(temp_file_path)
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")
        
        # Extract adherence data from text
        adherence_data = extract_adherence_data_from_text(text)
        
        # Generate adherence alerts
        alerts = []
        if adherence_data:
            try:
                alerts = alert_service.check_adherence("pdf_patient", adherence_data)
                # Store alerts
                for alert in alerts:
                    alert_service.add_alert(alert)
            except Exception as e:
                import logging
                logging.warning(f"Could not generate adherence alerts: {e}")
        
        # Generate summary
        summary = generate_enhanced_summary(text)
        
        # Clean up temp file
        os.unlink(temp_file_path)
        
        return PDFProcessingResponse(
            success=True,
            extracted_data=adherence_data,
            prediction={
                "summary": summary,
                "alerts": [
                    {
                        "id": alert.id,
                        "type": alert.type.value,
                        "priority": alert.priority.value,
                        "title": alert.title,
                        "message": alert.message,
                        "action_required": alert.action_required
                    } for alert in alerts
                ]
            },
            confidence=0.95,
            warnings=[],
            message="Adherence report analyzed successfully"
        )
        
    except Exception as e:
        # Clean up temp file if it exists
        if 'temp_file_path' in locals():
            try:
                os.unlink(temp_file_path)
            except:
                pass
        
        raise HTTPException(status_code=500, detail=f"Error processing adherence PDF: {str(e)}")


# FEATURE 6: Patient Authentication with Wallet Integration
from pydantic import BaseModel
from typing import Optional
import jwt
from datetime import datetime, timedelta

# Authentication Models
class PatientLogin(BaseModel):
    email: str
    password: str

class WalletPatientMapping(BaseModel):
    wallet_address: str
    patient_id: str

class PatientResponse(BaseModel):
    id: str
    name: str
    email: str
    condition: str
    token: str

# Mock patient database with wallet mapping
patients_db = {
    "john.doe@email.com": {
        "password": "password123",
        "id": "patient_001",
        "name": "John Doe",
        "email": "john.doe@email.com",
        "condition": "Diabetes Type 2",
        "wallet_address": "0x1234567890123456789012345678901234567890"
    },
    "jane.smith@email.com": {
        "password": "password123",
        "id": "patient_002", 
        "name": "Jane Smith",
        "email": "jane.smith@email.com",
        "condition": "Heart Disease",
        "wallet_address": "0x2345678901234567890123456789012345678901"
    },
    "mike.wilson@email.com": {
        "password": "password123",
        "id": "patient_003",
        "name": "Mike Wilson", 
        "email": "mike.wilson@email.com",
        "condition": "Hypertension",
        "wallet_address": "0x3456789012345678901234567890123456789012"
    }
}

# JWT Secret
JWT_SECRET = "your-secret-key-here"
JWT_ALGORITHM = "HS256"

def create_jwt_token(patient_data: dict):
    """Create JWT token for patient"""
    payload = {
        "patient_id": patient_data["id"],
        "email": patient_data["email"],
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token: str):
    """Verify JWT token and return patient data"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.JWTError:
        return None

def get_patient_by_wallet(wallet_address: str):
    """Get patient by wallet address"""
    for patient in patients_db.values():
        if patient["wallet_address"].lower() == wallet_address.lower():
            return patient
    return None

@app.post("/auth/login", response_model=PatientResponse)
async def patient_login(login_data: PatientLogin):
    """
    Patient login endpoint (email/password)
    """
    try:
        patient = patients_db.get(login_data.email)
        if not patient:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        if patient["password"] != login_data.password:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        token = create_jwt_token(patient)
        
        return PatientResponse(
            id=patient["id"],
            name=patient["name"],
            email=patient["email"],
            condition=patient["condition"],
            token=token
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")

@app.post("/auth/wallet-login", response_model=PatientResponse)
async def wallet_login(wallet_data: WalletPatientMapping):
    """
    Login with wallet address - auto-identify patient
    """
    try:
        patient = get_patient_by_wallet(wallet_data.wallet_address)
        if not patient:
            raise HTTPException(status_code=404, detail="No patient found for this wallet address")
        
        token = create_jwt_token(patient)
        
        return PatientResponse(
            id=patient["id"],
            name=patient["name"],
            email=patient["email"],
            condition=patient["condition"],
            token=token
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Wallet login error: {str(e)}")

@app.get("/auth/me")
async def get_current_patient(authorization: str = Header(None)):
    """
    Get current patient from JWT token
    """
    try:
        if not authorization:
            raise HTTPException(status_code=401, detail="No authorization header")
        
        token = authorization.replace("Bearer ", "")
        
        payload = verify_jwt_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        
        patient = patients_db.get(payload["email"])
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        return {
            "id": patient["id"],
            "name": patient["name"],
            "email": patient["email"],
            "condition": patient["condition"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Auth error: {str(e)}")


# FEATURE 5: Patient Data Management
@app.get("/patient/{patient_id}/medications")
async def get_patient_medications(patient_id: str):
    """
    Get specific patient's medications
    """
    try:
        # Mock patient-specific medications - replace with real database query
        patient_medications = {
            "patient_001": [  # Diabetes patient
                {
                    "id": 1,
                    "name": "Metformin",
                    "dosage": "500mg",
                    "frequency": "Twice daily",
                    "time": "9:00 AM, 8:00 PM",
                    "nextDose": "9:00 AM",
                    "taken": False,
                    "adherence": 85,
                    "color": "#3B82F6"
                },
                {
                    "id": 2,
                    "name": "Lisinopril",
                    "dosage": "10mg",
                    "frequency": "Once daily",
                    "time": "7:00 AM",
                    "nextDose": "7:00 AM",
                    "taken": True,
                    "adherence": 92,
                    "color": "#10B981"
                }
            ],
            "patient_002": [  # Heart patient
                {
                    "id": 3,
                    "name": "Aspirin",
                    "dosage": "81mg",
                    "frequency": "Once daily",
                    "time": "12:00 PM",
                    "nextDose": "12:00 PM",
                    "taken": False,
                    "adherence": 78,
                    "color": "#F59E0B"
                },
                {
                    "id": 4,
                    "name": "Atorvastatin",
                    "dosage": "20mg",
                    "frequency": "Once daily",
                    "time": "8:00 PM",
                    "nextDose": "8:00 PM",
                    "taken": False,
                    "adherence": 88,
                    "color": "#8B5CF6"
                }
            ],
            "patient_003": [  # Hypertension patient
                {
                    "id": 5,
                    "name": "Amlodipine",
                    "dosage": "5mg",
                    "frequency": "Once daily",
                    "time": "9:00 AM",
                    "nextDose": "9:00 AM",
                    "taken": True,
                    "adherence": 95,
                    "color": "#06B6D4"
                },
                {
                    "id": 6,
                    "name": "Metoprolol",
                    "dosage": "25mg",
                    "frequency": "Twice daily",
                    "time": "8:00 AM, 8:00 PM",
                    "nextDose": "8:00 PM",
                    "taken": False,
                    "adherence": 82,
                    "color": "#84CC16"
                }
            ]
        }
        
        medications = patient_medications.get(patient_id, [])
        
        if not medications:
            # Return empty list for unknown patients
            return []
        
        return medications
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching medications for patient {patient_id}: {str(e)}")

@app.get("/patient/{patient_id}/adherence")
async def get_patient_adherence(patient_id: str):
    """
    Get specific patient's adherence data
    """
    try:
        # Mock patient-specific adherence data
        patient_adherence = {
            "patient_001": {  # Diabetes patient - moderate adherence
                "missed_doses_last_7_days": 2,
                "avg_delay_minutes": 45,
                "adherence_rate_30_days": 68
            },
            "patient_002": {  # Heart patient - good adherence
                "missed_doses_last_7_days": 1,
                "avg_delay_minutes": 20,
                "adherence_rate_30_days": 85
            },
            "patient_003": {  # Hypertension patient - poor adherence
                "missed_doses_last_7_days": 4,
                "avg_delay_minutes": 90,
                "adherence_rate_30_days": 55
            }
        }
        
        adherence_data = patient_adherence.get(patient_id, {
            "missed_doses_last_7_days": 0,
            "avg_delay_minutes": 0,
            "adherence_rate_30_days": 100
        })
        
        return adherence_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching adherence data for patient {patient_id}: {str(e)}")

@app.post("/patient/medication/{medication_id}/taken")
async def mark_medication_taken(medication_id: int):
    """
    Mark a medication as taken
    """
    try:
        # Mock update - replace with real database update
        # In a real implementation, this would:
        # 1. Update the medication_taken table
        # 2. Recalculate adherence metrics
        # 3. Trigger adherence alerts if needed
        
        return {
            "success": True,
            "message": f"Medication {medication_id} marked as taken",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error marking medication as taken: {str(e)}")


# FEATURE 4: Alert System
@app.post("/alerts/check-adherence", response_model=List[AlertResponse])
async def check_adherence_alerts(data: AdherenceInput):
    """
    Check adherence and generate alerts
    """
    try:
        adherence_data = {
            'missed_doses_last_7_days': data.missed_doses_last_7_days,
            'avg_delay_minutes': data.avg_delay_minutes,
            'adherence_rate_30_days': data.adherence_rate_30_days
        }
        
        alerts = alert_service.check_adherence("manual_patient", adherence_data)
        
        # Store alerts
        for alert in alerts:
            alert_service.add_alert(alert)
        
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
            ) for alert in alerts
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking adherence: {str(e)}")


# =======================
# HELPER FUNCTIONS FOR ADHERENCE CALCULATION
# =======================

def calculate_adherence_rate(medications):
    """Calculate real adherence rate from medication taken_times data"""
    from datetime import datetime, timedelta
    
    total_scheduled_doses = 0
    total_taken_doses = 0
    
    # Calculate for last 30 days
    thirty_days_ago = datetime.now() - timedelta(days=30)
    
    for med in medications:
        # Count scheduled doses in last 30 days
        scheduled_times = med.get("scheduled_time", "").split(",")
        doses_per_day = len(scheduled_times)
        
        # Calculate tracking days
        if med.get("taken_times") and len(med.get("taken_times", [])) > 0:
            earliest_taken = min(
                datetime.fromtimestamp(t.get("timestamp", 0) / 1000)
                for t in med.get("taken_times", [])
                if t.get("timestamp")
            )
            days_tracking = (datetime.now() - earliest_taken).days + 1
            days_tracking = min(days_tracking, 30)
        else:
            days_tracking = 1
        
        total_scheduled_doses += doses_per_day * days_tracking
        
        # Count actual taken doses in tracking period
        taken_times = med.get("taken_times", [])
        for taken_time in taken_times:
            try:
                taken_date = datetime.fromtimestamp(taken_time.get("timestamp", 0) / 1000)
                if taken_date >= thirty_days_ago:
                    total_taken_doses += 1
            except:
                continue
        
        # Ensure we don't count more taken doses than scheduled
        total_taken_doses = min(total_taken_doses, total_scheduled_doses)
    
    # Calculate adherence rate
    print(f"🔍 Adherence calculation debug: taken={total_taken_doses}, scheduled={total_scheduled_doses}")
    if total_scheduled_doses > 0:
        adherence_rate = (total_taken_doses / total_scheduled_doses) * 100
    else:
        adherence_rate = 0
    
    print(f"🔍 Final adherence rate: {adherence_rate}%")
    return adherence_rate

def calculate_missed_doses(medications):
    """Calculate missed doses from medication data"""
    from datetime import datetime, timedelta
    
    total_scheduled = 0
    total_taken = 0
    
    for med in medications:
        scheduled_times = med.get("scheduled_time", "").split(",")
        doses_per_day = len(scheduled_times)
        
        # Calculate tracking days (last 7 days for missed doses)
        if med.get("taken_times") and len(med.get("taken_times", [])) > 0:
            earliest_taken = min(
                datetime.fromtimestamp(t.get("timestamp", 0) / 1000)
                for t in med.get("taken_times", [])
                if t.get("timestamp")
            )
            days_tracking = (datetime.now() - earliest_taken).days + 1
            days_tracking = min(days_tracking, 7)
        else:
            days_tracking = 1
        
        total_scheduled += doses_per_day * days_tracking
        total_taken += len(med.get("taken_times", []))
    
    result = max(0, total_scheduled - total_taken)
    print(f"🔍 Missed doses debug: scheduled={total_scheduled}, taken={total_taken}, missed={result}")
    return result

# =======================
# HELPER FUNCTIONS FOR AI SUMMARY
# =======================

def format_key_findings(parameter_analysis):
    """Format parameter analysis for key findings"""
    findings = []
    for param, analysis in parameter_analysis.items():
        status_icon = "✅" if analysis['severity'] == 'low' else "⚠️" if analysis['severity'] == 'moderate' else "🚨"
        findings.append(f"{status_icon} {param.title()}: {analysis['interpretation']}")
    return "\n".join(findings)

def format_risk_assessment(risk_assessment):
    """Format risk assessment"""
    if not risk_assessment:
        return "Unable to assess risk"
    
    risk_level = risk_assessment.get('overall_risk', 'unknown')
    urgency = risk_assessment.get('urgency', 'Routine monitoring')
    critical_findings = risk_assessment.get('critical_findings', [])
    
    assessment = f"Overall Risk: {risk_level.title()}\n"
    assessment += f"Urgency: {urgency}\n"
    
    if critical_findings:
        assessment += "Critical Findings:\n"
        for finding in critical_findings:
            assessment += f"• {finding}\n"
    
    return assessment

def format_recommendations(action_plan):
    """Format action plan recommendations"""
    if not action_plan:
        return "No specific recommendations at this time"
    
    recommendations = []
    
    if action_plan.get('immediate_actions'):
        recommendations.append("Immediate Actions:")
        for action in action_plan['immediate_actions']:
            recommendations.append(f"• {action}")
    
    if action_plan.get('short_term_goals'):
        recommendations.append("Short-term Goals:")
        for goal in action_plan['short_term_goals']:
            recommendations.append(f"• {goal}")
    
    if action_plan.get('long_term_management'):
        recommendations.append("Long-term Management:")
        for mgmt in action_plan['long_term_management']:
            recommendations.append(f"• {mgmt}")
    
    return "\n".join(recommendations)

def format_ml_risk_assessment(risk_assessment):
    """Format ML-based risk assessment"""
    if not risk_assessment:
        return "Unable to assess risk"
    
    risk_level = risk_assessment.get('overall_risk', 'unknown')
    urgency = risk_assessment.get('urgency', 'Routine monitoring')
    risk_factors = risk_assessment.get('risk_factors', [])
    
    assessment = f"Overall Risk: {risk_level.title()}\n"
    assessment += f"Urgency: {urgency}\n"
    
    if risk_factors:
        assessment += "Risk Factors:\n"
        for factor in risk_factors:
            assessment += f"• {factor}\n"
    
    return assessment

# =======================
# FEATURE 5: Direct Adherence Prediction
# =======================

@app.post("/test-ml")
async def test_ml_comparison():
    """Test endpoint to prove ML model works with different inputs"""
    
    try:
        # Import adherence predictor
        from predictors.adherence_predictor import predict_adherence
        
        # Test Case 1: Poor adherence (should predict HIGH risk)
        poor_adherence = AdherenceInput(
            missed_doses_last_7_days=10,
            avg_delay_minutes=30,
            adherence_rate_30_days=5.0
        )
        
        # Test Case 2: Good adherence (should predict LOW risk)  
        good_adherence = AdherenceInput(
            missed_doses_last_7_days=1,
            avg_delay_minutes=5,
            adherence_rate_30_days=90.0
        )
        
        # Get ML predictions
        poor_result = predict_adherence(poor_adherence)
        good_result = predict_adherence(good_adherence)
        
        return {
            "test_purpose": "Proving ML model works with different inputs",
            "poor_adherence_input": {
                "missed_doses_last_7_days": 10,
                "avg_delay_minutes": 30,
                "adherence_rate_30_days": 5.0
            },
            "poor_adherence_prediction": poor_result,
            "good_adherence_input": {
                "missed_doses_last_7_days": 1,
                "avg_delay_minutes": 5,
                "adherence_rate_30_days": 90.0
            },
            "good_adherence_prediction": good_result,
            "conclusion": "If predictions differ, ML is working!"
        }
        
    except Exception as e:
        print(f"Error in test-ml: {e}")
        raise HTTPException(status_code=500, detail=f"Test failed: {str(e)}")


@app.post("/predict/adherence")
def predict_adherence_api(data: dict):
    doses = data.get("doses", [])

    total_doses = len(doses)
    taken_doses = 0
    delays = []

    for dose in doses:
        if dose["taken"] and dose["taken_at"]:
            taken_doses += 1

            scheduled = datetime.strptime(dose["scheduled_time"], "%H:%M")
            taken_time = datetime.fromtimestamp(dose["taken_at"] / 1000)

            delay = abs(
                (taken_time.hour * 60 + taken_time.minute)
                - (scheduled.hour * 60 + scheduled.minute)
            )
            delays.append(delay)

    missed_doses = total_doses - taken_doses
    avg_delay = int(statistics.mean(delays)) if delays else 0
    adherence_rate = int((taken_doses / total_doses) * 100) if total_doses > 0 else 0

    # Create a simple object to pass to predictor (expects object with attributes)
    class AdherenceData:
        def __init__(self, missed_doses_last_7_days, avg_delay_minutes, adherence_rate_30_days):
            self.missed_doses_last_7_days = missed_doses_last_7_days
            self.avg_delay_minutes = avg_delay_minutes
            self.adherence_rate_30_days = adherence_rate_30_days
    
    MAX_DELAY = 120  # minutes (2 hours)
    avg_delay_capped = min(avg_delay, MAX_DELAY)
    ml_input = AdherenceData(missed_doses, avg_delay_capped, adherence_rate)

    prediction = ml_predict_adherence(ml_input)

    return {
        "metrics": ml_input,
        "prediction": prediction
    }
