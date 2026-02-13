# Add these imports to main.py
from predictors.enhanced_summary import generate_enhanced_summary
from predictors.ai_summary import generate_ai_summary

# Add new endpoint for enhanced summary
@app.post("/summary/enhanced")
async def enhanced_summary(text: str, patient_context: Dict[str, Any] = None):
    """
    Generate enhanced medical summary with NLP analysis
    """
    try:
        summary = generate_enhanced_summary(text, patient_context)
        return {
            "success": True,
            "summary": summary,
            "type": "enhanced_nlp"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating enhanced summary: {str(e)}")

@app.post("/summary/ai")
async def ai_summary(text: str, patient_history: Dict[str, Any] = None):
    """
    Generate AI-powered clinical summary
    """
    try:
        analysis = generate_ai_summary(text, patient_history)
        return {
            "success": True,
            "analysis": analysis,
            "type": "ai_clinical"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating AI summary: {str(e)}")

# Update existing PDF processing to use enhanced summary
@app.post("/upload/medical-report-enhanced", response_model=PDFProcessingResponse)
async def upload_medical_report_enhanced(file: UploadFile = File(...)):
    """
    Upload PDF medical report with enhanced summary analysis
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
        
        # Prepare inputs
        diabetes_prepared = parser.prepare_diabetes_input(extracted_data)
        adherence_prepared = parser.prepare_adherence_input(extracted_data)
        
        # Make predictions
        predictions = {}
        if diabetes_prepared['can_predict']:
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
            
            predictions['diabetes'] = predict_diabetes(DiabetesInput(diabetes_prepared['input_data']))
        else:
            predictions['diabetes'] = {"error": "Insufficient data for diabetes prediction"}
        
        predictions['adherence'] = predict_adherence(adherence_prepared['input_data'])
        
        # Generate enhanced summary
        enhanced_summary = generate_enhanced_summary(text)
        
        # Generate AI clinical analysis
        ai_analysis = generate_ai_summary(text)
        
        # Clean up temp file
        os.unlink(temp_file_path)
        
        return {
            "success": True,
            "extracted_data": {**extracted_data},
            "predictions": predictions,
            "confidence": (diabetes_prepared['confidence'] + adherence_prepared['confidence']) / 2,
            "enhanced_summary": enhanced_summary,
            "ai_analysis": ai_analysis,
            "warnings": diabetes_prepared['warnings'] + adherence_prepared['warnings'],
            "message": "Comprehensive analysis with enhanced summaries completed"
        }
        
    except Exception as e:
        # Clean up temp file if it exists
        if 'temp_file_path' in locals():
            try:
                os.unlink(temp_file_path)
            except:
                pass
        
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")
