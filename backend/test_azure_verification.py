#!/usr/bin/env python3
"""
Test script to verify Azure Blob Storage is working and check for uploaded files.
"""

import os
import sys
from azure.storage.blob import BlobServiceClient
from azure.core.exceptions import AzureError


def check_azure_storage():
    """Check Azure Blob Storage connection and list files."""
    try:
        # Use connection string from environment
        connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
        container_name = os.getenv("AZURE_BLOB_CONTAINER_NAME", "hibiz-lw-crm")

        if not connection_string:
            print("❌ AZURE_STORAGE_CONNECTION_STRING not found")
            return False

        print("🔍 Checking Azure Blob Storage...")
        print(f"Container: {container_name}")

        # Initialize blob service client
        blob_service_client = BlobServiceClient.from_connection_string(
            connection_string)

        # Get container client
        container_client = blob_service_client.get_container_client(
            container_name)

        # Check if container exists
        try:
            properties = container_client.get_container_properties()
            print(f"✅ Container '{container_name}' exists")
            print(f"   Last modified: {properties.last_modified}")
        except Exception as e:
            print(f"❌ Container '{container_name}' not found: {e}")
            return False

        # List all blobs in the container
        print("\n📁 Files in Azure Blob Storage:")
        blob_count = 0
        deal_documents = []

        for blob in container_client.list_blobs():
            blob_count += 1
            size_mb = blob.size / (1024 * 1024) if blob.size else 0
            print(f"   📄 {blob.name}")
            print(f"      Size: {size_mb:.2f} MB")
            print(f"      Last Modified: {blob.last_modified}")
            print(
                f"      Content Type: {blob.content_settings.content_type if blob.content_settings else 'N/A'}")

            if blob.name.startswith('documents/'):
                deal_documents.append(blob.name)
            print()

        if blob_count == 0:
            print("   📭 No files found in Azure Blob Storage")
            print("   ⚠️  This means files might still be going to local storage!")
        else:
            print(f"✅ Found {blob_count} files in Azure Blob Storage")
            if deal_documents:
                print(f"   📄 Deal documents: {len(deal_documents)}")
                for doc in deal_documents[-5:]:  # Show last 5
                    print(f"      - {doc}")

        return True

    except AzureError as e:
        print(f"❌ Azure error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False


def check_local_files():
    """Check what files are in local storage."""
    local_path = "uploads/deals"
    print(f"\n🏠 Checking local storage: {local_path}")

    if not os.path.exists(local_path):
        print("   📭 Local deals folder doesn't exist")
        return

    files = []
    for root, dirs, filenames in os.walk(local_path):
        for filename in filenames:
            filepath = os.path.join(root, filename)
            files.append(filepath)

    if files:
        print(f"   ⚠️  Found {len(files)} files in LOCAL storage:")
        for file in files[-5:]:  # Show last 5
            size = os.path.getsize(file) / (1024 * 1024)
            print(f"      📄 {file} ({size:.2f} MB)")
        print("\n   🔴 WARNING: Files in local storage suggest Azure upload might not be working!")
    else:
        print("   ✅ No files in local storage (good - using Azure)")


if __name__ == "__main__":
    print("🧪 Azure Blob Storage Verification Test")
    print("=" * 50)

    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()

    # Check Azure storage
    azure_success = check_azure_storage()

    # Check local storage
    check_local_files()

    print("\n" + "=" * 50)
    if azure_success:
        print("✅ Azure Blob Storage connection successful!")
        print("💡 To confirm uploads are going to Azure:")
        print("   1. Upload a new file through the app")
        print("   2. Run this script again to see if it appears in Azure")
        print("   3. Check that it doesn't appear in local uploads folder")
    else:
        print("❌ Azure Blob Storage connection failed!")
        print("💡 Check your Azure credentials and container name")
