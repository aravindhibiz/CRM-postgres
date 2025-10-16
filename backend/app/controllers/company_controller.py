"""
Company controller for handling HTTP requests and responses.
Manages request validation, permission checks, and service delegation.
"""

from typing import List, Optional
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..models.user import UserProfile
from ..schemas.company import (
    CompanyCreate,
    CompanyUpdate,
    CompanyResponse
)
from ..services.company_service import CompanyService
from ..core.auth import has_permission


class CompanyController:
    """
    Controller class for Company HTTP operations.

    This controller handles HTTP-specific concerns like permission checks,
    error responses, and delegates business logic to the service layer.
    """

    @staticmethod
    def get_companies(
        db: Session,
        current_user: UserProfile,
        skip: int = 0,
        limit: int = 100
    ) -> List[CompanyResponse]:
        """
        Handle GET request to retrieve all companies.

        Args:
            db: Database session
            current_user: The authenticated user
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of companies

        Raises:
            HTTPException: If user doesn't have permission
        """
        # TODO: Add permission check when companies.view permission is added to database
        # if not has_permission(db, current_user, "companies.view"):
        #     raise HTTPException(
        #         status_code=status.HTTP_403_FORBIDDEN,
        #         detail="Not authorized to view companies"
        #     )

        # Delegate to service
        service = CompanyService(db)
        return service.get_all_companies(skip=skip, limit=limit)

    @staticmethod
    def get_company(
        company_id: UUID,
        db: Session,
        current_user: UserProfile
    ) -> CompanyResponse:
        """
        Handle GET request to retrieve a single company by ID.

        Args:
            company_id: UUID of the company
            db: Database session
            current_user: The authenticated user

        Returns:
            Company details

        Raises:
            HTTPException: If company not found or user doesn't have permission
        """
        # TODO: Add permission check when companies.view permission is added to database
        # if not has_permission(db, current_user, "companies.view"):
        #     raise HTTPException(
        #         status_code=status.HTTP_403_FORBIDDEN,
        #         detail="Not authorized to view companies"
        #     )

        # Delegate to service
        service = CompanyService(db)
        company = service.get_company_by_id(company_id)

        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Company with id {company_id} not found"
            )

        return company

    @staticmethod
    def create_company(
        company_data: CompanyCreate,
        db: Session,
        current_user: UserProfile
    ) -> CompanyResponse:
        """
        Handle POST request to create a new company.

        Args:
            company_data: Company creation data
            db: Database session
            current_user: The authenticated user

        Returns:
            Created company

        Raises:
            HTTPException: If user doesn't have permission or creation fails
        """
        # TODO: Add permission check when companies.create permission is added to database
        # if not has_permission(db, current_user, "companies.create"):
        #     raise HTTPException(
        #         status_code=status.HTTP_403_FORBIDDEN,
        #         detail="Not authorized to create companies"
        #     )

        try:
            # Delegate to service
            service = CompanyService(db)
            return service.create_company(company_data, current_user)

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to create company: {str(e)}"
            )

    @staticmethod
    def update_company(
        company_id: UUID,
        company_data: CompanyUpdate,
        db: Session,
        current_user: UserProfile
    ) -> CompanyResponse:
        """
        Handle PUT request to update a company.

        Args:
            company_id: UUID of the company to update
            company_data: Company update data
            db: Session
            current_user: The authenticate      d user

        Returns:
            Updated company

        Raises:
            HTTPException: If company not found, user doesn't have permission, or update fails
        """
        # TODO: Add permission check when companies.edit permission is added to database
        # if not has_permission(db, current_user, "companies.edit"):
        #     raise HTTPException(
        #         status_code=status.HTTP_403_FORBIDDEN,
        #         detail="Not authorized to update companies"
        #     )

        try:
            # Delegate to service
            service = CompanyService(db)
            company = service.update_company(company_id, company_data)

            if not company:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Company with id {company_id} not found"
                )

            return company

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to update company: {str(e)}"
            )

    @staticmethod
    def delete_company(
        company_id: UUID,
        db: Session,
        current_user: UserProfile
    ) -> dict:
        """
        Handle DELETE request to delete a company.

        Args:
            company_id: UUID of the company to delete
            db: Database session
            current_user: The authenticated user

        Returns:
            Success message

        Raises:
            HTTPException: If company not found, user doesn't have permission, or deletion fails
        """
        # TODO: Add permission check when companies.delete permission is added to database
        # if not has_permission(db, current_user, "companies.delete"):
        #     raise HTTPException(
        #         status_code=status.HTTP_403_FORBIDDEN,
        #         detail="Not authorized to delete companies"
        #     )

        try:
            # Delegate to service
            service = CompanyService(db)
            success = service.delete_company(company_id)

            if not success:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Company with id {company_id} not found"
                )

            return {"message": "Company deleted successfully"}

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to delete company: {str(e)}"
            )

    @staticmethod
    def search_companies(
        search_term: str,
        db: Session,
        current_user: UserProfile,
        skip: int = 0,
        limit: int = 100
    ) -> List[CompanyResponse]:
        """
        Handle GET request to search companies by name.

        Args:
            search_term: Search term to match against company names
            db: Database session
            current_user: The authenticated user
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of matching companies

        Raises:
            HTTPException: If user doesn't have permission
        """
        # TODO: Add permission check when companies.view permission is added to database
        # if not has_permission(db, current_user, "companies.view"):
        #     raise HTTPException(
        #         status_code=status.HTTP_403_FORBIDDEN,
        #         detail="Not authorized to view companies"
        #     )

        # Delegate to service
        service = CompanyService(db)
        return service.search_companies(search_term, skip=skip, limit=limit)

    @staticmethod
    def get_company_statistics(
        db: Session,
        current_user: UserProfile
    ) -> dict:
        """
        Handle GET request to retrieve company statistics.

        Args:
            db: Database session
            current_user: The authenticated user

        Returns:
            Dictionary containing statistics

        Raises:
            HTTPException: If user doesn't have permission
        """
        # TODO: Add permission check when companies.view permission is added to database
        # if not has_permission(db, current_user, "companies.view"):
        #     raise HTTPException(
        #         status_code=status.HTTP_403_FORBIDDEN,
        #         detail="Not authorized to view company statistics"
        #     )

        # Delegate to service
        service = CompanyService(db)
        return service.get_company_statistics()
