# Frontend Integration Guide - Universal Document Analysis

## 🌐 API Base URL
```
Development: http://localhost:8002
Production: https://your-api-domain.com
```

## 📋 Available Endpoints

### 🤖 Universal Document Analysis
```javascript
// Upload ANY document for comprehensive ML analysis
POST /upload/summarize-pdf
Content-Type: multipart/form-data

// Request Body:
FormData: {
  file: <PDF file>
}

// Response:
{
  "success": true,
  "extracted_data": {"text_length": 1500},
  "prediction": {
    "summary": {
      "executive_summary": "34-year-old male diagnosed with soft tissue injury...",
      "key_findings": "34-year-old male diagnosed with soft tissue injury...",
      "risk_assessment": "Document type: medical",
      "recommendations": "Follow prescribed treatment plan\nAttend follow-up appointments",
      "follow_up": "Consult relevant professional if needed",
      "patient_summary": "34-year-old male diagnosed with soft tissue injury...",
      "clinical_insights": {"people": ["34-year-old male"], "conditions": ["soft tissue injury"]},
      "extracted_data": {"people": ["34-year-old male"], "conditions": ["soft tissue injury"]},
      "report_type": "medical",
      "ml_model_used": "Simple ML Summarizer",
      "confidence_scores": {"content_confidence": 0.9}
    }
  }
}
```

### 🧪 Manual Input (for testing)
```javascript
// Diabetes prediction without PDF
POST /predict/diabetes
Content-Type: application/json

// Request Body:
{
  "pregnancies": 0,
  "glucose": 182,
  "bp": 152,
  "skin": 36,
  "insulin": 215,
  "bmi": 33.1,
  "dpf": 0.5,
  "age": 56
}

// Adherence prediction
POST /predict/adherence
Content-Type: application/json

// Request Body:
{
  "missed_doses_last_7_days": 2,
  "avg_delay_minutes": 30,
  "adherence_rate_30_days": 85.5
}
```

### 🚨 Alert System
```javascript
// Check for diabetes alerts
POST /alerts/check-diabetes
Content-Type: application/json

// Request Body:
{
  "patient_id": "patient123",
  "risk_percentage": 49.22,
  "confidence": 0.75
}

// Check for adherence alerts
POST /alerts/check-adherence
Content-Type: application/json

// Request Body:
{
  "patient_id": "patient123",
  "missed_doses_last_7_days": 2,
  "avg_delay_minutes": 30,
  "adherence_rate_30_days": 85.5
}

// Get patient alerts
GET /alerts/{patient_id}?unacknowledged_only=true

// Acknowledge alert
POST /alerts/{alert_id}/acknowledge
```

## 🔧 Frontend Implementation Examples

### React.js Example
```javascript
// API service
const API_BASE_URL = 'http://localhost:8002';

class HealthAPI {
  // Upload medical report
  static async uploadMedicalReport(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/upload/medical-report`, {
      method: 'POST',
      body: formData
    });
    
    return await response.json();
  }
  
  // Check adherence alerts
  static async checkAdherenceAlerts(patientId, adherenceData) {
    const response = await fetch(`${API_BASE_URL}/alerts/check-adherence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_id: patientId,
        ...adherenceData
      })
    });
    
    return await response.json();
  }
  
  // Get patient alerts
  static async getPatientAlerts(patientId) {
    const response = await fetch(`${API_BASE_URL}/alerts/${patientId}`);
    return await response.json();
  }
  
  // Acknowledge alert
  static async acknowledgeAlert(alertId) {
    const response = await fetch(`${API_BASE_URL}/alerts/${alertId}/acknowledge`, {
      method: 'POST'
    });
    return await response.json();
  }
}

// React Component Example
function HealthDashboard({ patientId }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const handleFileUpload = async (file) => {
    setLoading(true);
    try {
      const result = await HealthAPI.uploadMedicalReport(file);
      
      // Check for alerts based on prediction
      if (result.prediction.diabetes) {
        const alerts = await HealthAPI.checkDiabetesAlerts(
          patientId, 
          result.prediction.diabetes.risk_percentage,
          result.confidence
        );
        setAlerts(alerts);
      }
      
      // Update UI with results
      updateHealthData(result);
      
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAdherenceUpdate = async (adherenceData) => {
    try {
      const alerts = await HealthAPI.checkAdherenceAlerts(patientId, adherenceData);
      setAlerts(prev => [...prev, ...alerts]);
    } catch (error) {
      console.error('Adherence check failed:', error);
    }
  };
  
  const acknowledgeAlert = async (alertId) => {
    try {
      await HealthAPI.acknowledgeAlert(alertId);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };
  
  return (
    <div>
      {/* File Upload Component */}
      <FileUpload onUpload={handleFileUpload} loading={loading} />
      
      {/* Alerts Display */}
      <AlertsDisplay 
        alerts={alerts} 
        onAcknowledge={acknowledgeAlert} 
      />
      
      {/* Health Data Display */}
      <HealthDataDisplay />
    </div>
  );
}
```

### Vanilla JavaScript Example
```javascript
// API configuration
const API_BASE = 'http://localhost:8002';

// Upload medical report
async function uploadMedicalReport(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch(`${API_BASE}/upload/medical-report`, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      displayResults(result);
      checkForAlerts(result);
    } else {
      showError('Upload failed');
    }
    
  } catch (error) {
    console.error('Error:', error);
    showError('Network error');
  }
}

// Check for alerts
async function checkForAlerts(healthData) {
  const patientId = getCurrentPatientId();
  
  // Check diabetes alerts
  if (healthData.prediction.diabetes) {
    const diabetesAlerts = await fetch(`${API_BASE}/alerts/check-diabetes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_id: patientId,
        risk_percentage: healthData.prediction.diabetes.risk_percentage,
        confidence: healthData.confidence
      })
    });
    
    const alerts = await diabetesAlerts.json();
    displayAlerts(alerts);
  }
}

