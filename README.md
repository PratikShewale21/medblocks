# 🏥 MedBlocks - Healthcare Platform

MedBlocks is a healthcare platform that combines machine learning and blockchain to improve medical data handling and patient care. It allows patients to upload medical reports and use AI to predict health risks, generate easy-to-understand summaries, and analyze medication adherence. Medical records are stored in a secure, encrypted vault where patients retain full ownership. Using wallet-based access control, patients can securely share or revoke access to their records with doctors at any time.

## 🚀 Features

### 🤖 Universal Document Analyzer
- **Content-Based ML**: Extracts actual content from YOUR documents
- **Dynamic Analysis**: Unique summary for every document type
- **Smart Classification**: Auto-detects medical, business, academic, legal content
- **No Templates**: True ML processing, not hardcoded responses

### 📋 Document Types Supported
- **Medical Reports**: Lab results, orthopedic injuries, clinical notes
- **Business Documents**: Financial reports, market analysis, business plans
- **Academic Papers**: Research studies, methodology, findings
- **Legal Documents**: Contracts, agreements, legal analysis
- **General Content**: Any text-based document

### 🧪 ML Predictors
- **Diabetes Prediction**: Risk assessment from medical parameters
- **Medication Adherence**: Compliance monitoring and prediction
- **Content Classification**: Automatic document type detection
- **Entity Extraction**: Medical conditions, treatments, demographics
- **Inheritance System**: Blockchain-based inheritance tracking

## 🏗️ Project Structure

