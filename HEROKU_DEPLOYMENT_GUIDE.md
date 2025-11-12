# Heroku Deployment Guide - Outlook Calendar Integration

This guide covers deploying the CRM application with Outlook Calendar integration to Heroku.

## Prerequisites

- Heroku account and CLI installed
- Azure app registration (same one used for Microsoft SSO)
- Production database (Heroku Postgres or Azure Database)

---

## Step 1: Configure Environment Variables on Heroku

After deploying to Heroku, set these environment variables:

```bash
# Database
heroku config:set DATABASE_URL="postgresql://user:password@host:5432/dbname"

# JWT
heroku config:set SECRET_KEY="your-production-secret-key"
heroku config:set ALGORITHM="HS256"
heroku config:set ACCESS_TOKEN_EXPIRE_MINUTES="480"

# Microsoft SSO
heroku config:set MICROSOFT_CLIENT_ID="your-azure-client-id"
heroku config:set MICROSOFT_CLIENT_SECRET="your-azure-client-secret"
heroku config:set MICROSOFT_TENANT_ID="your-azure-tenant-id"
heroku config:set MICROSOFT_AUTHORITY="https://login.microsoftonline.com/your-tenant-id"
heroku config:set MICROSOFT_REDIRECT_URI="https://your-app-name.herokuapp.com/api/v1/auth/microsoft/callback"

# Microsoft Calendar OAuth - CRITICAL!
heroku config:set MICROSOFT_CALENDAR_REDIRECT_URI="https://your-app-name.herokuapp.com/api/v1/calendar-integration/outlook-calendar/callback"

# Frontend URL
heroku config:set FRONTEND_URL="https://your-frontend-app.herokuapp.com"

# Encryption (IMPORTANT: Generate new key for production)
heroku config:set INTEGRATION_ENCRYPTION_KEY="generate-new-secure-key-here"

# Email (SMTP)
heroku config:set SMTP_HOST="smtp.office365.com"
heroku config:set SMTP_PORT="587"
heroku config:set SMTP_USER="Hibizappsadmin@hibizsolutions.com"
heroku config:set SMTP_PASS="your-password"
heroku config:set FROM_EMAIL="Hibizappsadmin@hibizsolutions.com"

# Azure Storage (optional)
heroku config:set AZURE_STORAGE_ACCOUNT_NAME="hibizstorage"
heroku config:set AZURE_STORAGE_ACCOUNT_KEY="your-key"
heroku config:set AZURE_BLOB_CONTAINER_NAME="hibiz-lw-crm"
heroku config:set STORAGE_BACKEND="azure_blob"
```

**Replace:**
- `your-app-name` with your actual Heroku app name
- `your-frontend-app` with your frontend Heroku app name
- `generate-new-secure-key-here` with a new random key (see below)

---

## Step 2: Generate Production Encryption Key

**CRITICAL:** Never use development keys in production!

```python
# Run this Python script to generate a secure key
from cryptography.fernet import Fernet
print(Fernet.generate_key().decode())
```

Or use this bash command:
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Set the output as `INTEGRATION_ENCRYPTION_KEY`.

---

## Step 3: Update Azure App Registration

