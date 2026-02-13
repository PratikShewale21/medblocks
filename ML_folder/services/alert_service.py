from typing import Dict, List, Optional
from datetime import datetime, timedelta
import logging
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class AlertType(Enum):
    HIGH_RISK = "high_risk"
    MEDIUM_RISK = "medium_risk"
    MEDICATION_MISSED = "medication_missed"
    ADHERENCE_LOW = "adherence_low"
    WEEKLY_REPORT = "weekly_report"
    ACHIEVEMENT = "achievement"

class AlertPriority(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

@dataclass
class Alert:
    id: str
    type: AlertType
    priority: AlertPriority
    title: str
    message: str
    patient_id: str
    timestamp: datetime
    data: Dict
    action_required: bool
    acknowledged: bool = False

class AlertService:
    def __init__(self):
        self.alerts: List[Alert] = []
        self.alert_rules = self._initialize_rules()
    
    def _initialize_rules(self) -> Dict:
        return {
            'diabetes_risk': {
                'high': {'threshold': 70, 'priority': AlertPriority.CRITICAL},
                'medium': {'threshold': 40, 'priority': AlertPriority.HIGH}
            },
            'adherence_rate': {
                'low': {'threshold': 50, 'priority': AlertPriority.HIGH},
                'medium': {'threshold': 80, 'priority': AlertPriority.MEDIUM}
            },
            'missed_doses': {
                'high': {'threshold': 5, 'priority': AlertPriority.HIGH},
                'medium': {'threshold': 3, 'priority': AlertPriority.MEDIUM}
            }
        }
    
    def check_diabetes_risk(self, patient_id: str, risk_percentage: float, confidence: float) -> List[Alert]:
        alerts = []
        
        if confidence < 0.5:
            return alerts  # Don't alert on low confidence predictions
        
        rules = self.alert_rules['diabetes_risk']
        
        if risk_percentage >= rules['high']['threshold']:
            alerts.append(Alert(
                id=f"diabetes_high_{datetime.now().timestamp()}",
                type=AlertType.HIGH_RISK,
                priority=rules['high']['priority'],
                title="🚨 High Diabetes Risk Detected",
                message=f"Patient shows {risk_percentage:.1f}% diabetes risk. Immediate medical consultation recommended.",
                patient_id=patient_id,
                timestamp=datetime.now(),
                data={'risk_percentage': risk_percentage, 'confidence': confidence},
                action_required=True
            ))
        elif risk_percentage >= rules['medium']['threshold']:
            alerts.append(Alert(
                id=f"diabetes_medium_{datetime.now().timestamp()}",
                type=AlertType.MEDIUM_RISK,
                priority=rules['medium']['priority'],
                title="⚠️ Moderate Diabetes Risk",
                message=f"Patient shows {risk_percentage:.1f}% diabetes risk. Regular monitoring advised.",
                patient_id=patient_id,
                timestamp=datetime.now(),
                data={'risk_percentage': risk_percentage, 'confidence': confidence},
                action_required=True
            ))
        
        return alerts
    
    def check_adherence(self, patient_id: str, adherence_data: Dict) -> List[Alert]:
        alerts = []
        adherence_rate = adherence_data.get('adherence_rate_30_days', 100)
        missed_doses = adherence_data.get('missed_doses_last_7_days', 0)
        
        # Check adherence rate
        if adherence_rate < self.alert_rules['adherence_rate']['low']['threshold']:
            alerts.append(Alert(
                id=f"adherence_low_{datetime.now().timestamp()}",
                type=AlertType.ADHERENCE_LOW,
                priority=AlertPriority.HIGH,
                title="💊 Low Medication Adherence",
                message=f"Patient adherence is only {adherence_rate:.1f}%. Intervention recommended.",
                patient_id=patient_id,
                timestamp=datetime.now(),
                data=adherence_data,
                action_required=True
            ))
        elif adherence_rate < self.alert_rules['adherence_rate']['medium']['threshold']:
            alerts.append(Alert(
                id=f"adherence_medium_{datetime.now().timestamp()}",
                type=AlertType.ADHERENCE_LOW,
                priority=AlertPriority.MEDIUM,
                title="💊 Moderate Adherence Issues",
                message=f"Patient adherence is {adherence_rate:.1f}%. Consider reminder system.",
                patient_id=patient_id,
                timestamp=datetime.now(),
                data=adherence_data,
                action_required=True
            ))
        
        # Check missed doses
        if missed_doses >= self.alert_rules['missed_doses']['high']['threshold']:
            alerts.append(Alert(
                id=f"missed_high_{datetime.now().timestamp()}",
                type=AlertType.MEDICATION_MISSED,
                priority=AlertPriority.HIGH,
                title="❌ Multiple Missed Doses",
                message=f"Patient missed {missed_doses} doses in the last week. Follow up required.",
                patient_id=patient_id,
                timestamp=datetime.now(),
                data=adherence_data,
                action_required=True
            ))
        elif missed_doses >= self.alert_rules['missed_doses']['medium']['threshold']:
            alerts.append(Alert(
                id=f"missed_medium_{datetime.now().timestamp()}",
                type=AlertType.MEDICATION_MISSED,
                priority=AlertPriority.MEDIUM,
                title="⚠️ Some Missed Doses",
                message=f"Patient missed {missed_doses} doses this week. Check adherence barriers.",
                patient_id=patient_id,
                timestamp=datetime.now(),
                data=adherence_data,
                action_required=True
            ))
        
        return alerts
    
    def create_weekly_report(self, patient_id: str, health_data: Dict) -> Alert:
        return Alert(
            id=f"weekly_report_{datetime.now().timestamp()}",
            type=AlertType.WEEKLY_REPORT,
            priority=AlertPriority.LOW,
            title="📊 Weekly Health Report",
            message=f"Weekly summary: Diabetes risk {health_data.get('diabetes_risk', 'Unknown')}, Adherence {health_data.get('adherence_rate', 0)}%",
            patient_id=patient_id,
            timestamp=datetime.now(),
            data=health_data,
            action_required=False
        )
    
    def create_achievement_alert(self, patient_id: str, achievement: str) -> Alert:
        return Alert(
            id=f"achievement_{datetime.now().timestamp()}",
            type=AlertType.ACHIEVEMENT,
            priority=AlertPriority.LOW,
            title="🏆 Achievement Unlocked!",
            message=f"Congratulations! {achievement}",
            patient_id=patient_id,
            timestamp=datetime.now(),
            data={'achievement': achievement},
            action_required=False
        )
    
    def get_active_alerts(self, patient_id: Optional[str] = None) -> List[Alert]:
        alerts = self.alerts
        if patient_id:
            alerts = [a for a in alerts if a.patient_id == patient_id]
        
        # Return unacknowledged alerts, sorted by priority and timestamp
        return sorted(
            [a for a in alerts if not a.acknowledged],
            key=lambda x: (x.priority.value, x.timestamp),
            reverse=True
        )
    
    def acknowledge_alert(self, alert_id: str) -> bool:
        for alert in self.alerts:
            if alert.id == alert_id:
                alert.acknowledged = True
                logger.info(f"Alert {alert_id} acknowledged")
                return True
        return False
    
    def add_alert(self, alert: Alert):
        self.alerts.append(alert)
        logger.info(f"New alert created: {alert.title} for patient {alert.patient_id}")
    
    def cleanup_old_alerts(self, days: int = 30):
        cutoff_date = datetime.now() - timedelta(days=days)
        self.alerts = [a for a in self.alerts if a.timestamp > cutoff_date]
        logger.info(f"Cleaned up alerts older than {days} days")

# Global alert service instance
alert_service = AlertService()
