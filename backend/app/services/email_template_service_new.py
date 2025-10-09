"""
Email Template Service Layer (Enhanced)

This module provides business logic for Email Template management operations.
Implements the Service pattern with merge field processing and email sending.

Key Features:
- Template CRUD with validation
- Merge field processing ({{field_name}})
- Template preview
- Email sending with logging
- Usage tracking
- Template statistics

Author: CRM System
Date: 2024
"""

import re
import json
from typing import Dict, Any, Optional, List
from datetime import datetime
from uuid import UUID
from sqlalchemy.orm import Session
from ..models.email_template import EmailTemplate, EmailLog, TemplateCategory, TemplateStatus
from ..models.user import UserProfile
from ..models.contact import Contact
from ..models.company import Company
from ..models.deal import Deal
from ..schemas.email_template import (
    EmailTemplateCreate, EmailTemplateUpdate,
    SendEmailRequest, TemplatePreviewRequest
)
from ..repositories.email_template_repository import (
    EmailTemplateRepository, EmailLogRepository
)


class EmailTemplateService:
    """
    Service class for Email Template business logic.

    This class implements business rules and orchestrates operations
    between controllers and repositories. Includes merge field processing
    and email sending functionality.

    Responsibilities:
    - Validate template data and merge fields
    - Process merge field substitutions
    - Orchestrate repository operations
    - Send emails with templates
    - Track usage statistics
    - Log email sends
    """

    # Define available merge fields with metadata
    AVAILABLE_MERGE_FIELDS = [
        {"field": "{{first_name}}",
            "description": "Contact first name", "example": "John"},
        {"field": "{{last_name}}", "description": "Contact last name", "example": "Doe"},
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
        {"field": "{{deal_value}}", "description": "Deal value", "example": "$50,000"},
        {"field": "{{deal_stage}}", "description": "Deal stage", "example": "Proposal"},
        {"field": "{{sender_name}}", "description": "Your name",
            "example": "Jane Smith"},
        {"field": "{{sender_email}}", "description": "Your email",
            "example": "jane@company.com"},
        {"field": "{{sender_title}}", "description": "Your title",
            "example": "Account Manager"},
        {"field": "{{current_date}}", "description": "Current date",
            "example": "October 9, 2025"},
        {"field": "{{company_address}}", "description": "Company address",
            "example": "123 Business St"},
        {"field": "{{company_phone}}", "description": "Company phone",
            "example": "+1-555-987-6543"},
    ]

    def __init__(self, db: Session):
        """
        Initialize the EmailTemplateService.

        Args:
            db (Session): SQLAlchemy database session
        """
        self.db = db
        self.template_repository = EmailTemplateRepository(db)
        self.log_repository = EmailLogRepository(db)

    # ==================== Merge Field Operations ====================

    @staticmethod
    def get_available_merge_fields() -> List[Dict[str, str]]:
        """
        Get list of available merge fields with descriptions.

        Returns:
            List[Dict[str, str]]: List of merge field metadata
        """
        return EmailTemplateService.AVAILABLE_MERGE_FIELDS

    @staticmethod
    def validate_merge_fields(text: str) -> List[str]:
        """
        Extract and validate merge fields in text.

        Args:
            text (str): The text to validate

        Returns:
            List[str]: List of invalid field names (empty if all valid)
        """
        # Extract all merge fields from text
        pattern = r'\{\{([^}]+)\}\}'
        fields = re.findall(pattern, text)

        # Get list of valid field names (without {{ }})
        available_fields = [
            field["field"].replace("{{", "").replace("}}", "")
            for field in EmailTemplateService.AVAILABLE_MERGE_FIELDS
        ]

        # Find invalid fields
        invalid_fields = [
            field for field in fields if field not in available_fields
        ]

        return invalid_fields

    @staticmethod
    def _replace_merge_fields(text: str, data: Dict[str, Any]) -> str:
        """
        Replace merge fields in text with actual values.

        Args:
            text (str): The text containing merge fields
            data (Dict[str, Any]): The data to substitute

        Returns:
            str: Text with merge fields replaced
        """
        def replace_field(match):
            field_name = match.group(1)
            # Return value from data or original if not found
            return str(data.get(field_name, match.group(0)))

        # Pattern to match {{field_name}}
        pattern = r'\{\{([^}]+)\}\}'
        return re.sub(pattern, replace_field, text)

    def process_template(
        self,
        template: EmailTemplate,
        merge_data: Dict[str, Any],
        contact_id: Optional[UUID] = None,
        deal_id: Optional[UUID] = None,
        sender: Optional[UserProfile] = None
    ) -> Dict[str, str]:
        """
        Process template by replacing merge fields with actual data.

        Args:
            template (EmailTemplate): The template to process
            merge_data (Dict[str, Any]): Custom merge data
            contact_id (Optional[UUID]): Contact ID for contact data
            deal_id (Optional[UUID]): Deal ID for deal data
            sender (Optional[UserProfile]): Sender user for sender data

        Returns:
            Dict[str, str]: Processed subject and content
        """
        # Start with template content
        processed_subject = template.subject
        processed_content = template.content

        # Get contact data if contact_id provided
        contact_data = {}
        if contact_id:
            contact = self.db.query(Contact).filter(
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
            deal = self.db.query(Deal).filter(Deal.id == deal_id).first()
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
        all_data = {
            **contact_data,
            **deal_data,
            **sender_data,
            **current_data,
            **merge_data
        }

        # Replace merge fields in subject and content
        processed_subject = self._replace_merge_fields(
            processed_subject, all_data)
        processed_content = self._replace_merge_fields(
            processed_content, all_data)

        return {
            "subject": processed_subject,
            "content": processed_content
        }

    # ==================== Template CRUD Operations ====================

    def get_all_templates(
        self,
        search: Optional[str] = None,
        category: Optional[TemplateCategory] = None,
        status: Optional[TemplateStatus] = None,
        limit: int = 50,
        offset: int = 0
    ) -> tuple[List[EmailTemplate], int]:
        """
        Get all templates with filtering and pagination.

        Args:
            search (Optional[str]): Search term
            category (Optional[TemplateCategory]): Filter by category
            status (Optional[TemplateStatus]): Filter by status
            limit (int): Maximum results
            offset (int): Pagination offset

        Returns:
            tuple[List[EmailTemplate], int]: Templates and total count
        """
        return self.template_repository.get_all(
            search=search,
            category=category,
            status=status,
            limit=limit,
            offset=offset
        )

    def get_template_by_id(self, template_id: UUID) -> Optional[EmailTemplate]:
        """
        Get a template by ID.

        Args:
            template_id (UUID): The template ID

        Returns:
            Optional[EmailTemplate]: The template if found
        """
        return self.template_repository.get_by_id(template_id)

    def get_active_template_by_id(self, template_id: UUID) -> Optional[EmailTemplate]:
        """
        Get an active template by ID.

        Args:
            template_id (UUID): The template ID

        Returns:
            Optional[EmailTemplate]: The template if found and active

        Raises:
            ValueError: If template is not active
        """
        template = self.template_repository.get_by_id(template_id)
        if template and template.status != TemplateStatus.ACTIVE:
            raise ValueError("Template is not active")
        return template

    def create_template(
        self,
        template_data: EmailTemplateCreate,
        user_id: UUID
    ) -> EmailTemplate:
        """
        Create a new email template.

        Args:
            template_data (EmailTemplateCreate): The template data
            user_id (UUID): The creator user ID

        Returns:
            EmailTemplate: The created template

        Raises:
            ValueError: If validation fails
        """
        # Validate merge fields
        invalid_fields = self.validate_merge_fields(
            template_data.subject + " " + template_data.content
        )
        if invalid_fields:
            raise ValueError(
                f"Invalid merge fields: {', '.join(invalid_fields)}")

        # Check for duplicate name
        existing = self.template_repository.get_by_name(template_data.name)
        if existing:
            raise ValueError("Template with this name already exists")

        # Create template
        new_template = EmailTemplate(
            **template_data.model_dump(),
            created_by=user_id
        )

        return self.template_repository.create(new_template)

    def update_template(
        self,
        template_id: UUID,
        template_data: EmailTemplateUpdate,
        user_id: UUID
    ) -> EmailTemplate:
        """
        Update an existing template.

        Args:
            template_id (UUID): The template ID
            template_data (EmailTemplateUpdate): The update data
            user_id (UUID): The requesting user ID

        Returns:
            EmailTemplate: The updated template

        Raises:
            ValueError: If validation fails or template not found
        """
        # Get existing template
        template = self.template_repository.get_by_id(template_id)
        if not template:
            raise ValueError("Template not found")

        # Validate merge fields if content is being updated
        if template_data.subject or template_data.content:
            subject_text = template_data.subject or template.subject
            content_text = template_data.content or template.content
            invalid_fields = self.validate_merge_fields(
                subject_text + " " + content_text
            )
            if invalid_fields:
                raise ValueError(
                    f"Invalid merge fields: {', '.join(invalid_fields)}")

        # Check for duplicate name if name is being updated
        if template_data.name and template_data.name != template.name:
            existing = self.template_repository.get_by_name(template_data.name)
            if existing and existing.id != template_id:
                raise ValueError("Template with this name already exists")

        # Update template fields
        update_data = template_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(template, field, value)

        return self.template_repository.update(template)

    def delete_template(self, template_id: UUID) -> Dict[str, str]:
        """
        Delete a template (soft delete if in use, hard delete otherwise).

        Args:
            template_id (UUID): The template ID

        Returns:
            Dict[str, str]: Success message

        Raises:
            ValueError: If template not found
        """
        template = self.template_repository.get_by_id(template_id)
        if not template:
            raise ValueError("Template not found")

        # Check if template has been used
        usage_count = self.log_repository.count_by_template(template_id)

        if usage_count > 0:
            # Soft delete by setting status to inactive
            self.template_repository.soft_delete(template)
            return {"message": "Template marked as inactive due to existing usage"}
        else:
            # Hard delete if no usage
            self.template_repository.delete(template)
            return {"message": "Template deleted successfully"}

    # ==================== Preview & Statistics ====================

    def preview_template(
        self,
        preview_data: TemplatePreviewRequest,
        user: UserProfile
    ) -> Dict[str, str]:
        """
        Preview a template with merge data.

        Args:
            preview_data (TemplatePreviewRequest): Preview request data
            user (UserProfile): The requesting user

        Returns:
            Dict[str, str]: Processed subject and content

        Raises:
            ValueError: If template not found
        """
        template = self.template_repository.get_by_id(preview_data.template_id)
        if not template:
            raise ValueError("Template not found")

        return self.process_template(
            template=template,
            merge_data=preview_data.merge_data,
            sender=user
        )

    def get_template_statistics(self) -> Dict[str, Any]:
        """
        Get template usage statistics.

        Returns:
            Dict[str, Any]: Statistics data
        """
        return self.template_repository.get_usage_statistics()

    # ==================== Email Sending Operations ====================

    def send_email(
        self,
        email_data: SendEmailRequest,
        sender: UserProfile
    ) -> EmailLog:
        """
        Send an email using a template or custom content.

        Args:
            email_data (SendEmailRequest): Email data
            sender (UserProfile): The sender user

        Returns:
            EmailLog: The created email log

        Raises:
            ValueError: If validation fails
        """
        template = None
        processed_subject = email_data.subject or ""
        processed_content = email_data.content or ""

        # If template is specified, process it
        if email_data.template_id:
            template = self.get_active_template_by_id(email_data.template_id)
            if not template:
                raise ValueError("Active template not found")

            # Process template
            processed = self.process_template(
                template=template,
                merge_data=email_data.merge_data or {},
                sender=sender
            )

            # Use processed content or override if provided
            processed_subject = email_data.subject or processed["subject"]
            processed_content = email_data.content or processed["content"]

            # Increment usage count
            self.template_repository.increment_usage_count(
                email_data.template_id)

        # Validate required fields
        if not processed_subject or not processed_content:
            raise ValueError("Subject and content are required")

        # Create email log (status would be updated by actual email service)
        email_log = self.log_email_sent(
            template_id=email_data.template_id,
            sender_email=sender.email,
            recipient_email=email_data.to,
            subject=processed_subject,
            content=processed_content,
            status="sent",  # In production, this would be set by email service
            cc=email_data.cc,
            bcc=email_data.bcc
        )

        return email_log

    def log_email_sent(
        self,
        template_id: Optional[UUID],
        sender_email: str,
        recipient_email: str,
        subject: str,
        content: str,
        status: str = "sent",
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None
    ) -> EmailLog:
        """
        Log an email that was sent.

        Args:
            template_id (Optional[UUID]): Template ID if used
            sender_email (str): Sender email address
            recipient_email (str): Recipient email address
            subject (str): Email subject
            content (str): Email content
            status (str): Send status (sent, failed, pending)
            cc (Optional[List[str]]): CC recipients
            bcc (Optional[List[str]]): BCC recipients

        Returns:
            EmailLog: The created email log
        """
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

        return self.log_repository.create(email_log)

    # ==================== Email Log Operations ====================

    def get_email_logs(
        self,
        sender_email: str,
        template_id: Optional[UUID] = None,
        status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[EmailLog]:
        """
        Get email logs for a sender.

        Args:
            sender_email (str): Sender email to filter by
            template_id (Optional[UUID]): Filter by template
            status (Optional[str]): Filter by status
            limit (int): Maximum results
            offset (int): Pagination offset

        Returns:
            List[EmailLog]: Email logs
        """
        return self.log_repository.get_by_sender(
            sender_email=sender_email,
            template_id=template_id,
            status=status,
            limit=limit,
            offset=offset
        )

    def get_email_statistics(
        self,
        sender_email: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get email sending statistics.

        Args:
            sender_email (Optional[str]): Filter by sender

        Returns:
            Dict[str, Any]: Email statistics
        """
        return self.log_repository.get_email_statistics(sender_email)