Go to [Azure Portal](https://portal.azure.com) → Azure Active Directory → App registrations → Your App

### 3.1 Add Redirect URIs

**Authentication** → **Redirect URIs** → Add these:

**For Calendar Integration:**
```
https://your-app-name.herokuapp.com/api/v1/calendar-integration/outlook-calendar/callback
```

**For SSO (if not already added):**
```
https://your-app-name.herokuapp.com/api/v1/auth/microsoft/callback
```

### 3.2 Verify API Permissions

**API permissions** → Ensure these are present:

- ✅ `Calendars.ReadWrite` (Delegated)
- ✅ `OnlineMeetings.ReadWrite` (Delegated)
- ✅ `User.Read` (Delegated)
- ✅ `offline_access` (Delegated)

### 3.3 Grant Admin Consent

Click **"Grant admin consent for [Your Organization]"** button.

This allows all users to connect without individual approval.

---

## Step 4: Update Frontend Environment Variables

In your frontend `.env.production`:

```bash
REACT_APP_API_URL=https://your-app-name.herokuapp.com
REACT_APP_MICROSOFT_CLIENT_ID=12688f57-8ed9-4b9d-a0d6-447f0c348a1d
```

---

## Step 5: Database Migration

After deploying, run the migration to add calendar fields:

```bash
heroku run python -m app.migrations.add_calendar_fields_to_activities
```

Or if using Alembic:
```bash
heroku run alembic upgrade head
```

---

## Step 6: Verify Deployment

### 6.1 Test Backend API
```bash
curl https://your-app-name.herokuapp.com/api/v1/health
```

### 6.2 Test Calendar OAuth Flow
1. Go to your frontend: `https://your-frontend-app.herokuapp.com`
2. Navigate to Settings → Integrations
3. Click "Connect" on Microsoft Outlook Calendar
4. Complete OAuth flow
5. Verify status shows "Connected"

### 6.3 Test Calendar Sync
1. Go to Activity Timeline page
2. Select a contact
3. Click Calendar view
4. Your Outlook events should appear

---

## Step 7: Security Hardening (Critical for Production)

### 7.1 Implement Token Encryption

Edit `backend/app/core/security.py` (create if doesn't exist):

```python
from cryptography.fernet import Fernet
from ..core.config import settings

# Initialize cipher with key from environment
cipher = Fernet(settings.INTEGRATION_ENCRYPTION_KEY.encode())

def encrypt_token(token: str) -> str:
    """Encrypt OAuth tokens before storing in database"""
    if not token:
        return token
    return cipher.encrypt(token.encode()).decode()

def decrypt_token(encrypted_token: str) -> str:
    """Decrypt OAuth tokens when retrieving from database"""
    if not encrypted_token:
        return encrypted_token
    return cipher.decrypt(encrypted_token.encode()).decode()
```

### 7.2 Update calendar_integration.py

Replace the placeholder functions:

```python
# Remove old placeholder functions
# Import from security module instead
from ..core.security import encrypt_token, decrypt_token
```

### 7.3 Enable HTTPS Only

In `backend/app/main.py`, add middleware:

```python
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware

if not settings.DEBUG:  # Only in production
    app.add_middleware(HTTPSRedirectMiddleware)
```

---

## Step 8: Monitoring & Logging

### 8.1 Enable Heroku Logs
```bash
heroku logs --tail --app your-app-name
```

### 8.2 Add Logging to Calendar Service

Update `backend/app/services/outlook_calendar_service.py`:

```python
import logging

logger = logging.getLogger(__name__)

# In sync methods:
logger.info(f"Starting calendar sync for user {user_id}")
logger.error(f"Calendar sync failed: {str(e)}")
```

### 8.3 Add New Relic or Sentry (Optional)

For production monitoring:
```bash
heroku addons:create newrelic:wayne
# or
heroku addons:create sentry:development
```

---

## Common Deployment Issues & Solutions

### Issue 1: "Calendar redirect URI not configured"
**Cause:** `MICROSOFT_CALENDAR_REDIRECT_URI` not set
**Fix:**
```bash
heroku config:set MICROSOFT_CALENDAR_REDIRECT_URI="https://your-app.herokuapp.com/api/v1/calendar-integration/outlook-calendar/callback"
```

### Issue 2: "Need admin approval" error in OAuth
**Cause:** Admin consent not granted in Azure
**Fix:** Go to Azure Portal → App permissions → Grant admin consent

### Issue 3: OAuth callback fails with 404
**Cause:** Redirect URI not registered in Azure
**Fix:** Add the Heroku callback URL to Azure app registration

### Issue 4: Token decryption fails
**Cause:** Encryption key changed or not set
**Fix:** Set `INTEGRATION_ENCRYPTION_KEY` to a consistent value

### Issue 5: CORS errors
**Cause:** Frontend URL not configured
**Fix:**
```bash
heroku config:set FRONTEND_URL="https://your-frontend.herokuapp.com"
```

---

## Production Checklist

Before going live, verify:

- [ ] All environment variables set on Heroku
- [ ] Redirect URIs added to Azure app registration
- [ ] Admin consent granted for API permissions
- [ ] Token encryption implemented (not placeholder)
- [ ] Database migration completed
- [ ] HTTPS enforced (no HTTP)
- [ ] Logging configured
- [ ] Error monitoring setup (Sentry/New Relic)
- [ ] Tested OAuth flow end-to-end
- [ ] Tested calendar sync both directions (Outlook → CRM, CRM → Outlook)
- [ ] Backup strategy in place for database
- [ ] Rate limiting configured (optional but recommended)

---

## Rollback Plan

If deployment fails:

1. **Rollback code:**
   ```bash
   heroku rollback
   ```

2. **Check logs:**
   ```bash
   heroku logs --tail
   ```

3. **Revert database migration (if needed):**
   ```bash
   heroku run alembic downgrade -1
   ```

---

## Support & Troubleshooting

**View config:**
```bash
heroku config --app your-app-name
```

**Run database queries:**
```bash
heroku pg:psql --app your-app-name
```

**Restart dyno:**
```bash
heroku restart --app your-app-name
```

**Scale dynos:**
```bash
heroku ps:scale web=1 --app your-app-name
```

---

## Security Best Practices

1. **Never commit `.env` to git** - Use `.gitignore`
2. **Rotate secrets regularly** - Update keys every 90 days
3. **Use different keys for dev/prod** - Never reuse development secrets
4. **Enable 2FA on Heroku** - Protect your deployment account
5. **Monitor failed OAuth attempts** - Set up alerts for suspicious activity
6. **Encrypt all tokens** - Never store plaintext OAuth tokens
7. **Use HTTPS only** - Redirect all HTTP traffic

---

## Next Steps

After successful deployment:

1. Test with real users in staging environment
2. Monitor error rates and performance
3. Set up automated backups
4. Configure auto-scaling if needed
5. Implement webhook support for real-time sync (optional)
6. Add comprehensive test coverage
7. Document user onboarding process

---

## Questions?

Contact your dev team or refer to:
- [Heroku Documentation](https://devcenter.heroku.com/)
- [Microsoft Graph API Docs](https://learn.microsoft.com/en-us/graph/)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)
