from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from uuid import UUID
from ..core.database import get_db
from ..core.auth import get_current_user
from ..models.user import UserProfile
from ..models.contact import Contact
from ..models.company import Company
from ..schemas.contact import ContactCreate, ContactUpdate, ContactResponse, ContactWithRelations

router = APIRouter()

@router.get("/", response_model=List[ContactWithRelations])
async def get_user_contacts(
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    contacts = db.query(Contact).options(
        joinedload(Contact.company),
        joinedload(Contact.owner),
        joinedload(Contact.deals),
        joinedload(Contact.activities),
        joinedload(Contact.tasks)
    ).order_by(Contact.updated_at.desc()).all()

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