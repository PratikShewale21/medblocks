import re
from typing import Dict, List, Tuple
from datetime import datetime

class MedicalSummarizer:
    """
    Enhanced medical report summarizer using NLP techniques
    """
    
    def __init__(self):
        # Medical patterns for extraction
        self.medical_patterns = {
            'glucose': [
                r'glucose[:\s]*(\d{2,3}\.?\d*)\s*(?:mg\/dl|mmol\/l)?',
                r'blood sugar[:\s]*(\d{2,3}\.?\d*)\s*(?:mg\/dl|mmol\/l)?',
                r'fasting plasma glucose[:\s]*(\d{2,3}\.?\d*)\s*(?:mg\/dl|mmol\/l)?',
                r'fpg[:\s]*(\d{2,3}\.?\d*)\s*(?:mg\/dl|mmol\/l)?',
                r'glucose.*?(\d{2,3}\.?\d*)\s*(?:mg\/dl|mmol\/l)',
                r'fasting.*?glucose[:\s]*(\d{2,3}\.?\d*)',
                r'- Glucose[:\s]*(\d{2,3}\.?\d*)'
            ],
            'hba1c': [
                r'hba1c[:\s]*(\d+\.?\d*)\s*%?',
                r'hemoglobin a1c[:\s]*(\d+\.?\d*)\s*%?',
                r'a1c[:\s]*(\d+\.?\d*)\s*%?',
                r'hba1c.*?(\d+\.?\d*)\s*%?'
            ],
            'bmi': [
                r'bmi[:\s]*(\d+\.?\d*)',
                r'body mass index[:\s]*(\d+\.?\d*)',
                r'calculated bmi[:\s]*(\d+\.?\d*)'
            ],
            'blood_pressure': [
                r'bp[:\s]*(\d{2,3})[\/\s]*(\d{2,3})',
                r'blood pressure[:\s]*(\d{2,3})[\/\s]*(\d{2,3})',
                r'systolic[:\s]*(\d{2,3}).*?diastolic[:\s]*(\d{2,3})'
            ],
            'age': [
                r'age[:\s]*(\d+)',
                r'patient age[:\s]*(\d+)',
                r'(\d+)\s*(?:years? old|y\.o\.|yo)'
            ],
            'diagnosis': [
                r'diagnosis[:\s]*([^.]+)',
                r'findings[:\s]*([^.]+)',
                r'conclusion[:\s]*([^.]+)',
                r'impression[:\s]*([^.]+)'
            ],
            'recommendations': [
                r'recommendation[:\s]*([^.]+)',
                r'treatment[:\s]*([^.]+)',
                r'follow[-]?up[:\s]*([^.]+)',
                r'advice[:\s]*([^.]+)'
            ]
        }
        
        # Risk level thresholds
        self.risk_thresholds = {
            'glucose': {
                'normal': (70, 99),
                'prediabetes': (100, 125),
                'diabetes': (126, 400)
            },
            'hba1c': {
                'normal': (4.0, 5.6),
                'prediabetes': (5.7, 6.4),
                'diabetes': (6.5, 15.0)
            },
            'bmi': {
                'normal': (18.5, 24.9),
                'overweight': (25, 29.9),
                'obese': (30, 50)
            },
            'blood_pressure': {
                'normal': (90, 120, 60, 80),  # sys_low, sys_high, dia_low, dia_high
                'elevated': (120, 129, 60, 80),
                'stage1': (130, 139, 80, 89),
                'stage2': (140, 180, 90, 120)
            }
        }
        
        # Medical keywords for context
        self.medical_keywords = {
            'critical': ['critical', 'urgent', 'emergency', 'severe', 'acute'],
            'concerning': ['abnormal', 'elevated', 'reduced', 'decreased', 'increased'],
            'positive': ['normal', 'stable', 'improved', 'controlled', 'within range'],
            'medications': ['metformin', 'insulin', 'lisinopril', 'atorvastatin', 'aspirin'],
            'conditions': ['diabetes', 'hypertension', 'hyperlipidemia', 'obesity']
        }
    
    def extract_medical_data(self, text: str) -> Dict[str, any]:
        """Extract structured medical data from text"""
        extracted = {}
        
        for field, patterns in self.medical_patterns.items():
            for pattern in patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    if field == 'blood_pressure':
                        extracted[field] = {
                            'systolic': int(match.group(1)),
                            'diastolic': int(match.group(2))
                        }
                    else:
                        extracted[field] = match.group(1).strip()
                    break
        
        return extracted
    
    def assess_risk_level(self, medical_data: Dict[str, any]) -> Dict[str, str]:
        """Assess risk levels for each parameter"""
        risk_assessment = {}
        
        # Glucose risk
        if 'glucose' in medical_data:
            glucose = float(medical_data['glucose'])
            if glucose < 70:
                risk_assessment['glucose'] = {'status': 'low', 'severity': 'moderate', 
                                             'interpretation': 'Hypoglycemia - requires attention'}
            elif glucose <= self.risk_thresholds['glucose']['normal'][1]:
                risk_assessment['glucose'] = {'status': 'normal', 'severity': 'low',
                                             'interpretation': 'Normal fasting glucose'}
            elif glucose <= self.risk_thresholds['glucose']['prediabetes'][1]:
                risk_assessment['glucose'] = {'status': 'prediabetes', 'severity': 'moderate',
                                             'interpretation': 'Prediabetes range - lifestyle intervention needed'}
            else:
                risk_assessment['glucose'] = {'status': 'diabetes', 'severity': 'high',
                                             'interpretation': 'Diabetic range - medical treatment required'}
        
        # HbA1c risk
        if 'hba1c' in medical_data:
            hba1c = float(medical_data['hba1c'])
            if hba1c <= self.risk_thresholds['hba1c']['normal'][1]:
                risk_assessment['hba1c'] = {'status': 'normal', 'severity': 'low',
                                           'interpretation': 'Normal HbA1c'}
            elif hba1c <= self.risk_thresholds['hba1c']['prediabetes'][1]:
                risk_assessment['hba1c'] = {'status': 'prediabetes', 'severity': 'moderate',
                                           'interpretation': 'Prediabetes - increased diabetes risk'}
            else:
                risk_assessment['hba1c'] = {'status': 'diabetes', 'severity': 'high',
                                           'interpretation': 'Diabetic - requires treatment'}
        
        # BMI risk
        if 'bmi' in medical_data:
            bmi = float(medical_data['bmi'])
            if bmi < self.risk_thresholds['bmi']['normal'][0]:
                risk_assessment['bmi'] = {'status': 'underweight', 'severity': 'moderate', 
                                         'interpretation': 'Underweight - requires attention'}
            elif bmi <= self.risk_thresholds['bmi']['normal'][1]:
                risk_assessment['bmi'] = {'status': 'normal', 'severity': 'low',
                                         'interpretation': 'Normal BMI'}
            elif bmi <= self.risk_thresholds['bmi']['overweight'][1]:
                risk_assessment['bmi'] = {'status': 'overweight', 'severity': 'moderate',
                                         'interpretation': 'Overweight - lifestyle intervention needed'}
            else:
                risk_assessment['bmi'] = {'status': 'obese', 'severity': 'high',
                                         'interpretation': 'Obese - comprehensive weight management needed'}
        
        # Blood pressure risk
        if 'blood_pressure' in medical_data:
            bp = medical_data['blood_pressure']
            sys, dia = bp['systolic'], bp['diastolic']
            
            if sys < 90 or dia < 60:
                risk_assessment['blood_pressure'] = {'status': 'low', 'severity': 'moderate',
                                                    'interpretation': 'Low blood pressure - monitor'}
            elif sys <= 120 and dia <= 80:
                risk_assessment['blood_pressure'] = {'status': 'normal', 'severity': 'low',
                                                    'interpretation': 'Normal blood pressure'}
            elif sys <= 129 and dia <= 80:
                risk_assessment['blood_pressure'] = {'status': 'elevated', 'severity': 'moderate',
                                                    'interpretation': 'Elevated blood pressure - lifestyle changes'}
            elif sys <= 139 or dia <= 89:
                risk_assessment['blood_pressure'] = {'status': 'stage1', 'severity': 'high',
                                                    'interpretation': 'Stage 1 hypertension - treatment considered'}
            else:
                risk_assessment['blood_pressure'] = {'status': 'stage2', 'severity': 'high',
                                                    'interpretation': 'Stage 2 hypertension - treatment required'}
        
        return risk_assessment
    
    def identify_key_findings(self, text: str, medical_data: Dict[str, any]) -> List[str]:
        """Identify key medical findings from text"""
        findings = []
        
        # Extract diagnosis/impression
        if 'diagnosis' in medical_data:
            diagnosis = medical_data['diagnosis']
            findings.append(f"Diagnosis: {diagnosis}")
        
        # Check for abnormal values
        risk_assessment = self.assess_risk_level(medical_data)
        
        for param, risk in risk_assessment.items():
            if risk != 'normal':
                value = medical_data.get(param, 'N/A')
                if param == 'blood_pressure':
                    value = f"{value['systolic']}/{value['diastolic']}"
                findings.append(f"Abnormal {param}: {value} ({risk})")
        
        # Look for critical keywords
        for category, keywords in self.medical_keywords.items():
            if category == 'critical':
                for keyword in keywords:
                    if keyword.lower() in text.lower():
                        findings.append(f"Critical finding: {keyword}")
        
        return findings
    
    def generate_recommendations(self, risk_assessment: Dict[str, str], 
                                medical_data: Dict[str, any]) -> List[str]:
        """Generate personalized recommendations"""
        recommendations = []
        
        # Diabetes-related recommendations
        if risk_assessment.get('glucose') in ['prediabetes', 'diabetes']:
            recommendations.extend([
                "Monitor blood glucose levels regularly",
                "Follow diabetic diet guidelines",
                "Consider consultation with endocrinologist",
                "Maintain healthy weight through diet and exercise"
            ])
        
        # BMI-related recommendations
        if risk_assessment.get('bmi') in ['overweight', 'obese']:
            recommendations.extend([
                "Implement weight management program",
                "Increase physical activity to 150 minutes/week",
                "Consult with nutritionist for diet planning",
                "Monitor for weight-related complications"
            ])
        
        # Blood pressure recommendations
        if risk_assessment.get('blood_pressure') in ['elevated', 'stage1', 'stage2']:
            recommendations.extend([
                "Monitor blood pressure regularly",
                "Reduce sodium intake",
                "Engage in regular aerobic exercise",
                "Consider antihypertensive medication if prescribed"
            ])
        
        # General recommendations
        if not recommendations:
            recommendations.append("Continue routine health monitoring")
        
        return recommendations
    
    def generate_comprehensive_summary(self, text: str, 
                                     patient_context: Dict[str, any] = None) -> Dict[str, str]:
        """Generate comprehensive medical summary"""
        
        # Extract medical data
        medical_data = self.extract_medical_data(text)
        
        # Assess risk levels
        risk_assessment = self.assess_risk_level(medical_data)
        
        # Identify key findings
        key_findings = self.identify_key_findings(text, medical_data)
        
        # Generate recommendations
        recommendations = self.generate_recommendations(risk_assessment, medical_data)
        
        # Build summary sections
        summary = {
            'executive_summary': self._create_executive_summary(risk_assessment, medical_data),
            'key_findings': self._format_findings(key_findings),
            'risk_assessment': self._format_risk_assessment(risk_assessment, medical_data),
            'recommendations': self._format_recommendations(recommendations),
            'patient_summary': self._create_patient_summary(risk_assessment, medical_data)
        }
        
        return summary
    
    def _create_executive_summary(self, risk_assessment: Dict[str, str], 
                                medical_data: Dict[str, any]) -> str:
        """Create executive summary for healthcare providers"""
        
        # Check if this is an adherence report
        if any(key in medical_data for key in ['adherence_rate_30_days', 'missed_doses_last_7_days', 'avg_delay_minutes']):
            adherence_rate = medical_data.get('adherence_rate_30_days', 100)
            missed_doses = medical_data.get('missed_doses_last_7_days', 0)
            
            if adherence_rate < 50:
                return (f"CRITICAL: Patient shows very poor medication adherence ({adherence_rate:.1f}%) "
                       f"with {missed_doses} missed doses this week. "
                       f"Immediate intervention required to prevent complications.")
            elif adherence_rate < 80:
                return (f"MODERATE CONCERN: Patient medication adherence is {adherence_rate:.1f}% "
                       f"with {missed_doses} missed doses this week. "
                       f"Adherence barriers identified and intervention recommended.")
            else:
                return (f"GOOD: Patient shows adequate medication adherence ({adherence_rate:.1f}%). "
                       f"Continue current monitoring and support.")
        
        # Create patient-friendly summary
        glucose = float(medical_data.get('glucose', 0) or 0)
        hba1c = float(medical_data.get('hba1c', 0) or 0)
        bp_systolic = float(medical_data.get('bp_systolic', 0) or 0)
        bp_diastolic = float(medical_data.get('bp_diastolic', 0) or 0)
        bmi = float(medical_data.get('bmi', 0) or 0)
        
        # Add more medical values
        cholesterol = float(medical_data.get('cholesterol', 0) or 0)
        ldl = float(medical_data.get('ldl', 0) or 0)
        hdl = float(medical_data.get('hdl', 0) or 0)
        triglycerides = float(medical_data.get('triglycerides', 0) or 0)
        creatinine = float(medical_data.get('creatinine', 0) or 0)
        
        # Debug: Log what medical data was extracted
        print(f"DEBUG: Medical data extracted: {medical_data}")
        print(f"DEBUG: Values found - Glucose: {glucose}, HbA1c: {hba1c}, Cholesterol: {cholesterol}, LDL: {ldl}, HDL: {hdl}, Triglycerides: {triglycerides}, Creatinine: {creatinine}")
        
        # Start with basic description
        summary = "This medical report contains your recent health test results. "
        
        # Add findings in simple language
        findings = []
        
        if glucose > 0:
            if glucose > 126:
                findings.append(f"your blood sugar level ({glucose} mg/dL) appears higher than normal")
            elif glucose < 70:
                findings.append(f"your blood sugar level ({glucose} mg/dL) appears lower than normal")
            else:
                findings.append(f"your blood sugar level ({glucose} mg/dL) is within the normal range")
        
        if hba1c > 0:
            if hba1c > 6.5:
                findings.append(f"your HbA1c ({hba1c}%) suggests elevated blood sugar over the past few months")
            elif hba1c < 5.7:
                findings.append(f"your HbA1c ({hba1c}%) indicates good blood sugar control")
            else:
                findings.append(f"your HbA1c ({hba1c}%) is slightly elevated but manageable")
        
        if bp_systolic > 0:
            if bp_systolic > 140 or bp_diastolic > 90:
                findings.append(f"your blood pressure ({bp_systolic}/{bp_diastolic} mmHg) is higher than the recommended range")
            elif bp_systolic < 90:
                findings.append(f"your blood pressure ({bp_systolic}/{bp_diastolic} mmHg) is lower than normal")
            else:
                findings.append(f"your blood pressure ({bp_systolic}/{bp_diastolic} mmHg) is in a healthy range")
        
        if bmi > 0:
            if bmi > 30:
                findings.append(f"your BMI ({bmi}) indicates excess weight that may affect your health")
            elif bmi < 18.5:
                findings.append(f"your BMI ({bmi}) suggests you may be underweight")
            else:
                findings.append(f"your BMI ({bmi}) is within a healthy range")
        
        # Add cholesterol findings
        if cholesterol > 0:
            if cholesterol > 240:
                findings.append(f"your total cholesterol ({cholesterol} mg/dL) is higher than recommended")
            elif cholesterol < 200:
                findings.append(f"your total cholesterol ({cholesterol} mg/dL) is in a good range")
            else:
                findings.append(f"your total cholesterol ({cholesterol} mg/dL) is slightly elevated")
        
        if ldl > 0:
            if ldl > 160:
                findings.append(f"your LDL cholesterol ({ldl} mg/dL) is high and may increase heart disease risk")
            elif ldl < 100:
                findings.append(f"your LDL cholesterol ({ldl} mg/dL) is at a healthy level")
            else:
                findings.append(f"your LDL cholesterol ({ldl} mg/dL) is moderately elevated")
        
        if hdl > 0:
            if hdl < 40:
                findings.append(f"your HDL cholesterol ({hdl} mg/dL) is lower than the protective level")
            else:
                findings.append(f"your HDL cholesterol ({hdl} mg/dL) is at a good protective level")
        
        if triglycerides > 0:
            if triglycerides > 200:
                findings.append(f"your triglycerides ({triglycerides} mg/dL) are elevated")
            elif triglycerides < 150:
                findings.append(f"your triglycerides ({triglycerides} mg/dL) are normal")
            else:
                findings.append(f"your triglycerides ({triglycerides} mg/dL) are borderline high")
        
        if creatinine > 0:
            if creatinine > 1.3:
                findings.append(f"your creatinine level ({creatinine} mg/dL) suggests reduced kidney function")
            else:
                findings.append(f"your creatinine level ({creatinine} mg/dL) indicates normal kidney function")
        
        # Add findings to summary
        if findings:
            summary += "The report shows that " + ", ".join(findings[:-1])
            if len(findings) > 1:
                summary += ", and " + findings[-1]
            else:
                summary += findings[0]
            summary += ". "
        
        # Add reassurance and disclaimer
        summary += "These results are for informational purposes only and are not a substitute for professional medical advice, diagnosis, or treatment. "
        summary += "Please consult with your healthcare provider to discuss these results and determine the best course of action for your health."
        
        return summary
    
    def _format_findings(self, findings: List[str]) -> str:
        """Format key findings in simple language"""
        if not findings:
            return "No significant findings to report."
        
        # Convert technical findings to simple language
        simple_findings = []
        for finding in findings:
            # Remove technical details and keep simple descriptions
            if "abnormal" in finding.lower():
                if "glucose" in finding.lower():
                    simple_findings.append("Blood sugar levels need attention")
                elif "blood_pressure" in finding.lower() or "bp" in finding.lower():
                    simple_findings.append("Blood pressure readings need monitoring")
                elif "bmi" in finding.lower():
                    simple_findings.append("Weight management may be beneficial")
                elif "cholesterol" in finding.lower():
                    simple_findings.append("Cholesterol levels need review")
                elif "ldl" in finding.lower():
                    simple_findings.append("Bad cholesterol needs attention")
                elif "hdl" in finding.lower():
                    simple_findings.append("Good cholesterol levels need review")
                elif "triglycerides" in finding.lower():
                    simple_findings.append("Triglyceride levels need monitoring")
                elif "creatinine" in finding.lower():
                    simple_findings.append("Kidney function needs review")
                else:
                    simple_findings.append("Some results need review by your doctor")
            else:
                simple_findings.append("Results appear normal")
        
        return "\n".join(f"• {finding}" for finding in simple_findings)
    
    def _format_risk_assessment(self, risk_assessment: Dict[str, str], 
                               medical_data: Dict[str, any]) -> str:
        """Format risk assessment in simple language"""
        assessment = "Health Status Overview:\n"
        
        # Convert technical risk to simple language
        simple_assessment = []
        
        for param, risk in risk_assessment.items():
            if isinstance(risk, dict):
                severity = risk.get('severity', 'low')
                if severity == 'high':
                    if 'glucose' in param.lower():
                        simple_assessment.append("Blood sugar needs attention")
                    elif 'blood_pressure' in param.lower() or 'bp' in param.lower():
                        simple_assessment.append("Blood pressure needs monitoring")
                    elif 'bmi' in param.lower():
                        simple_assessment.append("Weight management recommended")
                    else:
                        simple_assessment.append(f"{param.title()} needs review")
                elif severity == 'moderate':
                    simple_assessment.append(f"{param.title()} is slightly elevated")
                else:
                    simple_assessment.append(f"{param.title()} is normal")
        
        if simple_assessment:
            assessment += "\n".join(f"• {item}" for item in simple_assessment)
        else:
            assessment += "All health indicators appear normal"
            
        return assessment
    
    def _format_recommendations(self, recommendations: List[str]) -> str:
        """Format recommendations"""
        return "Recommendations:\n" + "\n".join(f"• {rec}" for rec in recommendations)
    
    def _create_follow_up_plan(self, risk_assessment: Dict[str, str], 
                              medical_data: Dict[str, any]) -> str:
        """Create follow-up plan"""
        high_risk_count = sum(1 for risk in risk_assessment.values() 
                            if risk in ['diabetes', 'obese', 'stage1', 'stage2'])
        
        # Convert medical data values to numbers for comparison
        glucose = float(medical_data.get('glucose', 0) or 0)
        hba1c = float(medical_data.get('hba1c', 0) or 0)
        bp_systolic = float(medical_data.get('bp_systolic', 0) or 0)
        bp_diastolic = float(medical_data.get('bp_diastolic', 0) or 0)
        bmi = float(medical_data.get('bmi', 0) or 0)
        
        # Create more specific follow-up based on actual medical data
        follow_up = "Follow-up: "
        
        # Check for specific conditions and create targeted follow-up
        if glucose > 180 or hba1c > 8.0:
            follow_up += "Urgent endocrinology referral within 1 week for severe hyperglycemia management. "
        elif glucose > 140 or hba1c > 7.0:
            follow_up += "Schedule endocrinology consultation within 2-4 weeks for diabetes management. "
        
        if bp_systolic > 140 or bp_diastolic > 90:
            follow_up += "Cardiology referral for hypertension evaluation within 4 weeks. "
        
        if bmi > 35:
            follow_up += "Bariatric surgery consultation within 4 weeks for severe obesity management. "
        elif bmi > 30:
            follow_up += "Nutritionist and weight management program within 4 weeks. "
        
        # Default follow-up based on risk count
        if high_risk_count >= 2:
            follow_up += "Schedule comprehensive evaluation within 2 weeks. "
        elif high_risk_count == 1:
            follow_up += "Schedule monitoring appointment in 4-6 weeks. "
        else:
            follow_up += "Routine follow-up in 3-6 months. "
            
        return follow_up
    
    def _create_patient_summary(self, risk_assessment: Dict[str, str], 
                              medical_data: Dict[str, any]) -> str:
        """Create patient-friendly summary"""
        summary = "Patient Health Summary\n\n"
        
        # Check if this is an adherence report
        if any(key in medical_data for key in ['adherence_rate_30_days', 'missed_doses_last_7_days', 'avg_delay_minutes']):
            adherence_rate = medical_data.get('adherence_rate_30_days', 100)
            missed_doses = medical_data.get('missed_doses_last_7_days', 0)
            
            if adherence_rate < 50:
                summary += "🔴 Your medication adherence needs immediate attention. "
                summary += f"You've only taken {adherence_rate:.1f}% of your doses this month. "
                summary += "Please contact your healthcare provider right away.\n\n"
            elif adherence_rate < 80:
                summary += "🟡 Your medication adherence could be better. "
                summary += f"You've taken {adherence_rate:.1f}% of your doses this month. "
                summary += "Let's work together to improve this.\n\n"
            else:
                summary += "🟢 Great job with your medications! "
                summary += f"You've taken {adherence_rate:.1f}% of your doses this month. "
                summary += "Keep up the good work!\n\n"
            
            summary += "Your Medication Details:\n"
            summary += f"• Adherence Rate: {adherence_rate:.1f}%\n"
            summary += f"• Missed Doses This Week: {missed_doses}\n"
            summary += f"• Average Delay: {medical_data.get('avg_delay_minutes', 0)} minutes\n"
            
            return summary
        
        # Original patient summary
        high_risk_items = [param for param, risk in risk_assessment.items() 
                          if isinstance(risk, dict) and risk.get('severity') == 'high']
        
        if high_risk_items:
            summary += "Your health report shows some areas that need attention. "
            summary += "Please follow up with your healthcare provider.\n\n"
        else:
            summary += "Your health report looks good! "
            summary += "Keep up the healthy habits and continue regular monitoring.\n\n"
        
        # Key numbers
        summary += "Your Key Health Numbers:\n"
        for param, risk in risk_assessment.items():
            if isinstance(risk, dict):
                value = medical_data.get(param, 'N/A')
                if param == 'blood_pressure':
                    value = f"{value['systolic']}/{value['diastolic']}"
                
                severity = risk.get('severity', 'low')
                status = "✅ Good" if severity == 'low' else "⚠️ Needs attention"
                summary += f"• {param.title()}: {value} - {status}\n"
        
        return summary

# Global summarizer instance
medical_summarizer = MedicalSummarizer()

def generate_enhanced_summary(text: str, patient_context: Dict[str, any] = None) -> Dict[str, str]:
    """
    Generate enhanced medical summary using NLP techniques
    """
    return medical_summarizer.generate_comprehensive_summary(text, patient_context)
