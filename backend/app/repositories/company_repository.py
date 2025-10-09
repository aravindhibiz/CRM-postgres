"""
Company repository for data access operations.
Handles all database queries related to companies.
"""

from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, asc

from .base_repository import BaseRepository
from ..models.company import Company


class CompanyRepository(BaseRepository[Company]):
    """
    Repository for Company entity.

    Provides specialized query methods for companies beyond the base CRUD operations.
    """

    def __init__(self, db: Session):
        """
        Initialize the company repository.

        Args:
            db: Database session
        """
        super().__init__(Company, db)

    def get_with_relations(self, company_id: UUID) -> Optional[Company]:
        """
        Retrieve a company with all its relationships loaded.

        Args:
            company_id: UUID of the company

        Returns:
            Company with loaded relationships, or None if not found
        """
        return (
            self.db.query(Company)
            .options(
                joinedload(Company.owner),
                joinedload(Company.contacts),
                joinedload(Company.deals)
            )
            .filter(Company.id == company_id)
            .first()
        )

    def get_all_ordered(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        order_by_name: bool = True,
        load_relations: bool = True
    ) -> List[Company]:
        """
        Retrieve all companies with optional ordering and relations.

        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            order_by_name: Whether to order by company name
            load_relations: Whether to load related entities

        Returns:
            List of companies
        """
        query = self.db.query(Company)

        if load_relations:
            query = query.options(
                joinedload(Company.owner),
                joinedload(Company.contacts),
                joinedload(Company.deals)
            )

        if order_by_name:
            query = query.order_by(asc(Company.name))
        else:
            query = query.order_by(desc(Company.created_at))

        return query.offset(skip).limit(limit).all()

    def get_by_owner(
        self,
        owner_id: UUID,
        *,
        skip: int = 0,
        limit: int = 100
    ) -> List[Company]:
        """
        Retrieve companies for a specific owner.

        Args:
            owner_id: UUID of the owner
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of companies for the owner
        """
        return (
            self.db.query(Company)
            .filter(Company.owner_id == owner_id)
            .order_by(asc(Company.name))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_industry(
        self,
        industry: str,
        *,
        skip: int = 0,
        limit: int = 100
    ) -> List[Company]:
        """
        Retrieve companies in a specific industry.

        Args:
            industry: Industry name
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of companies in the industry
        """
        return (
            self.db.query(Company)
            .filter(Company.industry == industry)
            .order_by(asc(Company.name))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def search_by_name(
        self,
        search_term: str,
        *,
        skip: int = 0,
        limit: int = 100
    ) -> List[Company]:
        """
        Search companies by name (case-insensitive partial match).

        Args:
            search_term: Search term to match against company names
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of matching companies
        """
        return (
            self.db.query(Company)
            .filter(Company.name.ilike(f"%{search_term}%"))
            .order_by(asc(Company.name))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_size(
        self,
        size: str,
        *,
        skip: int = 0,
        limit: int = 100
    ) -> List[Company]:
        """
        Retrieve companies of a specific size.

        Args:
            size: Company size (e.g., "Small", "Medium", "Large")
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of companies of the specified size
        """
        return (
            self.db.query(Company)
            .filter(Company.size == size)
            .order_by(asc(Company.name))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def count_by_industry(self) -> dict:
        """
        Count companies grouped by industry.

        Returns:
            Dictionary of industry: count pairs
        """
        from sqlalchemy import func

        results = (
            self.db.query(
                Company.industry,
                func.count(Company.id).label('count')
            )
            .group_by(Company.industry)
            .all()
        )

        return {industry: count for industry, count in results if industry}

    def count_by_size(self) -> dict:
        """
        Count companies grouped by size.

        Returns:
            Dictionary of size: count pairs
        """
        from sqlalchemy import func

        results = (
            self.db.query(
                Company.size,
                func.count(Company.id).label('count')
            )
            .group_by(Company.size)
            .all()
        )

        return {size: count for size, count in results if size}

    def get_recent_companies(
        self,
        *,
        limit: int = 10
    ) -> List[Company]:
        """
        Retrieve the most recently created companies.

        Args:
            limit: Maximum number of records to return

        Returns:
            List of recent companies
        """
        return (
            self.db.query(Company)
            .options(
                joinedload(Company.owner),
                joinedload(Company.contacts),
                joinedload(Company.deals)
            )
            .order_by(desc(Company.created_at))
            .limit(limit)
            .all()
        )
