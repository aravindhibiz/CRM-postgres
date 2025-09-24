from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from uuid import UUID
from ..core.database import get_db
from ..core.auth import get_current_user
from ..models.user import UserProfile
from ..models.company import Company
from ..schemas.company import CompanyCreate, CompanyUpdate, CompanyResponse

router = APIRouter()

@router.get("/", response_model=List[CompanyResponse])
async def get_all_companies(
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    companies = db.query(Company).options(
        joinedload(Company.contacts),
        joinedload(Company.deals)
    ).order_by(Company.name).all()

    return companies

@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company_by_id(
    company_id: UUID,
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    company = db.query(Company).options(
        joinedload(Company.contacts),
        joinedload(Company.deals)
    ).filter(Company.id == company_id).first()

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )

    return company

@router.post("/", response_model=CompanyResponse)
async def create_company(
    company_data: CompanyCreate,
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    db_company = Company(**company_data.dict())

    db.add(db_company)
    db.commit()
    db.refresh(db_company)

    return db_company

@router.put("/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: UUID,
    company_data: CompanyUpdate,
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    company = db.query(Company).filter(Company.id == company_id).first()

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )

    # Update company fields
    update_data = company_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)

    db.commit()
    db.refresh(company)

    return company

@router.delete("/{company_id}")
async def delete_company(
    company_id: UUID,
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    company = db.query(Company).filter(Company.id == company_id).first()

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )

    db.delete(company)
    db.commit()

    return {"message": "Company deleted successfully"}