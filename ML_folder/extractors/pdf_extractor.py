import PyPDF2
import pdfplumber
import re
from typing import Dict, Optional, List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PDFExtractor:
    def __init__(self):
        self.supported_formats = ['.pdf']
    
    def extract_text(self, file_path: str) -> str:
        """Extract text from PDF using multiple methods"""
        text = ""
        
        # Method 1: Try pdfplumber first (better for tables)
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            logger.warning(f"pdfplumber failed: {e}")
        
        # Method 2: Fallback to PyPDF2
        if not text.strip():
            try:
                with open(file_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    for page in pdf_reader.pages:
                        text += page.extract_text() + "\n"
            except Exception as e:
                logger.error(f"PyPDF2 failed: {e}")
                raise Exception("Could not extract text from PDF")
        
        return text
    
    def extract_medical_values(self, text: str) -> Dict[str, Optional[float]]:
        """Extract medical values from text using regex patterns"""
        extracted = {}
        
        # First, handle tabular data format (like the clinical report)
        self._extract_tabular_data(text, extracted)
        
        # Then use regex patterns for other formats
        self._extract_with_patterns(text, extracted)
        
        return extracted
    
    def _extract_tabular_data(self, text: str, extracted: Dict[str, Optional[float]]):
        """Extract data from tabular format like clinical reports"""
        lines = text.split('\n')
        
        for i, line in enumerate(lines):
            line = line.strip()
            
            # Handle parameter-value pairs in tabular format
            if 'Fasting Plasma Glucose' in line:
                # Look for value in same line or next few lines
                import re
                # Try to find number in the same line first
                glucose_match = re.search(r'Fasting Plasma Glucose\s+([\d.]+)', line)
                if glucose_match:
                    extracted['glucose'] = float(glucose_match.group(1))
                else:
                    # Look in next few lines
                    for j in range(i+1, min(i+4, len(lines))):
                        next_line = lines[j].strip()
                        if next_line.isdigit() or (next_line.replace('.', '').isdigit()):
                            extracted['glucose'] = float(next_line)
                            break
            
            elif 'Serum Insulin (Fasting)' in line:
                import re
                insulin_match = re.search(r'Serum Insulin \(Fasting\)\s+([\d.]+)', line)
                if insulin_match:
                    extracted['insulin'] = float(insulin_match.group(1))
                else:
                    for j in range(i+1, min(i+4, len(lines))):
                        next_line = lines[j].strip()
                        if next_line.isdigit() or (next_line.replace('.', '').isdigit()):
                            extracted['insulin'] = float(next_line)
                            break
            
            elif 'Systolic BP' in line:
                import re
                systolic_match = re.search(r'Systolic BP\s+([\d.]+)', line)
                if systolic_match:
                    bp_val = float(systolic_match.group(1))
                    extracted['bp_systolic'] = bp_val
                    extracted['bp'] = bp_val
                else:
                    for j in range(i+1, min(i+4, len(lines))):
                        next_line = lines[j].strip()
                        if next_line.isdigit() or (next_line.replace('.', '').isdigit()):
                            bp_val = float(next_line)
                            if 'bp_systolic' not in extracted:
                                extracted['bp_systolic'] = bp_val
                                extracted['bp'] = bp_val
                            break
            
            elif 'Diastolic BP' in line:
                import re
                diastolic_match = re.search(r'Diastolic BP\s+([\d.]+)', line)
                if diastolic_match:
                    extracted['bp_diastolic'] = float(diastolic_match.group(1))
                else:
                    for j in range(i+1, min(i+4, len(lines))):
                        next_line = lines[j].strip()
                        if next_line.isdigit() or (next_line.replace('.', '').isdigit()):
                            extracted['bp_diastolic'] = float(next_line)
                            break
            
            elif 'Calculated BMI' in line:
                import re
                bmi_match = re.search(r'Calculated BMI:\s*([\d.]+)', line)
                if bmi_match:
                    extracted['bmi'] = float(bmi_match.group(1))
            
            elif 'Triceps Skin Fold Thickness' in line:
                import re
                skin_match = re.search(r'Triceps Skin Fold Thickness:\s*([\d.]+)', line)
                if skin_match:
                    extracted['skin'] = float(skin_match.group(1))
            
            elif 'Age / Sex:' in line:
                import re
                age_match = re.search(r'(\d+)\s*Y', line)
                if age_match:
                    extracted['age'] = float(age_match.group(1))
    
    def _extract_with_patterns(self, text: str, extracted: Dict[str, Optional[float]]):
        """Extract data using regex patterns (original method)"""
        
        # Diabetes-related patterns
        patterns = {
            'glucose': [
                r'glucose[:\s]*([\d.]+)',
                r'blood sugar[:\s]*([\d.]+)',
                r'glucose level[:\s]*([\d.]+)',
                r'fasting glucose[:\s]*([\d.]+)',
                r'random glucose[:\s]*([\d.]+)',
                r'fasting plasma glucose[:\s]*([\d.]+)',
                r'post-prandial glucose[:\s]*([\d.]+)',
                r'plasma glucose[:\s]*([\d.]+)'
            ],
            'bp': [
                r'blood pressure[:\s]*([\d.]+)/([\d.]+)',
                r'bp[:\s]*([\d.]+)/([\d.]+)',
                r'systolic[:\s]*([\d.]+).*diastolic[:\s]*([\d.]+)',
                r'systolic bp[:\s]*([\d.]+)',
                r'diastolic bp[:\s]*([\d.]+)',
                r'systolic[:\s]*([\d.]+)',
                r'diastolic[:\s]*([\d.]+)'
            ],
            'bmi': [
                r'bmi[:\s]*([\d.]+)',
                r'body mass index[:\s]*([\d.]+)',
                r'body mass index \(bmi\)[:\s]*([\d.]+)',
                r'bmi\)[:\s]*([\d.]+)',
                r'body mass index.*?([\d.]+)'
            ],
            'age': [
                r'age[:\s]*(\d+)',
                r'years old[:\s]*(\d+)',
                r'patient age[:\s]*(\d+)',
                r'age / sex[:\s]*(\d+)',
                r'age[:\s]*(\d+)\s*y',
                r'(\d+)\s*y[/\s]*male',
                r'(\d+)\s*y[/\s]*female'
            ],
            'pregnancies': [
                r'pregnancies[:\s]*(\d+)',
                r'gravida[:\s]*(\d+)',
                r'para[:\s]*(\d+)'
            ],
            'insulin': [
                r'insulin[:\s]*([\d.]+)',
                r'insulin level[:\s]*([\d.]+)',
                r'serum insulin[:\s]*([\d.]+)',
                r'fasting insulin[:\s]*([\d.]+)',
                r'serum insulin \(fasting\)[:\s]*([\d.]+)'
            ],
            'skin': [
                r'skin thickness[:\s]*([\d.]+)',
                r'tricep[:\s]*([\d.]+)',
                r'skin fold[:\s]*([\d.]+)',
                r'triceps skin fold thickness[:\s]*([\d.]+)',
                r'skin fold thickness[:\s]*([\d.]+)'
            ],
            'cholesterol': [
                r'cholesterol[:\s]*([\d.]+)',
                r'total cholesterol[:\s]*([\d.]+)',
                r'cholesterol level[:\s]*([\d.]+)'
            ],
            'ldl': [
                r'ldl[:\s]*([\d.]+)',
                r'ldl cholesterol[:\s]*([\d.]+)',
                r'low density lipoprotein[:\s]*([\d.]+)'
            ],
            'hdl': [
                r'hdl[:\s]*([\d.]+)',
                r'hdl cholesterol[:\s]*([\d.]+)',
                r'high density lipoprotein[:\s]*([\d.]+)'
            ],
            'triglycerides': [
                r'triglycerides[:\s]*([\d.]+)',
                r'triglyceride[:\s]*([\d.]+)',
                r'tg[:\s]*([\d.]+)'
            ],
            'creatinine': [
                r'creatinine[:\s]*([\d.]+)',
                r'serum creatinine[:\s]*([\d.]+)',
                r'creatinine level[:\s]*([\d.]+)'
            ],
        }
        
        # Extract values using patterns
        for field, field_patterns in patterns.items():
            if field in extracted and extracted[field] is not None:
                continue  # Skip if already found by tabular extraction
                
            for pattern in field_patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    if field == 'bp':
                        # Handle systolic/diastolic
                        systolic = float(match.group(1))
                        diastolic = float(match.group(2)) if len(match.groups()) > 1 else None
                        extracted['bp_systolic'] = systolic
                        extracted['bp_diastolic'] = diastolic
                        extracted['bp'] = systolic  # Use systolic for model
                    else:
                        try:
                            value = float(match.group(1))
                            extracted[field] = value
                            break  # Use first match found
                        except (ValueError, IndexError):
                            continue
        
        return extracted
    
    def extract_adherence_data(self, text: str) -> Dict[str, Optional[float]]:
        """Extract medication adherence data from text"""
        extracted = {}
        
        patterns = {
            'missed_doses_last_7_days': [
                r'missed doses[:\s]*(\d+)',
                r'doses missed[:\s]*(\d+)',
                r'forgotten doses[:\s]*(\d+)'
            ],
            'avg_delay_minutes': [
                r'delay[:\s]*(\d+)\s*minutes',
                r'late by[:\s]*(\d+)\s*minutes',
                r'average delay[:\s]*(\d+)'
            ],
            'adherence_rate_30_days': [
                r'adherence rate[:\s]*([\d.]+)',
                r'compliance[:\s]*([\d.]+)',
                r'medication adherence[:\s]*([\d.]+)'
            ]
        }
        
        for field, field_patterns in patterns.items():
            for pattern in field_patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    try:
                        value = float(match.group(1))
                        extracted[field] = value
                        break
                    except (ValueError, IndexError):
                        continue
        
        return extracted
