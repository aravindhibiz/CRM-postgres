# Azure Blob Storage Integration Guide

This guide explains how to set up and use Azure Blob Storage in your CRM application.

## Overview

Your CRM application now supports two storage backends:
- **Local Storage**: Files stored on the server's file system (default)
- **Azure Blob Storage**: Files stored in Microsoft Azure cloud storage

## Azure Blob Storage Setup

### 1. Create Azure Storage Account

1. Go to the [Azure Portal](https://portal.azure.com)
2. Create a new **Storage Account**
3. Choose a globally unique name (e.g., `yourcompanycrmstorage`)
4. Select your region and performance tier
5. Create the storage account

### 2. Create Blob Container

1. Navigate to your storage account
2. Go to **Containers** in the left menu
3. Click **+ Container**
4. Name it `crm-files` (or customize in environment variables)
5. Set access level to **Private** (recommended for security)

### 3. Get Connection Information

**Option A: Connection String (Recommended)**
1. Go to **Access keys** in your storage account
2. Copy the **Connection string** from key1 or key2

**Option B: Account Name + Key**
1. Go to **Access keys** in your storage account
2. Copy the **Storage account name**
3. Copy the **Key** from key1 or key2

### 4. Configure Environment Variables

Add these to your `.env` file in the backend directory:

```bash
# Storage Configuration
STORAGE_BACKEND=azure_blob

# Azure Blob Storage Configuration
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=youraccountname;AccountKey=youraccountkey;EndpointSuffix=core.windows.net

# OR use individual values
# AZURE_STORAGE_ACCOUNT_NAME=youraccountname
# AZURE_STORAGE_ACCOUNT_KEY=youraccountkey

# Container name (optional, defaults to 'crm-files')
AZURE_BLOB_CONTAINER_NAME=crm-files
```

### 5. Restart Your Application

Stop and restart your FastAPI backend server to apply the new configuration.

## Usage

### File Upload

When Azure Blob Storage is configured (`STORAGE_BACKEND=azure_blob`), all file uploads will automatically be stored in Azure:

- Deal documents
- Email attachments
- Import/export files

### File Structure in Azure

Files are organized in the blob container with this structure:
```
crm-files/
├── deals/
│   ├── uuid1.pdf
│   ├── uuid2.docx
│   └── ...
└── emails/
    ├── uuid3.jpg
    ├── uuid4.pdf
    └── ...
```

### Security Features

1. **Private Container**: Files are not publicly accessible
2. **Unique Filenames**: Files are stored with UUID-based names
3. **Access Control**: Only authenticated users can upload/download
4. **Metadata**: File information stored in database for tracking

## API Endpoints

### Check Storage Configuration
```http
GET /api/v1/storage/config
```

Response:
```json
{
  "backend": "azure_blob",
  "max_file_size": 10485760,
  "max_file_size_mb": 10.0,
  "allowed_extensions": [".pdf", ".doc", ".docx", ...],
  "azure_configured": true,
  "container_name": "crm-files"
}
```

### Check Storage Health
```http
GET /api/v1/storage/health
```

Response:
```json
{
  "status": "healthy",
  "backend": "azure_blob",
  "message": "Azure Blob Storage service initialized successfully"
}
```

## Migration from Local to Azure

If you have existing files in local storage and want to migrate to Azure:

1. Set up Azure Blob Storage as described above
2. Keep `STORAGE_BACKEND=local` initially
3. Create a migration script to upload existing files to Azure
4. Update database records with new Azure blob paths
5. Switch to `STORAGE_BACKEND=azure_blob`

## Cost Considerations

Azure Blob Storage pricing includes:
- **Storage costs**: ~$0.02-0.04 per GB per month (varies by tier)
- **Transaction costs**: ~$0.004 per 10,000 operations
- **Data transfer**: Free inbound, charges for outbound (if significant)

For a typical CRM with moderate file usage, costs are usually under $5-20/month.

## Troubleshooting

### Common Issues

1. **Connection Error**: Check your connection string/keys
2. **Container Not Found**: Ensure container exists and name matches
3. **Access Denied**: Verify account keys and permissions
4. **File Not Found**: Check if file was uploaded successfully

### Debug Steps

1. Check storage health endpoint: `GET /api/v1/storage/health`
2. Verify environment variables are loaded
3. Check Azure Portal for container and files
4. Review application logs for detailed errors

### Switching Back to Local Storage

To switch back to local file storage:
1. Change `STORAGE_BACKEND=local` in `.env`
2. Restart the application
3. New uploads will use local storage
4. Existing Azure files remain accessible if you switch back

## Advanced Configuration

### Custom Container Name
```bash
AZURE_BLOB_CONTAINER_NAME=my-custom-container
```

### Local Storage Path (when using local backend)
```bash
LOCAL_STORAGE_PATH=/custom/upload/path
```

### File Size Limits
The application enforces a 10MB file size limit by default. This is configurable in the application code if needed.

## Security Best Practices

1. **Use Private Containers**: Never set blob containers to public access
2. **Rotate Keys**: Regularly rotate your storage account keys
3. **Monitor Access**: Enable logging in Azure Storage to monitor file access
4. **Network Security**: Consider using Azure Private Endpoints for enhanced security
5. **Backup**: Enable Azure Storage backup and versioning for important data

## Support

For issues with Azure Blob Storage integration:
1. Check the storage health endpoint
2. Review application logs
3. Verify Azure configuration in Azure Portal
4. Test with a simple file upload through the UI