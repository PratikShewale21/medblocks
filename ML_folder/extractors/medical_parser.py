from typing import Dict, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class MedicalDataParser:
    def __init__(self):
        # Medical validation ranges
        self.validation_ranges = {
            'glucose': (40, 600),  # mg/dL
            'bmi': (10, 70),       # kg/m²
            'age': (0, 120),       # years
            'pregnancies': (0, 20), # count
            'insulin': (0, 1000),  # μU/mL
            'skin': (0, 100),      # mm
            'bp': (60, 200),       # systolic
            'dpf': (0.1, 2.5),     # diabetes pedigree function
            'missed_doses_last_7_days': (0, 7),
            'avg_delay_minutes': (0, 1440),  # max 24 hours
            'adherence_rate_30_days': (0, 100)
        }
        
        # Default values for missing data
        self.defaults = {
            'age': 35,
            'pregnancies': 0,  # Default for males/unknown
            'dpf': 0.5,        # Medical average
            'skin': 20,        # Average skin thickness
            'insulin': 80,     # Average insulin level
            'bp': 120,         # Average systolic
            'missed_doses_last_7_days': 0,
            'avg_delay_minutes': 0,
            'adherence_rate_30_days': 95.0
        }
    
    def validate_value(self, field: str, value: float) -> Tuple[bool, Optional[float]]:
        """Validate a medical value against expected ranges"""
        if field not in self.validation_ranges:
            return False, None
        
        min_val, max_val = self.validation_ranges[field]
        
        if min_val <= value <= max_val:
            return True, value
        else:
            logger.warning(f"Value {value} for {field} outside range [{min_val}, {max_val}]")
            return False, None
    
    def handle_missing_data(self, extracted_data: Dict[str, Optional[float]], 
                          required_fields: list) -> Dict:
        """Handle missing data with smart defaults and validation"""
        processed = {}
        missing_fields = []
        invalid_fields = []
        
        for field in required_fields:
            if field in extracted_data and extracted_data[field] is not None:
                # Validate extracted value
                is_valid, validated_value = self.validate_value(field, extracted_data[field])
                if is_valid:
                    processed[field] = validated_value
                else:
                    invalid_fields.append(field)
                    processed[field] = self.defaults.get(field)
            else:
                # Field missing - use default
                missing_fields.append(field)
                processed[field] = self.defaults.get(field)
        
        return {
            'processed_data': processed,
            'missing_fields': missing_fields,
            'invalid_fields': invalid_fields,
            'data_completeness': len([f for f in required_fields if f in extracted_data and extracted_data[f] is not None]) / len(required_fields) * 100
        }
    
    def prepare_diabetes_input(self, extracted_data: Dict[str, Optional[float]]) -> Dict:
        """Prepare diabetes prediction input with missing data handling"""
        required_fields = ['pregnancies', 'glucose', 'bp', 'skin', 'insulin', 'bmi', 'dpf', 'age']
        
        result = self.handle_missing_data(extracted_data, required_fields)
        
        # Calculate confidence score based on data completeness
        confidence = result['data_completeness'] / 100
        
        # Critical fields for diabetes prediction
        critical_fields = ['glucose', 'bmi', 'age']
        critical_missing = [f for f in critical_fields if f in result['missing_fields']]
        
        if critical_missing:
            confidence *= 0.5  # Reduce confidence if critical fields missing
        
        return {
            'input_data': result['processed_data'],
            'confidence': confidence,
            'missing_fields': result['missing_fields'],
            'invalid_fields': result['invalid_fields'],
            'data_completeness': result['data_completeness'],
            'can_predict': len(critical_missing) == 0,
            'warnings': self._generate_warnings(result, critical_missing)
        }
    
    def prepare_adherence_input(self, extracted_data: Dict[str, Optional[float]]) -> Dict:
        """Prepare adherence prediction input with missing data handling"""
        required_fields = ['missed_doses_last_7_days', 'avg_delay_minutes', 'adherence_rate_30_days']
        
        result = self.handle_missing_data(extracted_data, required_fields)
        
        # For adherence, all fields are somewhat important
        confidence = result['data_completeness'] / 100
        
        return {
            'input_data': result['processed_data'],
            'confidence': confidence,
            'missing_fields': result['missing_fields'],
            'invalid_fields': result['invalid_fields'],
            'data_completeness': result['data_completeness'],
            'can_predict': True,  # Can always predict with defaults
            'warnings': self._generate_warnings(result, [])
        }
    
    def _generate_warnings(self, result: Dict, critical_missing: list) -> list:
        """Generate appropriate warnings based on data quality"""
        warnings = []
        
        if result['missing_fields']:
            warnings.append(f"Missing fields: {', '.join(result['missing_fields'])}")
        
        if result['invalid_fields']:
            warnings.append(f"Invalid values found for: {', '.join(result['invalid_fields'])}")
        
        if critical_missing:
            warnings.append(f"Critical fields missing: {', '.join(critical_missing)} - prediction may be unreliable")
        
        if result['data_completeness'] < 50:
            warnings.append("Low data completeness - consider manual input for better accuracy")
        
        return warnings
