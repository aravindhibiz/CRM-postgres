# Import all models so SQLAlchemy can create proper relationships
from .user import UserProfile
from .contact import Contact
from .company import Company
from .deal import Deal
from .activity import Activity
from .task import Task
from .deal_document import DealDocument
from .custom_field import CustomField, CustomFieldValue, FieldType, EntityType, PlacementType
from .role import Role, Permission
from .email_template import EmailTemplate, EmailLog, TemplateCategory, TemplateStatus
from .integration import Integration, IntegrationLog, IntegrationWebhook
from .note import Note
from .system_config import SystemConfiguration

__all__ = ['UserProfile', 'Contact', 'Company',
           'Deal', 'Activity', 'Task', 'DealDocument',
           'CustomField', 'CustomFieldValue', 'FieldType', 'EntityType', 'PlacementType',
           'Role', 'Permission',
           'EmailTemplate', 'EmailLog', 'TemplateCategory', 'TemplateStatus',
           'Integration', 'IntegrationLog', 'IntegrationWebhook',
           'Note', 'SystemConfiguration']
