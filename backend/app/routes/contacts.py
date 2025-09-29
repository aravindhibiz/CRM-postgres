from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel
from ..core.database import get_db
from ..core.auth import (
    get_current_user, require_sales_user, require_any_authenticated,
    can_access_user_data, can_modify_user_data
)
from ..models.user import UserProfile
from ..models.contact import Contact
from ..models.company import Company
from ..schemas.contact import ContactCreate, ContactUpdate, ContactResponse, ContactWithRelations

router = APIRouter()


@router.get("/", response_model=List[ContactWithRelations])
async def get_user_contacts(
    search: Optional[str] = Query(
        None, description="Search by name, email, or company"),
    status: Optional[str] = Query(
        None, description="Filter by status (active/inactive)"),
    companies: Optional[str] = Query(
        None, description="Filter by company IDs (comma-separated)"),
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(require_any_authenticated())
):
    query = db.query(Contact).options(
        joinedload(Contact.company),
        joinedload(Contact.owner),
        joinedload(Contact.deals),
        joinedload(Contact.activities),
        joinedload(Contact.tasks)
    )

    # Role-based filtering
    if current_user.role == 'admin':
        # Admin can see all contacts
        pass
    elif current_user.role == 'sales_manager':
        # Manager can see all contacts (for now, until team structure is implemented)
        pass
    else:
        # Sales reps and users can only see their own contacts
        query = query.filter(Contact.owner_id == current_user.id)

    # Apply search filter
    if search:
        search_term = f"%{search}%"
        query = query.join(Company, Contact.company_id ==
                           Company.id, isouter=True)
        query = query.filter(
            or_(
                Contact.first_name.ilike(search_term),
                Contact.last_name.ilike(search_term),
                Contact.email.ilike(search_term),
                Company.name.ilike(search_term)
            )
        )

    # Apply status filter
    if status:
        query = query.filter(Contact.status == status)

    # Apply company filter
    if companies:
        try:
            company_ids = [UUID(cid.strip())
                           for cid in companies.split(',') if cid.strip()]
            if company_ids:
                query = query.filter(Contact.company_id.in_(company_ids))
        except ValueError:
            pass  # Invalid UUIDs, ignore filter

    contacts = query.order_by(Contact.updated_at.desc()).all()
    return contacts


@router.get("/{contact_id}", response_model=ContactWithRelations)
async def get_contact_by_id(
    contact_id: UUID,
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    contact = db.query(Contact).options(
        joinedload(Contact.company),
        joinedload(Contact.owner),
        joinedload(Contact.deals),
        joinedload(Contact.activities),
        joinedload(Contact.tasks)
    ).filter(Contact.id == contact_id, Contact.owner_id == current_user.id).first()

    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )

    return contact


@router.post("/", response_model=ContactResponse)
async def create_contact(
    contact_data: ContactCreate,
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    # Create contact with current user as owner
    db_contact = Contact(
        **contact_data.dict(exclude={'owner_id'}),
        owner_id=current_user.id
    )

    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)

    return db_contact


@router.put("/{contact_id}", response_model=ContactResponse)
async def update_contact(
    contact_id: UUID,
    contact_data: ContactUpdate,
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    contact = db.query(Contact).filter(
        Contact.id == contact_id,
        Contact.owner_id == current_user.id
    ).first()

    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )

    # Update contact fields
    update_data = contact_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(contact, field, value)

    db.commit()
    db.refresh(contact)

    return contact


@router.delete("/{contact_id}")
async def delete_contact(
    contact_id: UUID,
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    contact = db.query(Contact).filter(
        Contact.id == contact_id,
        Contact.owner_id == current_user.id
    ).first()

    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )

    db.delete(contact)
    db.commit()

    return {"message": "Contact deleted successfully"}


class ImportContactData(BaseModel):
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    mobile: Optional[str] = None
    position: Optional[str] = None
    company_name: Optional[str] = None
    status: str = "active"


@router.post("/import")
async def import_contacts(
    contacts_data: List[ImportContactData],
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    """Import multiple contacts"""
    imported_contacts = []
    errors = []

    for i, contact_data in enumerate(contacts_data):
        try:
            # Create or find company if company_name is provided
            company_id = None
            if contact_data.company_name:
                company = db.query(Company).filter(
                    Company.name == contact_data.company_name
                ).first()

                if not company:
                    # Create new company
                    company = Company(
                        name=contact_data.company_name,
                        owner_id=current_user.id
                    )
                    db.add(company)
                    db.flush()  # Flush to get the ID

                company_id = company.id

            # Create contact
            db_contact = Contact(
                first_name=contact_data.first_name,
                last_name=contact_data.last_name,
                email=contact_data.email,
                phone=contact_data.phone,
                mobile=contact_data.mobile,
                position=contact_data.position,
                status=contact_data.status,
                company_id=company_id,
                owner_id=current_user.id
            )

            db.add(db_contact)
            imported_contacts.append(db_contact)

        except Exception as e:
            errors.append(f"Row {i + 1}: {str(e)}")

    if imported_contacts:
        db.commit()

    return {
        "message": f"Successfully imported {len(imported_contacts)} contacts",
        "imported_count": len(imported_contacts),
        "error_count": len(errors),
        "errors": errors
    }
