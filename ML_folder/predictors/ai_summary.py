import json
from typing import Dict, List, Any
from datetime import datetime
import re

class AISummaryGenerator:
    """
    AI-powered medical summary generator with clinical context
    """
    
    def __init__(self):
        # Clinical knowledge base
        self.clinical_guidelines = {
            'diabetes': {
                'diagnostic_criteria': {
                    'fasting_glucose': {'normal': '<100', 'prediabetes': '100-125', 'diabetes': '≥126'},
                    'hba1c': {'normal': '<5.7%', 'prediabetes': '5.7-6.4%', 'diabetes': '≥6.5%'},
                    'random_glucose': {'normal': '<140', 'diabetes': '≥200'}
                },
                'treatment_goals': {
                    'fasting_glucose': '80-130 mg/dL',
                    'postprandial_glucose': '<180 mg/dL',
                    'hba1c': '<7.0%',
                    'blood_pressure': '<130/80 mmHg',
                    'ldl_cholesterol': '<100 mg/dL'
                },
                'complications_risk': {
                    'microvascular': ['retinopathy', 'nephropathy', 'neuropathy'],
                    'macrovascular': ['heart_disease', 'stroke', 'peripheral_artery_disease']
                }
            },
            'hypertension': {
                'classification': {
                    'normal': '<120/80',
                    'elevated': '120-129/<80',
                    'stage1': '130-139/80-89',
                    'stage2': '≥140/90'
                },
                'treatment_goals': '<130/80 mmHg',
                'risk_factors': ['age', 'obesity', 'diabetes', 'kidney_disease']
            },
            'obesity': {
                'classification': {
                    'underweight': '<18.5',
                    'normal': '18.5-24.9',
                    'overweight': '25-29.9',
                    'obese': '≥30'
                },
                'health_risks': ['diabetes', 'heart_disease', 'stroke', 'certain_cancers'],
                'treatment_goals': '5-10% weight loss for health benefits'
            }
        }
        
        # Medical terminology mapping
        self.terminology_map = {
            'glucose': ['blood sugar', 'blood glucose', 'fasting plasma glucose', 'fpg'],
            'hba1c': ['hemoglobin a1c', 'glycosylated hemoglobin', 'a1c'],
            'bmi': ['body mass index', 'weight status'],
            'bp': ['blood pressure', 'hypertension', 'systolic/diastolic'],
            'cholesterol': ['lipids', 'ldl', 'hdl', 'triglycerides'],
            'kidney': ['renal', 'creatinine', 'gfr', 'bun']
        }
        
        # Alert severity levels
        self.severity_levels = {
            'critical': {'color': '🔴', 'action': 'Immediate medical attention required'},
            'high': {'color': '🟠', 'action': 'Medical consultation recommended within 1 week'},
            'moderate': {'color': '🟡', 'action': 'Monitor and follow up in 2-4 weeks'},
            'low': {'color': '🟢', 'action': 'Routine monitoring'}
        }
    
    def analyze_medical_report(self, text: str, patient_history: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Comprehensive medical report analysis
        """
        # Extract all medical values
        extracted_data = self._extract_comprehensive_data(text)
        
        # Analyze each parameter against clinical guidelines
        parameter_analysis = self._analyze_parameters(extracted_data)
        
        # Assess overall risk
        risk_assessment = self._assess_overall_risk(parameter_analysis, patient_history)
        
        # Generate clinical insights
        clinical_insights = self._generate_clinical_insights(parameter_analysis, risk_assessment)
        
        # Create action plan
        action_plan = self._create_action_plan(risk_assessment, parameter_analysis)
        
        # Generate patient-friendly summary
        patient_summary = self._generate_patient_summary(parameter_analysis, risk_assessment)
        
        return {
            'extracted_data': extracted_data,
            'parameter_analysis': parameter_analysis,
            'risk_assessment': risk_assessment,
            'clinical_insights': clinical_insights,
            'action_plan': action_plan,
            'patient_summary': patient_summary,
            'timestamp': datetime.now().isoformat()
        }
    
    def _extract_comprehensive_data(self, text: str) -> Dict[str, Any]:
        """Extract comprehensive medical data from text"""
        data = {}
        
        # Glucose measurements
        glucose_patterns = [
            r'fasting\s*(?:plasma\s*)?glucose[:\s]*(\d+\.?\d*)\s*(?:mg\/dl|mmol\/l)?',
            r'random\s*glucose[:\s]*(\d+\.?\d*)\s*(?:mg\/dl|mmol\/l)?',
            r'glucose[:\s]*(\d+\.?\d*)\s*(?:mg\/dl|mmol\/l)?',
            r'blood\s*sugar[:\s]*(\d+\.?\d*)\s*(?:mg\/dl|mmol\/l)?'
        ]
        
        for pattern in glucose_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                data['glucose'] = float(match.group(1))
                break
        
        # HbA1c
        hba1c_match = re.search(r'hba1c|hemoglobin\s*a1c|a1c[:\s]*(\d+\.?\d*)\s*%?', text, re.IGNORECASE)
        if hba1c_match:
            data['hba1c'] = float(hba1c_match.group(1)) if hba1c_match.groups() else None
        
        # Blood pressure
        bp_match = re.search(r'bp|blood\s*pressure[:\s]*(\d+)[\/\s]*(\d+)', text, re.IGNORECASE)
        if bp_match:
            data['blood_pressure'] = {
                'systolic': int(bp_match.group(1)),
                'diastolic': int(bp_match.group(2))
            }
        
        # BMI
        bmi_match = re.search(r'bmi|body\s*mass\s*index[:\s]*(\d+\.?\d*)', text, re.IGNORECASE)
        if bmi_match:
            data['bmi'] = float(bmi_match.group(1))
        
        # Cholesterol
        cholesterol_patterns = {
            'total_cholesterol': r'total\s*cholesterol[:\s]*(\d+\.?\d*)',
            'ldl': r'ldl[:\s]*(\d+\.?\d*)',
            'hdl': r'hdl[:\s]*(\d+\.?\d*)',
            'triglycerides': r'triglycerides[:\s]*(\d+\.?\d*)'
        }
        
        for lipid, pattern in cholesterol_patterns.items():
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                data[lipid] = float(match.group(1))
        
        # Kidney function
        kidney_patterns = {
            'creatinine': r'creatinine[:\s]*(\d+\.?\d*)',
            'gfr': r'gfr[:\s]*(\d+\.?\d*)',
            'bun': r'bun[:\s]*(\d+\.?\d*)'
        }
        
        for test, pattern in kidney_patterns.items():
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                data[test] = float(match.group(1))
        
        # Extract medications mentioned
        medication_patterns = [
            r'(metformin|insulin|lisinopril|atorvastatin|aspirin|hydrochlorothiazide)',
            r'medications?:?\s*([^.]+)',
            r'current\s*medications?:?\s*([^.]+)'
        ]
        
        for pattern in medication_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                data['medications'] = match.group(1).strip()
                break
        
        return data
    
    def _analyze_parameters(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze each parameter against clinical guidelines"""
        analysis = {}
        
        # Glucose analysis
        if 'glucose' in data:
            glucose = data['glucose']
            if glucose < 70:
                analysis['glucose'] = {'status': 'low', 'severity': 'moderate', 
                                     'interpretation': 'Hypoglycemia - requires attention'}
            elif glucose < 100:
                analysis['glucose'] = {'status': 'normal', 'severity': 'low',
                                     'interpretation': 'Normal fasting glucose'}
            elif glucose < 126:
                analysis['glucose'] = {'status': 'prediabetes', 'severity': 'moderate',
                                     'interpretation': 'Prediabetes range - lifestyle intervention needed'}
            else:
                analysis['glucose'] = {'status': 'diabetes', 'severity': 'high',
                                     'interpretation': 'Diabetic range - medical treatment required'}
        
        # HbA1c analysis
        if 'hba1c' in data:
            hba1c = data['hba1c']
            if hba1c < 5.7:
                analysis['hba1c'] = {'status': 'normal', 'severity': 'low',
                                   'interpretation': 'Normal HbA1c'}
            elif hba1c < 6.5:
                analysis['hba1c'] = {'status': 'prediabetes', 'severity': 'moderate',
                                   'interpretation': 'Prediabetes - increased diabetes risk'}
            else:
                analysis['hba1c'] = {'status': 'diabetes', 'severity': 'high',
                                   'interpretation': 'Diabetic - requires treatment'}
        
        # Blood pressure analysis
        if 'blood_pressure' in data:
            bp = data['blood_pressure']
            systolic, diastolic = bp['systolic'], bp['diastolic']
            
            if systolic < 90 or diastolic < 60:
                analysis['blood_pressure'] = {'status': 'low', 'severity': 'moderate',
                                            'interpretation': 'Low blood pressure - monitor'}
            elif systolic <= 120 and diastolic <= 80:
                analysis['blood_pressure'] = {'status': 'normal', 'severity': 'low',
                                            'interpretation': 'Normal blood pressure'}
            elif systolic <= 129 and diastolic <= 80:
                analysis['blood_pressure'] = {'status': 'elevated', 'severity': 'moderate',
                                            'interpretation': 'Elevated blood pressure - lifestyle changes'}
            elif systolic <= 139 or diastolic <= 89:
                analysis['blood_pressure'] = {'status': 'stage1', 'severity': 'high',
                                            'interpretation': 'Stage 1 hypertension - treatment considered'}
            else:
                analysis['blood_pressure'] = {'status': 'stage2', 'severity': 'high',
                                            'interpretation': 'Stage 2 hypertension - treatment required'}
        
        # BMI analysis
        if 'bmi' in data:
            bmi = data['bmi']
            if bmi < 18.5:
                analysis['bmi'] = {'status': 'underweight', 'severity': 'moderate',
                                 'interpretation': 'Underweight - nutritional assessment needed'}
            elif bmi < 25:
                analysis['bmi'] = {'status': 'normal', 'severity': 'low',
                                 'interpretation': 'Normal weight'}
            elif bmi < 30:
                analysis['bmi'] = {'status': 'overweight', 'severity': 'moderate',
                                 'interpretation': 'Overweight - weight management recommended'}
            else:
                analysis['bmi'] = {'status': 'obese', 'severity': 'high',
                                 'interpretation': 'Obese - comprehensive weight management needed'}
        
        return analysis
    
    def _assess_overall_risk(self, parameter_analysis: Dict[str, Any], 
                           patient_history: Dict[str, Any] = None) -> Dict[str, Any]:
        """Assess overall patient risk"""
        high_risk_count = 0
        moderate_risk_count = 0
        critical_findings = []
        
        for param, analysis in parameter_analysis.items():
            severity = analysis.get('severity', 'low')
            if severity == 'high':
                high_risk_count += 1
                critical_findings.append(f"{param}: {analysis['interpretation']}")
            elif severity == 'moderate':
                moderate_risk_count += 1
        
        # Determine overall risk level
        if high_risk_count >= 2:
            overall_risk = 'critical'
            urgency = 'Immediate medical attention required'
        elif high_risk_count == 1:
            overall_risk = 'high'
            urgency = 'Medical consultation recommended within 1 week'
        elif moderate_risk_count >= 2:
            overall_risk = 'moderate'
            urgency = 'Follow-up recommended in 2-4 weeks'
        else:
            overall_risk = 'low'
            urgency = 'Routine monitoring'
        
        return {
            'overall_risk': overall_risk,
            'urgency': urgency,
            'high_risk_count': high_risk_count,
            'moderate_risk_count': moderate_risk_count,
            'critical_findings': critical_findings,
            'risk_factors': self._identify_risk_factors(parameter_analysis)
        }
    
    def _identify_risk_factors(self, parameter_analysis: Dict[str, Any]) -> List[str]:
        """Identify specific risk factors"""
        risk_factors = []
        
        for param, analysis in parameter_analysis.items():
            if analysis.get('severity') in ['high', 'moderate']:
                if param == 'glucose' and analysis['status'] in ['prediabetes', 'diabetes']:
                    risk_factors.append('Diabetes mellitus')
                elif param == 'blood_pressure' and analysis['status'] in ['elevated', 'stage1', 'stage2']:
                    risk_factors.append('Hypertension')
                elif param == 'bmi' and analysis['status'] in ['overweight', 'obese']:
                    risk_factors.append('Obesity')
        
        return risk_factors
    
    def _generate_clinical_insights(self, parameter_analysis: Dict[str, Any], 
                                  risk_assessment: Dict[str, Any]) -> List[str]:
        """Generate clinical insights for healthcare providers"""
        insights = []
        
        # Metabolic syndrome assessment
        metabolic_criteria = 0
        if 'blood_pressure' in parameter_analysis:
            bp_status = parameter_analysis['blood_pressure']['status']
            if bp_status in ['elevated', 'stage1', 'stage2']:
                metabolic_criteria += 1
        
        if 'glucose' in parameter_analysis:
            glucose_status = parameter_analysis['glucose']['status']
            if glucose_status in ['prediabetes', 'diabetes']:
                metabolic_criteria += 1
        
        if 'bmi' in parameter_analysis:
            bmi_status = parameter_analysis['bmi']['status']
            if bmi_status in ['overweight', 'obese']:
                metabolic_criteria += 1
        
        if metabolic_criteria >= 3:
            insights.append("Patient meets criteria for metabolic syndrome - comprehensive cardiovascular risk assessment recommended")
        
        # Diabetes risk assessment
        if 'glucose' in parameter_analysis and 'hba1c' in parameter_analysis:
            glucose_status = parameter_analysis['glucose']['status']
            hba1c_status = parameter_analysis['hba1c']['status']
            
            if glucose_status == 'prediabetes' and hba1c_status == 'prediabetes':
                insights.append("Both fasting glucose and HbA1c in prediabetes range - high risk for progression to diabetes")
            elif glucose_status == 'diabetes' or hba1c_status == 'diabetes':
                insights.append("Diabetes confirmed - comprehensive management plan needed including lifestyle modification and medication")
        
        # Cardiovascular risk
        if 'blood_pressure' in parameter_analysis:
            bp_status = parameter_analysis['blood_pressure']['status']
            if bp_status in ['stage1', 'stage2']:
                insights.append("Hypertension increases cardiovascular risk - consider statin therapy based on risk calculator")
        
        return insights
    
    def _create_action_plan(self, risk_assessment: Dict[str, Any], 
                          parameter_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Create comprehensive action plan"""
        plan = {
            'immediate_actions': [],
            'short_term_goals': [],
            'long_term_management': [],
            'monitoring_plan': [],
            'referrals_needed': []
        }
        
        # Immediate actions based on severity
        if risk_assessment['overall_risk'] == 'critical':
            plan['immediate_actions'].extend([
                "Schedule urgent medical consultation",
                "Review and adjust current medications",
                "Consider emergency department evaluation if symptomatic"
            ])
        
        # Parameter-specific actions
        for param, analysis in parameter_analysis.items():
            if analysis['severity'] == 'high':
                if param == 'glucose':
                    plan['immediate_actions'].append("Initiate diabetes medication if not already prescribed")
                    plan['short_term_goals'].append("Achieve fasting glucose 80-130 mg/dL")
                    plan['monitoring_plan'].append("Check fasting glucose daily for 2 weeks")
                
                elif param == 'blood_pressure':
                    plan['immediate_actions'].append("Start or adjust antihypertensive medication")
                    plan['short_term_goals'].append("Achieve BP <130/80 mmHg")
                    plan['monitoring_plan'].append("Home BP monitoring twice daily")
                
                elif param == 'bmi':
                    plan['short_term_goals'].append("5-10% weight loss")
                    plan['referrals_needed'].append("Nutritionist consultation")
        
        # General recommendations
        plan['long_term_management'].extend([
            "Regular exercise (150 minutes/week moderate intensity)",
            "Heart-healthy diet (Mediterranean or DASH)",
            "Stress management techniques",
            "Adequate sleep (7-9 hours/night)"
        ])
        
        return plan
    
    def _generate_patient_summary(self, parameter_analysis: Dict[str, Any], 
                                 risk_assessment: Dict[str, Any]) -> str:
        """Generate patient-friendly summary"""
        summary = "Your Health Report Summary\n\n"
        
        # Overall assessment
        if risk_assessment['overall_risk'] == 'low':
            summary += "🟢 Good News: Your test results are mostly normal. Keep up the healthy habits!\n\n"
        elif risk_assessment['overall_risk'] == 'moderate':
            summary += "🟡 Some Attention Needed: A few areas need monitoring and lifestyle changes.\n\n"
        else:
            summary += "🔴 Action Required: Some results need immediate medical attention.\n\n"
        
        # Key results
        summary += "Your Key Results:\n"
        for param, analysis in parameter_analysis.items():
            status_icon = "✅" if analysis['severity'] == 'low' else "⚠️" if analysis['severity'] == 'moderate' else "🚨"
            summary += f"{status_icon} {param.title()}: {analysis['interpretation']}\n"
        
        # Next steps
        summary += f"\nNext Steps: {risk_assessment['urgency']}\n"
        
        return summary

# Global AI summarizer instance
ai_summarizer = AISummaryGenerator()

def generate_ai_summary(text: str, patient_history: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Generate AI-powered medical summary
    """
    return ai_summarizer.analyze_medical_report(text, patient_history)
