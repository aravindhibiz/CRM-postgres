# Microsoft SSO Setup Guide

Complete guide to set up Microsoft SSO authentication for your CRM application.

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Azure AD App Registration](#azure-ad-app-registration)
- [Backend Configuration](#backend-configuration)
- [Testing the Integration](#testing-the-integration)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)

---

## Overview

This CRM application supports three authentication methods:
1. **Traditional Login**: Email and password authentication
2. **Microsoft SSO (Popup)**: "Sign in with Microsoft" button on login page
3. **SharePoint Seamless Login**: Auto-authentication from SharePoint (requires additional setup)

### Key Features
- ✅ Automatic account creation for new Microsoft users
- ✅ Account linking for existing email/password users
- ✅ Backend-driven OAuth flow (no client secrets in frontend)
- ✅ Secure token validation via Microsoft Graph API
- ✅ Default role assignment (sales_rep) for new SSO users

---

## Prerequisites

Before starting, ensure you have:
- Azure AD tenant with admin access
- Microsoft account with appropriate permissions
- Backend running on `http://localhost:8000` (or your configured URL)
- Frontend running on `http://localhost:3000` (or your configured URL)

---

## Azure AD App Registration

### Step 1: Create App Registration

1. Navigate to [Azure Portal](https://portal.azure.com)
2. Go to **Azure Active Directory** → **App registrations**
3. Click **New registration**

### Step 2: Configure Basic Settings

**Application name**: `CRM-SSO` (or your preferred name)

**Supported account types**:
- Select "Accounts in this organizational directory only (Single tenant)"

**Redirect URI**:
- Platform: **Web**
- URI: `http://localhost:8000/api/v1/auth/microsoft/callback`

> **Important**: For production, change this to your production backend URL:
> `https://your-backend-domain.com/api/v1/auth/microsoft/callback`

Click **Register**

### Step 3: Note Your Credentials

After registration, you'll see the **Overview** page. Copy these values:

```
Application (client) ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Directory (tenant) ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Step 4: Create Client Secret

1. Go to **Certificates & secrets** → **Client secrets**
2. Click **New client secret**
3. Description: `CRM Backend Secret`
4. Expiration: **24 months** (recommended)
5. Click **Add**
6. **IMPORTANT**: Copy the secret **Value** immediately (it won't be shown again)

```
Client Secret Value: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 5: Configure API Permissions

1. Go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph** → **Delegated permissions**
4. Add these permissions:
   - `openid` (Sign users in)
   - `email` (View users' email address)
   - `profile` (View users' basic profile)
   - `User.Read` (Sign in and read user profile)

5. Click **Add permissions**
6. Click **Grant admin consent for [Your Tenant]** (if you have admin rights)
7. Click **Yes** to confirm

### Step 6: Enable ID Tokens

1. Go to **Authentication**
2. Under **Implicit grant and hybrid flows**, check:
   - ✅ **ID tokens** (used for implicit and hybrid flows)
3. Click **Save**

### Step 7: Verify Redirect URI

Under **Authentication** → **Platform configurations** → **Web**:
- Ensure redirect URI is: `http://localhost:8000/api/v1/auth/microsoft/callback`
- For production, add: `https://your-backend.com/api/v1/auth/microsoft/callback`

---

## Backend Configuration

### Step 1: Update Environment Variables

Edit `backend/.env` file and add your Microsoft credentials:

```env
# Microsoft SSO Configuration
MICROSOFT_CLIENT_ID=your-application-client-id-here
MICROSOFT_CLIENT_SECRET=your-client-secret-value-here
MICROSOFT_TENANT_ID=your-directory-tenant-id-here
MICROSOFT_AUTHORITY=https://login.microsoftonline.com/your-tenant-id-here
MICROSOFT_REDIRECT_URI=http://localhost:8000/api/v1/auth/microsoft/callback
MICROSOFT_SCOPES=openid email profile User.Read

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:3000
```

**Example with real values**:
```env
MICROSOFT_CLIENT_ID=12345678-1234-1234-1234-123456789012
MICROSOFT_CLIENT_SECRET=abC1Q~xxxxxxxxxxxxxxxxxxxxxxxxxx
MICROSOFT_TENANT_ID=87654321-4321-4321-4321-210987654321
MICROSOFT_AUTHORITY=https://login.microsoftonline.com/87654321-4321-4321-4321-210987654321
MICROSOFT_REDIRECT_URI=http://localhost:8000/api/v1/auth/microsoft/callback
MICROSOFT_SCOPES=openid email profile User.Read
FRONTEND_URL=http://localhost:3000
```

### Step 2: Restart Backend

```bash
cd backend
python run.py
```

Verify the backend is running on `http://localhost:8000`

### Step 3: Verify Database Migration

The database migration should already be applied. If not, run:

```bash
cd backend
python migrations/add_microsoft_sso_fields.py
```

Expected output:
```
Running migration: Add Microsoft SSO fields to user_profiles
Successfully added Microsoft SSO fields to user_profiles table
Migration completed successfully!
```

---

## Testing the Integration

### Test 1: Microsoft Sign-In Button

1. Open frontend: `http://localhost:3000/login`
2. Scroll down to see "Or continue with" section
3. Click **"Sign in with Microsoft"** button
4. A popup window should open with Microsoft login page

### Test 2: New User Registration

1. Sign in with a Microsoft account that **doesn't exist** in your CRM
2. After authentication, a new user should be created with:
   - Email from Microsoft account
   - First name and last name from Microsoft profile
   - Role: `sales_rep` (default)
   - `auth_provider`: `microsoft`
   - `microsoft_id`: Set to Microsoft user ID

3. Verify in database:
```sql
SELECT email, first_name, last_name, auth_provider, microsoft_id, role
FROM user_profiles
WHERE auth_provider = 'microsoft';
```

### Test 3: Existing User Account Linking

1. Create a user with email/password: `test@example.com`
2. Sign in with Microsoft using the same email: `test@example.com`
3. The system should **link** the accounts:
   - User's `microsoft_id` will be populated
   - User's `auth_provider` will change to `microsoft`
   - User can now sign in with either method

4. Verify in database:
```sql
SELECT email, auth_provider, microsoft_id, hashed_password
FROM user_profiles
WHERE email = 'test@example.com';
```

### Test 4: Existing Microsoft User Login

1. Sign in with a Microsoft account that's already registered
2. User should be logged in immediately
3. Check browser console for logs:
```
✅ Found existing Microsoft user: user@example.com
✅ Microsoft SSO successful, redirecting to frontend
```

### Test 5: Error Handling

**Test popup blocker**:
1. Enable popup blocker in browser
2. Try Microsoft sign-in
3. Should show error: "Popup blocked. Please allow popups for this site and try again."

**Test cancelled login**:
1. Click Microsoft sign-in
2. Close popup window without logging in
3. Should show error: "Login cancelled by user"

---

## Troubleshooting

### Issue: "Failed to initiate Microsoft login"

**Cause**: Backend configuration missing or incorrect

**Solution**:
1. Check `backend/.env` has all Microsoft variables
2. Verify `MICROSOFT_CLIENT_ID` is correct (no spaces)
3. Restart backend after changing `.env`
4. Check backend logs for specific error

### Issue: "Invalid redirect URI"

**Cause**: Redirect URI mismatch between Azure and backend config

**Solution**:
1. In Azure Portal, go to App Registration → Authentication
2. Ensure redirect URI exactly matches: `http://localhost:8000/api/v1/auth/microsoft/callback`
3. No trailing slashes
4. Protocol must match (http vs https)
5. Port must match

### Issue: "AADSTS50011: The reply URL specified in the request does not match"

**Cause**: The redirect URI in your backend doesn't match Azure

**Solution**:
```env
# In backend/.env, ensure this matches Azure exactly:
MICROSOFT_REDIRECT_URI=http://localhost:8000/api/v1/auth/microsoft/callback
```

### Issue: "Failed to acquire token from Microsoft"

**Cause**: Client secret expired or incorrect

**Solution**:
1. Go to Azure Portal → App Registration → Certificates & secrets
2. Create new client secret
3. Update `MICROSOFT_CLIENT_SECRET` in `.env`
4. Restart backend

### Issue: "Invalid Microsoft access token" (Silent SSO)

**Cause**: Token validation failed or Graph API permission missing

**Solution**:
1. Verify `User.Read` permission is granted in Azure
2. Check if admin consent was granted
3. Token may be expired (Microsoft tokens typically expire after 1 hour)

### Issue: User created but permissions not loading

**Cause**: Default role not properly assigned

**Solution**:
1. Check database: `SELECT role FROM user_profiles WHERE email = 'user@example.com'`
2. Default should be `sales_rep`
3. Verify role has permissions in database
4. Run: `SELECT * FROM role_permissions WHERE role_name = 'sales_rep'`

### Issue: Popup stays on Microsoft page

**Cause**: User denied permissions or browser security settings

**Solution**:
1. User must accept all requested permissions
2. Check browser console for CORS errors
3. Ensure `FRONTEND_URL` in backend `.env` matches frontend origin
4. Verify browser allows third-party cookies

---

## Security Considerations

### Production Deployment

When deploying to production, **update these settings**:

#### 1. Backend `.env`
```env
# Use HTTPS URLs
MICROSOFT_REDIRECT_URI=https://api.yourapp.com/api/v1/auth/microsoft/callback
FRONTEND_URL=https://yourapp.com
```

#### 2. Azure App Registration
- Add production redirect URI: `https://api.yourapp.com/api/v1/auth/microsoft/callback`
- Keep development URI for local testing
- Both can coexist in Azure

#### 3. Client Secret Rotation
- Client secrets expire (6 months, 12 months, or 24 months)
- Set calendar reminder to rotate before expiration
- Can have multiple active secrets for zero-downtime rotation

#### 4. CORS Configuration
Update `backend/app/main.py` CORS settings:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourapp.com"],  # Specific origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Security Best Practices

✅ **DO**:
- Store credentials in `.env` files (never commit to git)
- Use HTTPS in production
- Rotate client secrets before expiration
- Implement rate limiting on auth endpoints
- Monitor failed authentication attempts
- Use single-tenant Azure apps when possible
- Validate tokens on every request
- Set appropriate token expiration times

❌ **DON'T**:
- Commit `.env` files to version control
- Share client secrets via email/chat
- Use the same client secret for dev and prod
- Allow HTTP in production
- Store tokens in browser localStorage without encryption
- Skip token validation
- Grant more permissions than needed

---

## Advanced Features

### SharePoint Seamless Login

For SharePoint integration, additional setup is required:

1. **SharePoint App Registration**:
   - Separate app registration or same one with additional permissions
   - Add SharePoint API permissions

2. **Frontend Integration**:
   - Implement `@microsoft/sp-http` to get SharePoint context
   - Extract Microsoft access token from SharePoint
   - Pass to backend `/api/v1/auth/microsoft/silent` endpoint

3. **URL Parameters**:
   - Add `?sso=auto` to CRM URL when linking from SharePoint
   - Frontend will detect and attempt silent authentication

**Example SharePoint Link**:
```
https://yourapp.com/?sso=auto
```

### Custom Role Mapping

To assign roles based on Azure AD groups:

1. Update `backend/app/services/user_service.py`:
```python
def get_or_create_microsoft_user(self, email, microsoft_id, first_name, last_name):
    # Add logic to check Azure AD group membership
    # Map groups to roles: "Admins" → "admin", "Sales Managers" → "sales_manager"
    role = self.get_role_from_azure_groups(microsoft_id)
    # ... rest of function
```

2. Use Microsoft Graph API to fetch user's groups
3. Map group names to your CRM roles

---

## Support & Resources

### Documentation Links
- [Microsoft Identity Platform](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [MSAL Python Documentation](https://msal-python.readthedocs.io/)
- [Microsoft Graph API](https://docs.microsoft.com/en-us/graph/)

### Common Error Codes
- `AADSTS50011`: Reply URL mismatch
- `AADSTS50020`: User account does not exist
- `AADSTS50076`: MFA required but not configured
- `AADSTS65001`: User consent required

### Backend Logs
Check terminal running backend for detailed logs:
- `🔄 Exchanging authorization code for token...`
- `✅ Microsoft user data: ...`
- `✅ Created new Microsoft SSO user: ...`
- `🔗 Linking Microsoft account to existing user: ...`

### Frontend Logs
Check browser console (F12) for:
- `Microsoft SSO successful, token set: Yes`
- `✅ Microsoft callback successful`
- Any error messages from failed authentication

---

## Next Steps

After successful setup:

1. ✅ Test all three authentication methods
2. ✅ Verify user creation and account linking
3. ✅ Test permissions loading after SSO login
4. ✅ Update `.env.example` with production values
5. ✅ Configure production Azure app registration
6. ✅ Set up monitoring and alerting for auth failures
7. ✅ Document internal procedures for your team

---

## Changelog

### Version 1.0 (Current)
- Initial Microsoft SSO implementation
- Popup OAuth flow
- Automatic user creation
- Account linking support
- Backend-driven authentication
- Silent SSO placeholder for SharePoint

---

## Contact

For issues or questions about this implementation:
1. Check backend logs: `backend/logs/` or terminal output
2. Check frontend console: Browser Developer Tools (F12)
3. Review this documentation thoroughly
4. Check Azure AD audit logs for authentication events

---

**Last Updated**: 2025-01-05
