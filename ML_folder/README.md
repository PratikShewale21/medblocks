# MedBlocks ML Backend - PDF Processing System

A FastAPI-based machine learning backend that processes medical reports from PDF files and provides health predictions.

## Features

### Original Manual Input Endpoints:
- `POST /predict/diabetes` - Manual diabetes risk prediction
- `POST /predict/adherence` - Manual medication adherence prediction  
- `POST /summary` - Medical report summary generation

### New PDF Upload Endpoints:
- `POST /upload/diabetes-report` - Upload PDF for diabetes prediction
- `POST /upload/adherence-report` - Upload PDF for adherence prediction
- `POST /upload/medical-report` - Comprehensive analysis (diabetes + adherence)

## Installation

```bash
pip install -r requirements.txt
```

## Running the Server

```bash
uvicorn main:app --reload
```

## PDF Processing Features

### Automatic Data Extraction
- Extracts medical values from PDF text
- Supports multiple medical report formats
- Handles missing data with intelligent defaults

### Medical Parameters Extracted
**Diabetes Prediction:**
- Pregnancies
- Glucose level
- Blood pressure
- Skin thickness
- Insulin level
- BMI
- Diabetes pedigree function
- Age

**Adherence Prediction:**
- Missed doses in last 7 days
- Average delay in minutes
- 30-day adherence rate

### Missing Data Handling
- **Validation:** Checks values against medical ranges
- **Defaults:** Uses medical averages for missing values
- **Confidence Scoring:** Provides prediction confidence based on data completeness
- **Warnings:** Alerts users to missing or invalid data

## API Usage Examples

### Upload Diabetes Report PDF
```bash
curl -X POST "http://localhost:8000/upload/diabetes-report" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@medical_report.pdf"
```

### Response Format
```json
{
  "success": true,
  "extracted_data": {
    "glucose": 120.0,
    "bmi": 25.5,
    "age": 35.0,
    "bp": 120.0
  },
  "prediction": {
    "prediction": 0,
    "risk_percentage": 15.2,
    "risk_level": "LOW"
  },
  "confidence": 0.75,
  "warnings": ["Missing fields: pregnancies, skin, insulin"],
  "message": "PDF processed successfully"
}
```

## File Structure
```
ML_folder/
├── main.py                    # FastAPI application
├── requirements.txt           # Dependencies
├── models/                    # Trained ML models
│   ├── diabetes_model.pkl
│   ├── diabetes_scaler.pkl
│   ├── adherence_model.pkl
│   └── adherence_scaler.pkl
├── predictors/                # Prediction logic
│   ├── diabetes_predictor.py
│   ├── adherence_predictor.py
│   └── summary_pipeline.py
└── extractors/                # PDF processing
    ├── pdf_extractor.py       # Text extraction
    └── medical_parser.py      # Data validation & parsing
```

## Limitations

- **Text-based PDFs only:** Cannot process scanned/image-based PDFs
- **Format dependent:** Extraction accuracy varies by report format
- **English only:** Currently supports English medical terminology
- **Validation ranges:** Uses standard medical ranges, may need adjustment for specific populations

## Error Handling

The system provides comprehensive error handling:
- File format validation
- PDF extraction failures
- Missing data warnings
- Invalid value detection
- Graceful fallbacks to defaults

## Development

To add new medical parameters:
1. Update extraction patterns in `pdf_extractor.py`
2. Add validation ranges in `medical_parser.py`
3. Update input schemas in `main.py`

## Testing

Test with sample medical reports to ensure extraction patterns match your specific lab format.
