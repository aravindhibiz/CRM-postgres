"""
Demo script to test Azure Blob Storage integration with the CRM application.
"""
import os
import sys
import asyncio
import tempfile
from pathlib import Path

# Add the backend app to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.services.file_storage_factory import get_file_storage_service
from app.core.storage_config import get_storage_config


async def demo_azure_storage():
    """Demonstrate Azure Blob Storage integration."""
    print("=== CRM Azure Blob Storage Demo ===\n")
    
    # Get storage configuration
    config = get_storage_config()
    print(f"Storage Backend: {config.backend.value}")
    print(f"Max File Size: {config.max_file_size / (1024*1024):.1f} MB")
    print(f"Container: {config.azure.container_name}")
    print()
    
    # Get storage service
    storage_service = get_file_storage_service()
    print("✅ Storage service initialized successfully")
    
    # Create a test file
    test_content = b"""
    This is a test document for the CRM system.
    
    File Details:
    - Uploaded via Azure Blob Storage
    - Organization: deals/
    - Purpose: Demo integration
    
    The file upload system now supports:
    ✅ Local storage (for development)
    ✅ Azure Blob Storage (for production)
    ✅ Automatic file organization
    ✅ Secure access control
    ✅ File size validation
    ✅ MIME type detection
    """
    
    test_filename = "demo-document.txt"
    
    print("📤 Uploading test document to Azure...")
    
    # Upload file
    file_path = storage_service.upload_file(
        file_content=test_content,
        blob_name=test_filename,
        content_type="text/plain",
        folder="deals"
    )
    
    print(f"✅ File uploaded successfully: {file_path}")
    print()
    
    # Download file
    print("📥 Downloading file from Azure...")
    downloaded_content = storage_service.download_file(file_path)
    
    if downloaded_content == test_content:
        print("✅ File downloaded and verified successfully")
    else:
        print("❌ File content mismatch!")
        return
    
    # Get file info
    print("\n📊 File Information:")
    file_info = storage_service.get_file_info(file_path)
    print(f"  Name: {file_info['name']}")
    print(f"  Size: {file_info['size']} bytes")
    print(f"  Content Type: {file_info['content_type']}")
    print(f"  Last Modified: {file_info['last_modified']}")
    print(f"  URL: {file_info['url']}")
    
    # Test file exists
    exists = storage_service.file_exists(file_path)
    print(f"  Exists: {exists}")
    
    # Clean up
    print("\n🧹 Cleaning up test file...")
    deleted = storage_service.delete_file(file_path)
    print(f"✅ File deleted: {deleted}")
    
    # Verify deletion
    exists_after_delete = storage_service.file_exists(file_path)
    print(f"  File exists after deletion: {exists_after_delete}")
    
    print("\n🎉 Azure Blob Storage integration demo completed successfully!")
    print("\nYour CRM application is now ready to use Azure cloud storage for:")
    print("  • Deal documents")
    print("  • Email attachments")
    print("  • Import/export files")
    print("  • Any other file uploads")


if __name__ == "__main__":
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Run the demo
    asyncio.run(demo_azure_storage())