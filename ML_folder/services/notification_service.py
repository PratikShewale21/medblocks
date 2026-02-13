import smtplib
import requests
try:
    from email.mime.text import MimeText
    from email.mime.multipart import MimeMultipart
except ImportError:
    MimeText = None
    MimeMultipart = None
from typing import Dict, List
import logging
from datetime import datetime
import json

logger = logging.getLogger(__name__)

class NotificationService:
    def __init__(self):
        self.email_config = {
            'smtp_server': 'smtp.gmail.com',
            'smtp_port': 587,
            'username': 'your-email@gmail.com',  # Configure this
            'password': 'your-app-password'    # Configure this
        }
        self.webhook_urls = {
            'slack': 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK',  # Configure this
            'teams': 'https://outlook.office.com/webhook/YOUR/TEAMS/WEBHOOK'  # Configure this
        }
    
    def send_email(self, to_email: str, subject: str, message: str, priority: str = 'medium') -> bool:
        """Send email notification"""
        if not MimeText or not MimeMultipart:
            logger.warning("Email modules not available")
            return False
            
        try:
            msg = MimeMultipart()
            msg['From'] = self.email_config['username']
            msg['To'] = to_email
            msg['Subject'] = f"[{priority.upper()}] {subject}"
            
            # Add priority indicator
            priority_emoji = {
                'critical': '🚨',
                'high': '⚠️',
                'medium': '📋',
                'low': 'ℹ️'
            }
            
            body = f"{priority_emoji.get(priority, '')} {message}"
            msg.attach(MimeText(body, 'plain'))
            
            server = smtplib.SMTP(self.email_config['smtp_server'], self.email_config['smtp_port'])
            server.starttls()
            server.login(self.email_config['username'], self.email_config['password'])
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Email sent to {to_email}: {subject}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False
    
    def send_slack_notification(self, message: str, priority: str = 'medium') -> bool:
        """Send Slack notification"""
        try:
            if not self.webhook_urls['slack'] or 'YOUR' in self.webhook_urls['slack']:
                logger.warning("Slack webhook not configured")
                return False
            
            priority_colors = {
                'critical': '#FF0000',  # Red
                'high': '#FFA500',     # Orange
                'medium': '#FFFF00',    # Yellow
                'low': '#00FF00'       # Green
            }
            
            payload = {
                "attachments": [{
                    "color": priority_colors.get(priority, '#FFFF00'),
                    "title": f"Health Alert - {priority.upper()}",
                    "text": message,
                    "ts": datetime.now().timestamp()
                }]
            }
            
            response = requests.post(self.webhook_urls['slack'], json=payload)
            if response.status_code == 200:
                logger.info("Slack notification sent successfully")
                return True
            else:
                logger.error(f"Slack notification failed: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to send Slack notification: {e}")
            return False
    
    def send_teams_notification(self, message: str, priority: str = 'medium') -> bool:
        """Send Microsoft Teams notification"""
        try:
            if not self.webhook_urls['teams'] or 'YOUR' in self.webhook_urls['teams']:
                logger.warning("Teams webhook not configured")
                return False
            
            priority_colors = {
                'critical': 'attention',
                'high': 'attention',
                'medium': 'good',
                'low': 'good'
            }
            
            payload = {
                "@type": "MessageCard",
                "@context": "http://schema.org/extensions",
                "themeColor": "FF0000" if priority in ['critical', 'high'] else "00FF00",
                "summary": f"Health Alert - {priority.upper()}",
                "sections": [{
                    "activityTitle": "Health Monitoring System",
                    "activitySubtitle": f"Priority: {priority.upper()}",
                    "text": message,
                    "facts": [{
                        "name": "Time",
                        "value": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    }],
                    "markdown": True
                }]
            }
            
            response = requests.post(self.webhook_urls['teams'], json=payload)
            if response.status_code == 200:
                logger.info("Teams notification sent successfully")
                return True
            else:
                logger.error(f"Teams notification failed: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to send Teams notification: {e}")
            return False
    
    def send_sms(self, phone_number: str, message: str) -> bool:
        """Send SMS notification (requires SMS service integration)"""
        # This would require integration with SMS service like Twilio, AWS SNS, etc.
        # Example implementation placeholder:
        logger.info(f"SMS would be sent to {phone_number}: {message}")
        return True
    
    def send_push_notification(self, device_token: str, title: str, message: str) -> bool:
        """Send push notification to mobile app"""
        # This would require integration with push notification service
        # Example implementation placeholder:
        logger.info(f"Push notification would be sent to {device_token}: {title} - {message}")
        return True
    
    def send_notification(self, notification_config: Dict, alert_data: Dict) -> bool:
        """Send notification through configured channels"""
        success = True
        
        channels = notification_config.get('channels', ['email'])
        priority = alert_data.get('priority', 'medium')
        message = alert_data.get('message', '')
        title = alert_data.get('title', 'Health Alert')
        
        for channel in channels:
            if channel == 'email':
                email_result = self.send_email(
                    to_email=notification_config.get('email'),
                    subject=title,
                    message=message,
                    priority=priority
                )
                success = success and email_result
                
            elif channel == 'slack':
                slack_result = self.send_slack_notification(message, priority)
                success = success and slack_result
                
            elif channel == 'teams':
                teams_result = self.send_teams_notification(message, priority)
                success = success and teams_result
                
            elif channel == 'sms':
                sms_result = self.send_sms(
                    phone_number=notification_config.get('phone'),
                    message=f"{title}: {message}"
                )
                success = success and sms_result
                
            elif channel == 'push':
                push_result = self.send_push_notification(
                    device_token=notification_config.get('device_token'),
                    title=title,
                    message=message
                )
                success = success and push_result
        
        return success

# Global notification service instance
notification_service = NotificationService()
