"""
Company service for business logic.
Handles all business rules and orchestrates operations for companies.
"""

from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session

from ..repositories.company_repository import CompanyRepository
from ..models.company import Company
from ..models.user import UserProfile
from ..models.custom_field import EntityType
from ..schemas.company import (
    CompanyCreate,
    CompanyUpdate,
    CompanyResponse
)
from .custom_field_service import CustomFieldService


class CompanyService:
    """
    Service class for Company business logic.

    This service layer handles all business rules, validations, and orchestration
    for company-related operations. It uses the repository for data access and
    coordinates with other services as needed.
    """

    def __init__(self, db: Session):
        """
        Initialize the company service.

        Args:
            db: Database session
        """
        self.db = db
        self.repository = CompanyRepository(db)

    def get_company_by_id(
        self,
        company_id: UUID,
        *,
        include_custom_fields: bool = True
    ) -> Optional[CompanyResponse]:
        """
        Retrieve a company by ID with all relations and custom fields.

        Args:
            company_id: UUID of the company
            include_custom_fields: Whether to include custom fields in response

        Returns:
            Company with relations and custom fields, or None if not found
        """
        company = self.repository.get_with_relations(company_id)

        if not company:
            return None

        return self._build_company_response(
            company,
            include_custom_fields=include_custom_fields
        )

    def get_all_companies(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        order_by_name: bool = True
    ) -> List[CompanyResponse]:
        """
        Retrieve all companies with optional pagination and ordering.

        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            order_by_name: Whether to order by company name

        Returns:
            List of companies
        """
        companies = self.repository.get_all_ordered(
            skip=skip,
            limit=limit,
            order_by_name=order_by_name,
            load_relations=True
        )

        return [
            self._build_company_response(company, include_custom_fields=False)
            for company in companies
        ]

    def create_company(
        self,
        company_data: CompanyCreate,
        current_user: UserProfile
    ) -> CompanyResponse:
        """
        Create a new company.

        Args:
            company_data: Company creation data
            current_user: The user creating the company

        Returns:
            The created company with custom fields

        Raises:
            Exception: If creation fails
        """
        try:
            # Extract custom fields
            custom_fields_data = company_data.custom_fields or {}

            # Prepare company data for creation
            company_dict = company_data.dict(exclude={'custom_fields'})

            # Create company via repository
            db_company = self.repository.create(obj_in=company_dict)

            # Save custom field values if provided
            if custom_fields_data:
                CustomFieldService.save_custom_field_values(
                    db=self.db,
                    entity_id=str(db_company.id),
                    entity_type=EntityType.COMPANY,
                    field_values=custom_fields_data
                )

            # Commit the transaction
            self.db.commit()
            self.db.refresh(db_company)

            return self._build_company_response(db_company)

        except Exception as e:
            self.db.rollback()
            raise e

    def update_company(
        self,
        company_id: UUID,
        company_data: CompanyUpdate
    ) -> Optional[CompanyResponse]:
        """
        Update an existing company.

        Args:
            company_id: UUID of the company to update
            company_data: Company update data

        Returns:
            The updated company, or None if not found

        Raises:
            Exception: If update fails
        """
        try:
            # Get existing company
            db_company = self.repository.get(company_id)

            if not db_company:
                return None

            # Extract custom fields
            update_dict = company_data.dict(exclude_unset=True)
            custom_fields_data = update_dict.pop('custom_fields', None)

            # Update company fields
            if update_dict:
                db_company = self.repository.update(
                    db_obj=db_company,
                    obj_in=update_dict
                )

            # Update custom field values if provided
            if custom_fields_data is not None:
                CustomFieldService.save_custom_field_values(
                    db=self.db,
                    entity_id=str(db_company.id),
                    entity_type=EntityType.COMPANY,
                    field_values=custom_fields_data
                )

            # Commit the transaction
            self.db.commit()
            self.db.refresh(db_company)

            return self._build_company_response(db_company)

        except Exception as e:
            self.db.rollback()
            raise e

    def delete_company(self, company_id: UUID) -> bool:
        """
        Delete a company.

        Args:
            company_id: UUID of the company to delete

        Returns:
            True if deletion was successful, False if company not found

        Raises:
            Exception: If deletion fails
        """
        try:
            result = self.repository.delete(id=company_id)

            if result:
                self.db.commit()

            return result

        except Exception as e:
            self.db.rollback()
            raise e

    def search_companies(
        self,
        search_term: str,
        *,
        skip: int = 0,
        limit: int = 100
    ) -> List[CompanyResponse]:
        """
        Search companies by name.

        Args:
            search_term: Search term to match against company names
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of matching companies
        """
        companies = self.repository.search_by_name(
            search_term,
            skip=skip,
            limit=limit
        )

        return [
            self._build_company_response(company, include_custom_fields=False)
            for company in companies
        ]

    def get_companies_by_industry(
        self,
        industry: str,
        *,
        skip: int = 0,
        limit: int = 100
    ) -> List[CompanyResponse]:
        """
        Retrieve companies in a specific industry.

        Args:
            industry: Industry name
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of companies in the industry
        """
        companies = self.repository.get_by_industry(
            industry,
            skip=skip,
            limit=limit
        )

        return [
            self._build_company_response(company, include_custom_fields=False)
            for company in companies
        ]

    def get_company_statistics(self) -> Dict[str, Any]:
        """
        Get company statistics (by industry, size, etc.).

        Returns:
            Dictionary containing various statistics
        """
        total_count = self.repository.count()
        by_industry = self.repository.count_by_industry()
        by_size = self.repository.count_by_size()

        return {
            "total": total_count,
            "by_industry": by_industry,
            "by_size": by_size
        }

    def _build_company_response(
        self,
        company: Company,
        include_custom_fields: bool = True
    ) -> CompanyResponse:
        """
        Build a company response with custom fields.

        Args:
            company: The company database object
            include_custom_fields: Whether to include custom fields

        Returns:
            Company response schema
        """
        # Get custom fields
        custom_fields_dict = None
        if include_custom_fields:
            custom_fields_dict = CustomFieldService.get_entity_custom_fields_dict(
                db=self.db,
                entity_id=str(company.id),
                entity_type=EntityType.COMPANY
            )

        return CompanyResponse(
            id=company.id,
            name=company.name,
            industry=company.industry,
            size=company.size,
            website=company.website,
            phone=company.phone,
            email=company.email,
            address=company.address,
            city=company.city,
            state=company.state,
            zip_code=company.zip_code,
            country=company.country,
            description=company.description,
            revenue=company.revenue,
            created_at=company.created_at,
            updated_at=company.updated_at,
            custom_fields=custom_fields_dict
        )
