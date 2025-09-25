from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from uuid import UUID
from ..core.database import get_db
from ..core.auth import get_current_user
from ..models.user import UserProfile
from ..models.deal import Deal
from ..schemas.deal import DealCreate, DealUpdate, DealResponse, DealWithRelations

router = APIRouter()

@router.get("/", response_model=List[DealWithRelations])
async def get_user_deals(
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    deals = db.query(Deal).options(
        joinedload(Deal.company),
        joinedload(Deal.contact),
        joinedload(Deal.owner)
    ).filter(Deal.owner_id == current_user.id).order_by(Deal.updated_at.desc()).all()

    return deals

@router.get("/pipeline", response_model=dict)
async def get_pipeline_deals(
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    deals = db.query(Deal).options(
        joinedload(Deal.company),
        joinedload(Deal.contact),
        joinedload(Deal.owner)
    ).filter(Deal.owner_id == current_user.id).order_by(Deal.updated_at.desc()).all()

    # Group deals by stage
    pipeline_data = {
        'lead': {'id': 'lead', 'title': 'Lead', 'deals': []},
        'qualified': {'id': 'qualified', 'title': 'Qualified', 'deals': []},
        'proposal': {'id': 'proposal', 'title': 'Proposal', 'deals': []},
        'negotiation': {'id': 'negotiation', 'title': 'Negotiation', 'deals': []},
        'closed_won': {'id': 'closed_won', 'title': 'Closed Won', 'deals': []},
        'closed_lost': {'id': 'closed_lost', 'title': 'Closed Lost', 'deals': []}
    }

    for deal in deals:
        stage = deal.stage or 'lead'
        if stage in pipeline_data:
            pipeline_data[stage]['deals'].append({
                'id': str(deal.id),
                'title': deal.name or 'Untitled Deal',
                'value': float(deal.value or 0),
                'probability': deal.probability or 0,
                'contact': deal.contact.first_name + ' ' + deal.contact.last_name if deal.contact else 'Unknown Contact',
                'company': deal.company.name if deal.company else 'Unknown Company',
                'avatar': f'https://ui-avatars.com/api/?name={deal.contact.first_name[0] if deal.contact else "U"}+{deal.contact.last_name[0] if deal.contact else "C"}&background=random' if deal.contact else 'https://ui-avatars.com/api/?name=U+C&background=random',
                'expected_close_date': deal.expected_close_date.isoformat() if deal.expected_close_date else None
            })

    return pipeline_data

@router.get("/{deal_id}", response_model=DealWithRelations)
async def get_deal_by_id(
    deal_id: UUID,
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    deal = db.query(Deal).options(
        joinedload(Deal.company),
        joinedload(Deal.contact),
        joinedload(Deal.owner),
        joinedload(Deal.activities),
        joinedload(Deal.documents)
    ).filter(Deal.id == deal_id, Deal.owner_id == current_user.id).first()

    if not deal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found"
        )

    return deal

@router.post("/", response_model=DealResponse)
async def create_deal(
    deal_data: DealCreate,
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    db_deal = Deal(
        **deal_data.dict(),
        owner_id=current_user.id
    )

    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)

    return db_deal

@router.put("/{deal_id}", response_model=DealResponse)
async def update_deal(
    deal_id: UUID,
    deal_data: DealUpdate,
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    deal = db.query(Deal).filter(
        Deal.id == deal_id,
        Deal.owner_id == current_user.id
    ).first()

    if not deal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found"
        )

    # Update deal fields
    update_data = deal_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(deal, field, value)

    db.commit()
    db.refresh(deal)

    return deal

@router.delete("/{deal_id}")
async def delete_deal(
    deal_id: UUID,
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    deal = db.query(Deal).filter(
        Deal.id == deal_id,
        Deal.owner_id == current_user.id
    ).first()

    if not deal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found"
        )

    db.delete(deal)
    db.commit()

    return {"message": "Deal deleted successfully"}

@router.get("/stats/overview")
async def get_deals_stats(
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    deals = db.query(Deal).filter(Deal.owner_id == current_user.id).all()

    total_value = sum([float(deal.value or 0) for deal in deals])
    won_deals = [deal for deal in deals if deal.stage == 'closed_won']
    lost_deals = [deal for deal in deals if deal.stage == 'closed_lost']
    active_deals = [deal for deal in deals if deal.stage not in ['closed_won', 'closed_lost']]

    stats = {
        'total_deals': len(deals),
        'active_deals': len(active_deals),
        'won_deals': len(won_deals),
        'lost_deals': len(lost_deals),
        'total_value': total_value,
        'won_value': sum([float(deal.value or 0) for deal in won_deals]),
        'pipeline_value': sum([float(deal.value or 0) for deal in active_deals]),
        'conversion_rate': round((len(won_deals) / len(deals)) * 100, 2) if deals else 0
    }

    return stats

@router.get("/analytics/revenue")
async def get_revenue_data(
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    deals = db.query(Deal).filter(Deal.owner_id == current_user.id).all()

    # Generate last 12 months of revenue data
    from datetime import datetime, timedelta
    import calendar

    revenue_data = []
    now = datetime.now()

    for i in range(11, -1, -1):
        # Calculate the month
        month_date = datetime(now.year, now.month, 1) - timedelta(days=30*i)
        month_name = calendar.month_abbr[month_date.month]

        # Filter deals closed in this month
        month_deals = [
            deal for deal in deals
            if deal.actual_close_date and
            deal.actual_close_date.month == month_date.month and
            deal.actual_close_date.year == month_date.year
        ]

        actual = sum([float(deal.value or 0) for deal in month_deals if deal.stage == 'closed_won'])

        # Generate forecast (simple projection)
        forecast = actual * 1.1 if actual > 0 else 50000
        target = forecast * 0.9

        revenue_data.append({
            "month": month_name,
            "actual": int(actual),
            "forecast": int(forecast),
            "target": int(target)
        })

    return revenue_data

@router.get("/analytics/performance")
async def get_performance_metrics(
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    deals = db.query(Deal).filter(Deal.owner_id == current_user.id).all()

    won_deals = [deal for deal in deals if deal.stage == 'closed_won']
    lost_deals = [deal for deal in deals if deal.stage == 'closed_lost']
    total_closed = len(won_deals) + len(lost_deals)

    achieved = sum([float(deal.value or 0) for deal in won_deals])
    quota = max(achieved * 1.3, 500000)  # Assume quota is 30% higher than achieved
    avg_deal_size = achieved / len(won_deals) if won_deals else 25000
    conversion_rate = round((len(won_deals) / total_closed) * 100) if total_closed > 0 else 0

    return {
        "achieved": int(achieved),
        "quota": int(quota),
        "percentage": round((achieved / quota) * 100),
        "avgDealSize": int(avg_deal_size),
        "conversionRate": conversion_rate,
        "dealsWon": len(won_deals),
        "dealsLost": len(lost_deals),
        "totalDeals": len(deals)
    }

@router.get("/analytics/winrate")
async def get_win_rate_data(
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    deals = db.query(Deal).filter(Deal.owner_id == current_user.id).all()

    won_deals = len([deal for deal in deals if deal.stage == 'closed_won'])
    lost_deals = len([deal for deal in deals if deal.stage == 'closed_lost'])
    total_closed = won_deals + lost_deals
    base_win_rate = round((won_deals / total_closed) * 100) if total_closed > 0 else 0

    # Generate quarterly win rate data with some variation
    import random
    quarters = ['Q1', 'Q2', 'Q3', 'Q4']

    win_rate_data = []
    for quarter in quarters:
        # Add some variation to the base win rate
        variation = random.randint(-10, 10)
        win_rate = max(0, min(100, base_win_rate + variation))

        win_rate_data.append({
            "period": quarter,
            "winRate": win_rate
        })

    return win_rate_data