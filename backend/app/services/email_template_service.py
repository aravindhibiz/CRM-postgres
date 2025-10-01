import re
import json
from typing import Dict, Any, Optional, List
from datetime import datetime
from sqlalchemy.orm import Session
from ..models.email_template import EmailTemplate, EmailLog, TemplateStatus
from ..models.user import UserProfile
from ..models.contact import Contact
from ..models.company import Company
from ..models.deal import Deal


class EmailTemplateService:
    """Service for processing email templates and merge fields"""

    @staticmethod
    def get_available_merge_fields() -> List[Dict[str, str]]:
        """Get list of available merge fields with descriptions"""
        return [
            {"field": "{{first_name}}",
                "description": "Contact first name", "example": "John"},
            {"field": "{{last_name}}",
                "description": "Contact last name", "example": "Doe"},
            {"field": "{{full_name}}", "description": "Contact full name",
                "example": "John Doe"},
            {"field": "{{email}}", "description": "Contact email address",
                "example": "john@example.com"},
            {"field": "{{company_name}}",
                "description": "Contact company name", "example": "Acme Corp"},
            {"field": "{{phone}}", "description": "Contact phone number",
                "example": "+1-555-123-4567"},
            {"field": "{{position}}", "description": "Contact position/title",
                "example": "Sales Manager"},
            {"field": "{{deal_name}}", "description": "Deal title",
                "example": "Q4 Partnership Deal"},
            {"field": "{{deal_value}}",
                "description": "Deal value", "example": "$50,000"},
            {"field": "{{deal_stage}}",
                "description": "Deal stage", "example": "Proposal"},
            {"field": "{{sender_name}}", "description": "Your name",
                "example": "Jane Smith"},
            {"field": "{{sender_email}}", "description": "Your email",
                "example": "jane@company.com"},
            {"field": "{{sender_title}}", "description": "Your title",
                "example": "Account Manager"},
            {"field": "{{current_date}}", "description": "Current date",
                "example": "October 1, 2025"},
            {"field": "{{company_address}}", "description": "Company address",
                "example": "123 Business St"},
            {"field": "{{company_phone}}", "description": "Company phone",
                "example": "+1-555-987-6543"},
        ]

    @staticmethod
    def process_template(
        template: EmailTemplate,
        merge_data: Dict[str, Any],
        db: Session,
        contact_id: Optional[str] = None,
        deal_id: Optional[str] = None,
        sender: Optional[UserProfile] = None
    ) -> Dict[str, str]:
        """Process template by replacing merge fields with actual data"""

        # Start with template content
        processed_subject = template.subject
        processed_content = template.content

        # Get contact data if contact_id provided
        contact_data = {}
        if contact_id:
            contact = db.query(Contact).filter(
                Contact.id == contact_id).first()
            if contact:
                contact_data = {
                    "first_name": contact.first_name or "",
                    "last_name": contact.last_name or "",
                    "full_name": f"{contact.first_name or ''} {contact.last_name or ''}".strip(),
                    "email": contact.email or "",
                    "phone": contact.phone or "",
                    "position": contact.position or "",
                    "company_name": contact.company.name if contact.company else "",
                    "company_address": contact.company.address if contact.company else "",
                    "company_phone": contact.company.phone if contact.company else "",
                }

        # Get deal data if deal_id provided
        deal_data = {}
        if deal_id:
            deal = db.query(Deal).filter(Deal.id == deal_id).first()
            if deal:
                deal_data = {
                    "deal_name": deal.name or "",
                    "deal_value": f"${deal.value:,.2f}" if deal.value else "",
                    "deal_stage": deal.stage or "",
                }

        # Get sender data
        sender_data = {}
        if sender:
            sender_data = {
                "sender_name": f"{sender.first_name or ''} {sender.last_name or ''}".strip(),
                "sender_email": sender.email or "",
                "sender_title": sender.role or "",
            }

        # Current date
        current_data = {
            "current_date": datetime.now().strftime("%B %d, %Y"),
        }

        # Combine all data sources (merge_data takes precedence)
        all_data = {**contact_data, **deal_data, **
                    sender_data, **current_data, **merge_data}

        # Replace merge fields in subject and content
        processed_subject = EmailTemplateService._replace_merge_fields(
            processed_subject, all_data)
        processed_content = EmailTemplateService._replace_merge_fields(
            processed_content, all_data)

        return {
            "subject": processed_subject,
            "content": processed_content
        }

    @staticmethod
    def _replace_merge_fields(text: str, data: Dict[str, Any]) -> str:
        """Replace merge fields in text with actual values"""
        def replace_field(match):
            field_name = match.group(1)
            # Return original if not found
            return str(data.get(field_name, match.group(0)))

        # Pattern to match {{field_name}}
        pattern = r'\{\{([^}]+)\}\}'
        return re.sub(pattern, replace_field, text)

    @staticmethod
    def increment_usage_count(db: Session, template_id: str):
        """Increment the usage count for a template"""
        template = db.query(EmailTemplate).filter(
            EmailTemplate.id == template_id).first()
        if template:
            template.usage_count += 1
            db.commit()

    @staticmethod
    def validate_merge_fields(text: str) -> List[str]:
        """Extract and validate merge fields in text"""
        pattern = r'\{\{([^}]+)\}\}'
        fields = re.findall(pattern, text)

        available_fields = [field["field"].replace("{{", "").replace("}}", "")
                            for field in EmailTemplateService.get_available_merge_fields()]

        invalid_fields = [
            field for field in fields if field not in available_fields]
        return invalid_fields

    @staticmethod
    def log_email_sent(
        db: Session,
        template_id: Optional[str],
        sender_email: str,
        recipient_email: str,
        subject: str,
        content: str,
        status: str = "sent",
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None
    ) -> EmailLog:
        """Log an email that was sent"""
        email_log = EmailLog(
            template_id=template_id,
            sender_email=sender_email,
            recipient_email=recipient_email,
            subject=subject,
            content=content,
            status=status,
            cc=json.dumps(cc) if cc else None,
            bcc=json.dumps(bcc) if bcc else None
        )

        db.add(email_log)
        db.commit()
        db.refresh(email_log)

        return email_log
