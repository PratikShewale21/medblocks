def generate_summary(text: str, classification: str) -> str:
    """
    Rule-based + NLP-style summary generator
    """

    text = text.strip()

    if classification.upper() == "NORMAL":
        return (
            "NORMAL REPORT SUMMARY:\n"
            "All observed parameters are within normal reference ranges. "
            "No critical abnormalities were detected. "
            "Continue routine monitoring and maintain a healthy lifestyle."
        )

    elif classification.upper() == "ABNORMAL":
        return (
            "ABNORMAL REPORT SUMMARY:\n"
            "Some medical parameters fall outside the normal range. "
            "Further clinical evaluation and follow-up testing are advised. "
            "Consult a healthcare professional for appropriate treatment."
        )

    else:
        return "Unable to classify the report. Please consult a doctor."