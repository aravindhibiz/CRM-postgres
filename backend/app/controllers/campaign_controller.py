"""
Campaign Controller - HTTP request/response handling for Campaign endpoints.
Handles authentication, authorization, and HTTP-specific logic.
"""

from typing import List, Optional, Dict, Any
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.services.campaign_service import CampaignService
from app.schemas.campaign import (
    CampaignCreate, CampaignUpdate, CampaignResponse,
    CampaignFilter, CampaignWithStats, AddToCampaignRequest,
    CampaignExecuteRequest
)
from app.models.user import UserProfile
from app.models.campaign import CampaignStatus, CampaignType


class CampaignController:
    """Controller for handling campaign HTTP requests."""

    def __init__(self, db: Session):
        self.db = db
        self.service = CampaignService(db)

    async def get_campaigns(
        self,
        current_user: UserProfile,
        status: Optional[str] = None,
        type: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> Dict[str, Any]:
        """
        Get campaigns with filters and permission-based access.

        Args:
            current_user: Authenticated user
            status: Status filter (comma-separated)
            type: Type filter (comma-separated)
            search: Search term
            skip: Pagination offset
            limit: Pagination limit

        Returns:
            Dictionary with campaigns and total count
        """
        # Check permissions
        # For MVP, we'll use simple owner-based filtering
        # TODO: Implement full RBAC with campaigns.view_all permission

        # Parse filters
        status_list = None
        if status:
            try:
                status_list = [CampaignStatus(s.strip()) for s in status.split(',') if s.strip()]
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid status value"
                )

        type_list = None
        if type:
            try:
                type_list = [CampaignType(t.strip()) for t in type.split(',') if t.strip()]
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid type value"
                )

        # Create filter object
        campaign_filter = CampaignFilter(
            status=status_list,
            type=type_list,
            search=search,
            owner_id=current_user.id  # For MVP, only show user's own campaigns
        )

        campaigns, total = self.service.get_campaigns(
            filters=campaign_filter,
            skip=skip,
            limit=limit
        )

        # Convert to response models
        campaign_responses = [
            self._build_campaign_with_stats(c) for c in campaigns
        ]

        return {
            "campaigns": campaign_responses,
            "total": total,
            "skip": skip,
            "limit": limit
        }

    async def get_campaign(
        self,
        campaign_id: UUID,
        current_user: UserProfile
    ) -> CampaignWithStats:
        """
        Get a single campaign by ID.

        Args:
            campaign_id: Campaign UUID
            current_user: Authenticated user

        Returns:
            Campaign with statistics

        Raises:
            HTTPException: If campaign not found or access denied
        """
        campaign = self.service.get_campaign(campaign_id)

        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )

        # Check ownership (for MVP)
        if campaign.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this campaign"
            )

        return self._build_campaign_with_stats(campaign)

    async def create_campaign(
        self,
        campaign_data: CampaignCreate,
        current_user: UserProfile
    ) -> CampaignResponse:
        """
        Create a new campaign.

        Args:
            campaign_data: Campaign creation data
            current_user: Authenticated user

        Returns:
            Created campaign
        """
        # TODO: Check campaigns.create permission

        campaign = self.service.create_campaign(
            campaign_data=campaign_data,
            created_by=current_user.id
        )

        return CampaignResponse.from_orm(campaign)

    async def update_campaign(
        self,
        campaign_id: UUID,
        campaign_data: CampaignUpdate,
        current_user: UserProfile
    ) -> CampaignResponse:
        """
        Update a campaign.

        Args:
            campaign_id: Campaign UUID
            campaign_data: Update data
            current_user: Authenticated user

        Returns:
            Updated campaign

        Raises:
            HTTPException: If campaign not found or access denied
        """
        campaign = self.service.get_campaign(campaign_id)

        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )

        # Check ownership (for MVP)
        if campaign.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this campaign"
            )

        updated_campaign = self.service.update_campaign(
            campaign_id=campaign_id,
            campaign_data=campaign_data
        )

        if not updated_campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )

        return CampaignResponse.from_orm(updated_campaign)

    async def delete_campaign(
        self,
        campaign_id: UUID,
        current_user: UserProfile
    ) -> Dict[str, str]:
        """
        Delete a campaign.

        Args:
            campaign_id: Campaign UUID
            current_user: Authenticated user

        Returns:
            Success message

        Raises:
            HTTPException: If campaign not found or access denied
        """
        campaign = self.service.get_campaign(campaign_id)

        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )

        # Check ownership (for MVP)
        if campaign.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this campaign"
            )

        success = self.service.delete_campaign(campaign_id)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )

        return {"message": "Campaign deleted successfully"}

    async def add_audience(
        self,
        campaign_id: UUID,
        audience_request: AddToCampaignRequest,
        current_user: UserProfile
    ) -> Dict[str, Any]:
        """
        Add contacts/prospects to campaign audience.

        Args:
            campaign_id: Campaign UUID
            audience_request: Request with contact and prospect IDs
            current_user: Authenticated user

        Returns:
            Addition result

        Raises:
            HTTPException: If campaign not found or access denied
        """
        campaign = self.service.get_campaign(campaign_id)

        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )

        # Check ownership
        if campaign.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to modify this campaign"
            )

        return self.service.add_audience_to_campaign(
            campaign_id=campaign_id,
            audience_request=audience_request
        )

    async def get_audience(
        self,
        campaign_id: UUID,
        current_user: UserProfile,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> Dict[str, Any]:
        """
        Get campaign audience members.

        Args:
            campaign_id: Campaign UUID
            current_user: Authenticated user
            status: Optional engagement status filter
            skip: Pagination offset
            limit: Pagination limit

        Returns:
            Audience members

        Raises:
            HTTPException: If campaign not found or access denied
        """
        campaign = self.service.get_campaign(campaign_id)

        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )

        # Check ownership
        if campaign.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this campaign"
            )

        # Parse status filter
        from app.models.campaign_contact import EngagementStatus
        status_list = None
        if status:
            try:
                status_list = [EngagementStatus(s.strip()) for s in status.split(',') if s.strip()]
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid status value"
                )

        audience = self.service.get_campaign_audience(
            campaign_id=campaign_id,
            status=status_list,
            skip=skip,
            limit=limit
        )

        return {
            "campaign_id": campaign_id,
            "audience": audience,
            "total": len(audience)
        }

    async def execute_campaign(
        self,
        campaign_id: UUID,
        execute_request: CampaignExecuteRequest,
        current_user: UserProfile
    ) -> Dict[str, Any]:
        """
        Execute a campaign.

        Args:
            campaign_id: Campaign UUID
            execute_request: Execution parameters
            current_user: Authenticated user

        Returns:
            Execution result

        Raises:
            HTTPException: If campaign not found or access denied
        """
        campaign = self.service.get_campaign(campaign_id)

        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )

        # Check ownership
        if campaign.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to execute this campaign"
            )

        # TODO: Check campaigns.execute permission

        return self.service.execute_campaign(
            campaign_id=campaign_id,
            execute_request=execute_request,
            executed_by=current_user.id
        )

    async def get_metrics(
        self,
        campaign_id: UUID,
        current_user: UserProfile
    ) -> Dict[str, Any]:
        """
        Get campaign performance metrics.

        Args:
            campaign_id: Campaign UUID
            current_user: Authenticated user

        Returns:
            Campaign metrics

        Raises:
            HTTPException: If campaign not found or access denied
        """
        campaign = self.service.get_campaign(campaign_id)

        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )

        # Check ownership
        if campaign.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this campaign"
            )

        return self.service.get_campaign_metrics(campaign_id)

    async def get_conversions(
        self,
        campaign_id: UUID,
        current_user: UserProfile
    ) -> Dict[str, Any]:
        """
        Get campaign conversions (deals).

        Args:
            campaign_id: Campaign UUID
            current_user: Authenticated user

        Returns:
            Conversion data

        Raises:
            HTTPException: If campaign not found or access denied
        """
        campaign = self.service.get_campaign(campaign_id)

        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )

        # Check ownership
        if campaign.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this campaign"
            )

        conversions = self.service.get_campaign_conversions(campaign_id)

        return {
            "campaign_id": campaign_id,
            "conversions": conversions,
            "total": len(conversions)
        }

    async def get_analytics(
        self,
        campaign_id: UUID,
        current_user: UserProfile,
        days: int = 30
    ) -> Dict[str, Any]:
        """
        Get comprehensive campaign analytics.

        Args:
            campaign_id: Campaign UUID
            current_user: Authenticated user
            days: Number of days for time-series data

        Returns:
            Analytics data

        Raises:
            HTTPException: If campaign not found or access denied
        """
        campaign = self.service.get_campaign(campaign_id)

        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )

        # Check ownership
        if campaign.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this campaign"
            )

        return self.service.get_campaign_analytics(campaign_id, days)

    async def get_statistics(
        self,
        current_user: UserProfile
    ) -> Dict[str, Any]:
        """
        Get overall campaign statistics for the user.

        Args:
            current_user: Authenticated user

        Returns:
            Campaign statistics
        """
        return self.service.get_campaign_statistics(owner_id=current_user.id)

    async def link_deal_to_campaign(
        self,
        campaign_id: UUID,
        prospect_id: UUID,
        deal_id: UUID,
        conversion_value: float,
        current_user: UserProfile
    ) -> Dict[str, Any]:
        """
        Link a deal to a campaign by updating the campaign_contact record.

        Args:
            campaign_id: Campaign UUID
            prospect_id: Prospect UUID
            deal_id: Deal UUID
            conversion_value: Value of the conversion
            current_user: Authenticated user

        Returns:
            Success message
        """
        campaign = self.service.get_campaign(campaign_id)

        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )

        # Check ownership
        if campaign.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to modify this campaign"
            )

        return self.service.link_deal_to_campaign(
            campaign_id=campaign_id,
            prospect_id=prospect_id,
            deal_id=deal_id,
            conversion_value=conversion_value
        )

    def _build_campaign_with_stats(self, campaign) -> Dict[str, Any]:
        """Build campaign response with calculated stats."""
        campaign_dict = CampaignResponse.from_orm(campaign).dict()

        # Add calculated properties
        campaign_dict['roi'] = campaign.roi
        campaign_dict['open_rate'] = campaign.open_rate
        campaign_dict['click_rate'] = campaign.click_rate
        campaign_dict['response_rate'] = campaign.response_rate
        campaign_dict['conversion_rate'] = campaign.conversion_rate
        campaign_dict['delivery_rate'] = campaign.delivery_rate
        campaign_dict['bounce_rate'] = campaign.bounce_rate
        campaign_dict['days_remaining'] = campaign.days_remaining
        campaign_dict['is_active'] = campaign.is_active
        campaign_dict['is_scheduled'] = campaign.is_scheduled
        campaign_dict['is_draft'] = campaign.is_draft

        return campaign_dict
