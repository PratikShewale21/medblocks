from .enhanced_summary import generate_enhanced_summary

def generate_summary(text: str, classification: str) -> str:
    """
    Enhanced medical report summarizer
    Converts large medical report text into structured summary
    """
    try:
        # Generate comprehensive summary
        summary = generate_enhanced_summary(text)
        
        # Return executive summary for backward compatibility
        return summary.get('executive_summary', 'Unable to generate summary')
        
    except Exception as e:
        # Fallback to basic summary if enhanced fails
        text = text.strip()
        if classification.upper() == "NORMAL":
            return "NORMAL REPORT SUMMARY: All observed parameters are within normal reference ranges. No critical abnormalities were detected."
        elif classification.upper() == "ABNORMAL":
            return "ABNORMAL REPORT SUMMARY: Some medical parameters fall outside the normal range. Further clinical evaluation advised."
        else:
            return "Unable to classify the report. Please consult a doctor."