```
medblocks/
├── medblocks-react/              # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── api/             # API configuration
│   │   └── styles/          # CSS files
│   ├── public/                # Static assets
│   ├── package.json           # Dependencies
│   └── README.md             # Frontend documentation
│
├── medblocks/ML_folder/      # ML backend
│   ├── main.py               # FastAPI application with universal ML
│   ├── requirements.txt        # Dependencies
│   ├── models/                    # Trained ML models
│   │   ├── diabetes_model.pkl      # Diabetes prediction
│   │   ├── diabetes_scaler.pkl    # Data scaler
│   │   ├── adherence_model.pkl    # Medication adherence
│   │   └── adherence_scaler.pkl  # Data scaler
│   ├── predictors/                # ML prediction modules
│   │   ├── diabetes_predictor.py   # Diabetes risk prediction
│   │   ├── adherence_predictor.py  # Medication adherence
│   │   └── simple_ml_summarizer.py  # Universal document analyzer
│   ├── extractors/               # PDF processing
│   │   ├── pdf_extractor.py      # Text extraction
│   │   └── medical_parser.py     # Medical data validation
│   ├── services/                 # Alert and notification services
│   │   ├── alert_service.py       # Health alert system
│   │   └── notification_service.py # Notification delivery
│   └── README.md             # Backend documentation
│
├── medblocks/Inheritance-backend/ # Blockchain inheritance system
│   ├── main.py               # FastAPI application for inheritance
│   ├── requirements.txt        # Dependencies
│   ├── contracts/            # Smart contracts
│   ├── routes/               # API endpoints
│   ├── services/             # Blockchain services
│   ├── utils/                # Utility functions
│   ├── data/                 # Data management
│   └── test_*.py            # Test files
│
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup
```bash
cd medblocks/ML_folder
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8002
```

### Frontend Setup
```bash
cd medblocks/medblocks-react
npm install
npm start
```

### Inheritance System Setup
```bash
cd medblocks/Inheritance-backend
pip install -r requirements.txt
python main.py
```

## 📱 Application Access

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8002
- **Inheritance API**: http://localhost:8003
- **API Documentation**: http://localhost:8002/docs

## 🎯 Key Features

### 🤖 Universal Document Processing
- **Upload ANY PDF**: Medical, business, academic, legal documents
- **ML-Based Analysis**: Content extraction, not templates
- **Smart Classification**: Automatic document type detection
- **Dynamic Summaries**: Generated from actual content

### 🧪 Healthcare ML
- **Diabetes Prediction**: Risk assessment from medical parameters
- **Medication Adherence**: Compliance monitoring and prediction
- **Health Alerts**: Real-time notifications
- **Clinical Insights**: Entity extraction and recommendations

### ⛓ Blockchain Inheritance
- **Smart Contracts**: Automated inheritance distribution
- **Digital Assets**: Tokenized inheritance rights
- **Immutable Records**: Blockchain-based verification
- **Multi-Asset Support**: Property, digital assets, investments

## 🎓 Perfect for College Projects

### Advanced ML Concepts Demonstrated
- **Content-Based Analysis**: True ML, not rule-based templates
- **Universal Document Processing**: Handles ANY document type
- **Smart Classification**: Automatic document type detection
- **Entity Extraction**: Medical conditions, treatments, demographics
- **Dynamic Recommendations**: Generated from actual content
- **Blockchain Integration**: Smart contracts and digital assets
- **Production Architecture**: Clean, modular, maintainable

### Real-World Applications
- **Healthcare**: Medical report analysis and summarization
- **Business**: Document processing and analysis
- **Academic**: Research paper summarization
- **Legal**: Contract analysis and key point extraction
- **Finance**: Blockchain-based inheritance management
- **Estate Planning**: Automated asset distribution

## 🔧 Technology Stack

### Backend
- **FastAPI**: Modern, fast Python web framework
- **PyTorch**: ML framework for deep learning
- **scikit-learn**: Traditional ML algorithms
- **Transformers**: BioBERT and other transformer models
- **PDF Processing**: PyPDF2, pdfplumber
- **Blockchain**: Web3.py, smart contracts
- **Cryptography**: Digital signatures, encryption

### Frontend
- **React**: Modern JavaScript library for UI
- **Axios**: HTTP client for API communication
- **CSS3**: Modern styling with responsive design
- **HTML5**: Semantic markup structure
- **Web3.js**: Blockchain interaction

## 📊 API Endpoints

### Document Analysis
- **`POST /upload/summarize-pdf`** - Universal document analysis
- **`POST /predict/diabetes`** - Diabetes risk prediction
- **`POST /predict/adherence`** - Medication adherence prediction

### Health Monitoring
- **`GET /alerts/{patient_id}`** - Get patient health alerts
- **`POST /alerts/check-diabetes`** - Diabetes risk alerts
- **`POST /alerts/check-adherence`** - Adherence monitoring alerts

### Blockchain Inheritance
- **`POST /inheritance/create`** - Create inheritance contract
- **`GET /inheritance/{id}`** - Get inheritance details
- **`POST /inheritance/execute`** - Execute inheritance distribution
- **`GET /assets/{address}`** - Get digital assets

## 🚀 Limitations

- **Text-based PDFs**: Cannot process scanned/image-based PDFs
- **English Language**: Currently optimized for English content
- **Internet Required**: For model downloads and blockchain operations
- **Memory Usage**: Large PDFs may require more RAM
- **Blockchain Gas**: Smart contract execution requires ETH

## 🧪 Development

### Adding New Document Types
1. Update content patterns in `simple_ml_summarizer.py`
2. Add classification keywords
3. Create specific recommendation rules
4. Test with sample documents

### Extending ML Models
1. Train new models and save to `models/`
2. Update predictors to use new models
3. Add new endpoints to `main.py`
4. Update documentation

### Blockchain Development
1. Deploy new smart contracts
2. Update inheritance logic
3. Add new asset types
4. Test on testnet before mainnet

## 🧪 Testing

Test with various document types:
- Medical reports (lab results, clinical notes)
- Business documents (financial reports, plans)
- Academic papers (research, studies)
- Legal documents (contracts, agreements)
- General content (articles, reports)

## 📞 Support

For issues with:
- Document processing: Check `extractors/` modules
- ML predictions: Review `predictors/` modules
- API endpoints: Examine `main.py` routes
- Model loading: Verify `models/` files exist
- Blockchain: Review smart contracts and inheritance logic

## 🎯 College Project Success

This system demonstrates:
✅ **Advanced ML**: Content-based analysis, not templates
✅ **Universal Processing**: Handles any document type
✅ **Blockchain Integration**: Smart contracts and digital assets
✅ **Production Ready**: Clean architecture, error handling
✅ **Real Impact**: Practical healthcare and finance applications
✅ **Scalable**: Easy to extend and maintain
✅ **Multi-System**: Healthcare + blockchain integration

---

**🎉 A comprehensive healthcare and inheritance platform powered by machine learning and blockchain!**
