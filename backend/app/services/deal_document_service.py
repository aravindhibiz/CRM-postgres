"""
Deal Document service for business logic.
"""

import os
import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException, status

from ..models.deal_document import DealDocument
from ..models.deal import Deal
from ..models.user import UserProfile


class DealDocumentService:
    """Service class for deal document business logic."""

    def __init__(self, db: Session):
        self.db = db

    def get_deal_documents(self, deal_id: uuid.UUID) -> List[DealDocument]:
        """
        Retrieve all documents for a specific deal.

        Args:
            deal_id: UUID of the deal

        Returns:
            List of DealDocument objects
        """
        return (
            self.db.query(DealDocument)
            .filter(DealDocument.deal_id == deal_id)
            .order_by(DealDocument.created_at.desc())
            .all()
        )

    async def upload_document(
        self,
        deal_id: uuid.UUID,
        file: UploadFile,
        current_user: UserProfile,
        upload_dir: str = "uploads/deals"
    ) -> DealDocument:
        """
        Upload a document for a deal.

        Args:
            deal_id: UUID of the deal
            file: The uploaded file
            current_user: The user uploading the document
            upload_dir: Directory to store uploaded files

        Returns:
            Created DealDocument object
        """
        # Verify deal exists
        deal = self.db.query(Deal).filter(Deal.id == deal_id).first()
        if not deal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Deal not found"
            )

        # Create upload directory if it doesn't exist
        os.makedirs(upload_dir, exist_ok=True)

        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)

        # Save file to disk
        try:
            contents = await file.read()
            with open(file_path, "wb") as f:
                f.write(contents)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save file: {str(e)}"
            )

        # Get file size
        file_size = len(contents)

        # Create database record
        document = DealDocument(
            name=file.filename,
            file_path=file_path,
            file_size=str(file_size),
            mime_type=file.content_type,
            deal_id=deal_id,
            uploaded_by=current_user.id
        )

        self.db.add(document)
        self.db.commit()
        self.db.refresh(document)

        return document

    def delete_document(self, document_id: uuid.UUID) -> bool:
        """
        Delete a document.

        Args:
            document_id: UUID of the document to delete

        Returns:
            True if deleted successfully
        """
        document = (
            self.db.query(DealDocument)
            .filter(DealDocument.id == document_id)
            .first()
        )

        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )

        # Delete file from disk
        try:
            if os.path.exists(document.file_path):
                os.remove(document.file_path)
        except Exception as e:
            print(f"Warning: Failed to delete file from disk: {str(e)}")

        # Delete database record
        self.db.delete(document)
        self.db.commit()

        return True

    def get_document(self, document_id: uuid.UUID) -> Optional[DealDocument]:
        """
        Get a single document by ID.

        Args:
            document_id: UUID of the document

        Returns:
            DealDocument object or None
        """
        return (
            self.db.query(DealDocument)
            .filter(DealDocument.id == document_id)
            .first()
        )