// Display results
function displayResults(data) {
  const resultsDiv = document.getElementById('results');
  
  const riskLevel = data.prediction.diabetes?.risk_level || 'UNKNOWN';
  const riskClass = riskLevel.toLowerCase() === 'low' ? 'success' : 
                  riskLevel.toLowerCase() === 'moderate' ? 'warning' : 'danger';
  
  resultsDiv.innerHTML = `
    <div class="alert alert-${riskClass}">
      <h4>Analysis Results</h4>
      <p><strong>Risk Level:</strong> ${riskLevel}</p>
      <p><strong>Confidence:</strong> ${Math.round(data.confidence * 100)}%</p>
      
      <h5>Extracted Data:</h5>
      <ul>
        ${Object.entries(data.extracted_data).map(([key, value]) => 
          `<li><strong>${key}:</strong> ${value || 'Not found'}</li>`
        ).join('')}
      </ul>
      
      ${data.warnings.length > 0 ? `
        <div class="alert alert-warning">
          <strong>Warnings:</strong>
          <ul>
            ${data.warnings.map(warning => `<li>${warning}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `;
}

// Display alerts
function displayAlerts(alerts) {
  const alertsDiv = document.getElementById('alerts');
  
  alertsDiv.innerHTML = alerts.map(alert => `
    <div class="alert alert-${alert.priority === 'critical' ? 'danger' : 'warning'}">
      <h5>${alert.title}</h5>
      <p>${alert.message}</p>
      ${alert.action_required ? `
        <button class="btn btn-primary" onclick="acknowledgeAlert('${alert.id}')">
          Acknowledge
        </button>
      ` : ''}
    </div>
  `).join('');
}

// Acknowledge alert
async function acknowledgeAlert(alertId) {
  try {
    await fetch(`${API_BASE_URL}/alerts/${alertId}/acknowledge`, {
      method: 'POST'
    });
    
    // Refresh alerts
    location.reload();
  } catch (error) {
    console.error('Failed to acknowledge alert:', error);
  }
}
```

## 🎨 UI Components

### File Upload Component
```html
<div class="upload-area" id="uploadArea">
  <input type="file" id="pdfFile" accept=".pdf" style="display: none;">
  <div class="upload-content">
    <i class="fas fa-file-pdf"></i>
    <h3>Upload Medical Report</h3>
    <p>Drag & drop PDF here or click to browse</p>
    <button onclick="document.getElementById('pdfFile').click()">
      Choose File
    </button>
  </div>
  <div class="upload-progress" id="uploadProgress" style="display: none;">
    <div class="spinner"></div>
    <p>Processing your medical report...</p>
  </div>
</div>
```

### Alerts Display Component
```html
<div class="alerts-container" id="alertsContainer">
  <h3>Health Alerts</h3>
  <div id="alertsList"></div>
</div>
```

### Health Data Display
```html
<div class="health-summary" id="healthSummary">
  <h3>Health Summary</h3>
  <div class="metric">
    <span class="label">Diabetes Risk:</span>
    <span class="value" id="diabetesRisk">-</span>
  </div>
  <div class="metric">
    <span class="label">Adherence Rate:</span>
    <span class="value" id="adherenceRate">-</span>
  </div>
  <div class="metric">
    <span class="label">Last Updated:</span>
    <span class="value" id="lastUpdated">-</span>
  </div>
</div>
```

## 🔧 Configuration

### Environment Variables
```bash
# .env file
REACT_APP_API_BASE_URL=http://localhost:8002
VUE_APP_API_BASE_URL=http://localhost:8002
```

### Production CORS Setup
```python
# In main.py - Update for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

## 🚀 Getting Started

1. **Start Backend:** `python -m uvicorn main:app --reload --port 8002`
2. **Test API:** Visit `http://localhost:8002/docs`
3. **Integrate Frontend:** Use examples above
4. **Test Integration:** Upload a PDF and check alerts

## 📞 Support

- **API Documentation:** `http://localhost:8002/docs`
- **Health Check:** `GET /`
- **Error Handling:** All endpoints return proper HTTP status codes
- **Rate Limiting:** Not implemented (add if needed for production)
