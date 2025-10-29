"""
Test script to verify Azure Blob Storage connection.
"""
from azure.core.exceptions import AzureError
from azure.storage.blob import BlobServiceClient
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def test_azure_connection():
    """Test Azure Blob Storage connection."""
    print("🔍 Testing Azure Blob Storage connection...")

    # Get connection string from environment
    connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
    container_name = os.getenv("AZURE_BLOB_CONTAINER_NAME", "hibiz-lw-crm")

    if not connection_string:
        print("❌ AZURE_STORAGE_CONNECTION_STRING not found in environment")
        return False

    try:
        # Initialize blob service client
        blob_service_client = BlobServiceClient.from_connection_string(
            connection_string)
        print(f"✅ Successfully connected to Azure Blob Storage")

        # Test container access
        container_client = blob_service_client.get_container_client(
            container_name)

        try:
            # Try to get container properties
            properties = container_client.get_container_properties()
            print(f"✅ Container '{container_name}' exists and is accessible")
            print(f"   - Created: {properties.last_modified}")

        except Exception as e:
            if "ContainerNotFound" in str(e):
                print(
                    f"⚠️  Container '{container_name}' not found. Creating it...")
                try:
                    container_client.create_container(public_access=None)
                    print(
                        f"✅ Container '{container_name}' created successfully")
                except Exception as create_error:
                    print(f"❌ Failed to create container: {create_error}")
                    return False
            else:
                print(f"❌ Error accessing container: {e}")
                return False

        # Test file upload/download/delete
        print("🧪 Testing file operations...")

        # Test upload
        test_content = b"Hello, Azure Blob Storage! This is a test file."
        test_blob_name = "test/test-file.txt"

        blob_client = blob_service_client.get_blob_client(
            container=container_name,
            blob=test_blob_name
        )

        blob_client.upload_blob(test_content, overwrite=True)
        print("✅ Test file uploaded successfully")

        # Test download
        download_stream = blob_client.download_blob()
        downloaded_content = download_stream.readall()

        if downloaded_content == test_content:
            print("✅ Test file downloaded successfully")
        else:
            print("❌ Downloaded content doesn't match uploaded content")
            return False

        # Test delete
        blob_client.delete_blob()
        print("✅ Test file deleted successfully")

        print("\n🎉 All Azure Blob Storage tests passed!")
        print(f"📊 Configuration:")
        print(f"   - Container: {container_name}")
        print(f"   - Account: {blob_service_client.account_name}")

        return True

    except AzureError as e:
        print(f"❌ Azure error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False


if __name__ == "__main__":
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()

    success = test_azure_connection()

    if success:
        print("\n✅ Azure Blob Storage is ready to use!")
        print("You can now set STORAGE_BACKEND=azure_blob in your .env file")
    else:
        print("\n❌ Azure Blob Storage test failed")
        print("Please check your configuration and try again")

    sys.exit(0 if success else 1)
