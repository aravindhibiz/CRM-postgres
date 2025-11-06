# Microsoft SSO Testing Guide

## Current Status

**Configuration Fixed**: The MSAL scope configuration error has been resolved.

### What Was Fixed
- **Issue**: Reserved scopes ('openid', 'profile') were explicitly included in MICROSOFT_SCOPES
- **Error**: "You cannot use any scope value that is reserved"
- **Fix**: Changed `MICROSOFT_SCOPES` from `openid email profile User.Read` to `User.Read email`
- **File**: `backend/.env` line 19

### Why This Works
MSAL Python automatically adds reserved scopes ('openid', 'profile', 'offline_access') to every request. Explicitly including them causes an error. We now only specify the additional scopes we need: `User.Read` (for Microsoft Graph API) and `email` (for email address access).

---

## Testing Steps

### Step 1: Restart Backend (REQUIRED)

The backend is currently running but needs to be restarted to load the new configuration:

**Option A: Using Task Manager (Windows)**
1. Open Task Manager (Ctrl + Shift + Esc)
2. Find process with PID 15880 (or search for "python")
3. End the process
4. Open terminal in `d:\CRM-postgres\backend`
5. Run: `python run.py`

**Option B: Using Terminal**
```bash
# Kill existing backend process
taskkill /PID 15880 /F

# Start backend
cd d:\CRM-postgres\backend
python run.py
```

**Expected Output:**
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

### Step 2: Test Microsoft SSO Login

1. **Open Frontend**: Navigate to `http://localhost:3000/login`

2. **Click "Sign in with Microsoft"**:
   - Button should be visible below the traditional login form
   - Should have Microsoft logo icon

3. **Expected Popup Behavior**:
   - ✅ A centered popup window (600x700) should open
   - ✅ Popup should show Microsoft login page
   - ✅ No error about reserved scopes
   - ✅ URL should be `login.microsoftonline.com/7ba118fb-fa31-45b6-918a-24dd21e641db/oauth2/v2.0/authorize`

4. **Sign In with Microsoft Account**:
   - Use a Microsoft account from your tenant
   - Email domain should match your organization (e.g., `@hibizsolutions.com`)

5. **Expected After Sign-In**:
   - ✅ Popup should close automatically
   - ✅ Main window redirects to `/sales-dashboard`
   - ✅ User is logged in with their name displayed
   - ✅ User permissions are loaded

---

### Step 3: Verify User Creation

**Check Backend Logs** (should show):
```
🔄 Exchanging authorization code for token...
✅ Token acquired successfully
✅ Microsoft user data:
   Email: user@hibizsolutions.com
   Microsoft ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   Name: First Last
✅ Created new Microsoft SSO user: user@hibizsolutions.com
🎯 Generated JWT token for user
✅ Microsoft SSO successful, redirecting to frontend
```

**Check Database**:
```sql
-- Connect to your PostgreSQL database
psql -U postgres -d crm_db

-- Query Microsoft SSO users
SELECT
    email,
    first_name,
    last_name,
    role,
    auth_provider,
    microsoft_id,
    is_active,
    created_at
FROM user_profiles
WHERE auth_provider = 'microsoft'
ORDER BY created_at DESC;
```

**Expected Database Values**:
- `email`: User's Microsoft email (e.g., `user@hibizsolutions.com`)
- `first_name`: User's first name from Microsoft profile
- `last_name`: User's last name from Microsoft profile
- `role`: `sales_rep` (default for new SSO users)
- `auth_provider`: `microsoft`
- `microsoft_id`: Microsoft user ID (GUID format)
- `hashed_password`: `NULL` (SSO users don't need passwords)
- `is_active`: `true`

---

### Step 4: Test Account Linking

**Scenario**: User already exists with email/password, then signs in with Microsoft

1. **Create Traditional User**:
   - Go to `http://localhost:3000/register`
   - Register with email: `test@hibizsolutions.com`
   - Set password and complete registration

2. **Sign In with Microsoft**:
   - Log out
   - Click "Sign in with Microsoft"
   - Sign in with the same email: `test@hibizsolutions.com`

3. **Expected Behavior**:
   - ✅ Popup should close and redirect to dashboard
   - ✅ Backend logs should show:
     ```
     🔗 Linking Microsoft account to existing user: test@hibizsolutions.com
     ✅ Account linked successfully
     ```

4. **Verify Database**:
   ```sql
   SELECT email, auth_provider, microsoft_id, hashed_password
   FROM user_profiles
   WHERE email = 'test@hibizsolutions.com';
   ```
   - `auth_provider`: Should change from `local` to `microsoft`
   - `microsoft_id`: Should now be populated
   - `hashed_password`: Should still exist (user can use either login method)

---

### Step 5: Test Returning User Login

**Scenario**: User with existing Microsoft SSO account signs in again

1. **Sign Out**: Click logout button

2. **Sign In with Microsoft Again**:
   - Click "Sign in with Microsoft"
   - Sign in with previously registered Microsoft account

3. **Expected Behavior**:
   - ✅ Should be faster (no account creation needed)
   - ✅ Backend logs should show:
     ```
     ✅ Found existing Microsoft user: user@hibizsolutions.com
     ✅ Microsoft SSO successful, redirecting to frontend
     ```
   - ✅ User should be logged in to dashboard immediately

---

## Troubleshooting

### Issue: Popup Doesn't Open

**Symptoms**: Nothing happens when clicking "Sign in with Microsoft"

**Solutions**:
1. Check browser console (F12) for errors
2. Ensure popup blocker is disabled for `localhost:3000`
3. Check backend logs for initialization errors
4. Verify backend is running on port 8000

### Issue: "Failed to initiate Microsoft login"

**Symptoms**: Error message appears when clicking button

**Check**:
1. Backend is running and restarted after config change
2. All Microsoft environment variables are set in `.env`
3. No typos in `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID`

**Test Backend Directly**:
```bash
curl http://localhost:8000/api/v1/auth/microsoft/login
```

Expected response:
```json
{
  "auth_url": "https://login.microsoftonline.com/...",
  "state": "random_state_token"
}
```

### Issue: "Invalid redirect URI" Error

**Symptoms**: Microsoft shows error about redirect URI mismatch

**Fix**:
1. Verify Azure App Registration redirect URI is exactly:
   `http://localhost:8000/api/v1/auth/microsoft/callback`
2. Verify `.env` has same value in `MICROSOFT_REDIRECT_URI`
3. No trailing slashes
4. Protocol must be `http` for localhost (https for production)

### Issue: "AADSTS50011: Reply URL mismatch"

**Cause**: The redirect URI doesn't match Azure configuration

**Fix in Azure Portal**:
1. Go to Azure Portal → Azure Active Directory
2. Navigate to App registrations → Your app (CRM-SSO)
3. Click Authentication in left sidebar
4. Under "Platform configurations" → Web
5. Ensure redirect URI is: `http://localhost:8000/api/v1/auth/microsoft/callback`
6. Click Save
7. Wait 2-3 minutes for Azure to propagate changes

### Issue: User Created but No Permissions

**Symptoms**: User logged in but can't access any features

**Check**:
1. Verify user role:
   ```sql
   SELECT email, role FROM user_profiles WHERE auth_provider = 'microsoft';
   ```
2. Default role should be `sales_rep`
3. Verify role has permissions:
   ```sql
   SELECT * FROM role_permissions WHERE role_name = 'sales_rep';
   ```

**Fix if needed**:
```sql
-- Update user role
UPDATE user_profiles
SET role = 'sales_rep'
WHERE email = 'user@hibizsolutions.com';
```

### Issue: Popup Blocked

**Symptoms**: Browser shows "Popup blocked" notification

**Fix**:
1. Click popup blocker icon in address bar
2. Select "Always allow popups from localhost:3000"
3. Try signing in again

### Issue: "Login cancelled by user"

**Symptoms**: Error message after closing popup without completing login

**Expected Behavior**: This is normal if user closes popup
**Fix**: Just try signing in again

---

## Browser Console Logs

### Successful Login Flow

**Frontend Console** (F12 → Console):
```
🚀 Initiating Microsoft login...
✅ Received auth URL from backend
🪟 Opening Microsoft login popup...
✅ Popup opened successfully
🔍 Monitoring popup for completion...
✅ Microsoft callback successful
✅ Token received: Yes
✅ User: user@hibizsolutions.com
🔑 Loading user permissions...
✅ Permissions loaded
🚀 Redirecting to dashboard...
```

### Error Logs to Watch For

**Backend Console**:
- ❌ "Microsoft token acquisition error" → Check client secret
- ❌ "Failed to fetch user info" → Check Graph API permissions
- ❌ "No email found in Microsoft user profile" → Check Azure permissions

**Frontend Console**:
- ❌ "Failed to initiate Microsoft login" → Backend not running or config issue
- ❌ "Popup blocked" → Enable popups for localhost:3000
- ❌ "Invalid callback parameters" → Backend didn't return token properly

---

## Network Tab Inspection

Open browser DevTools (F12) → Network tab to see:

1. **Initial Login Request**:
   ```
   GET http://localhost:8000/api/v1/auth/microsoft/login
   Status: 200 OK
   Response: {"auth_url": "...", "state": "..."}
   ```

2. **Microsoft Authorization** (in popup):
   ```
   GET https://login.microsoftonline.com/7ba118fb-fa31-45b6-918a-24dd21e641db/oauth2/v2.0/authorize
   Status: 302 Found (redirects to Microsoft login)
   ```

3. **Callback to Backend** (in popup):
   ```
   GET http://localhost:8000/api/v1/auth/microsoft/callback?code=...&state=...
   Status: 302 Found
   Location: http://localhost:3000/auth/microsoft/success?token=...&user=...
   ```

4. **Permission Loading** (main window):
   ```
   GET http://localhost:8000/api/v1/permissions/my-permissions
   Status: 200 OK
   Authorization: Bearer <jwt_token>
   ```

---

## Success Criteria

✅ **Configuration**:
- MICROSOFT_SCOPES does not include reserved scopes
- All Microsoft env variables are set correctly
- Backend restarted after config change

✅ **Popup Flow**:
- Popup opens without errors
- Microsoft login page loads
- User can complete authentication
- Popup closes automatically after success

✅ **User Creation**:
- New users are created with microsoft_id
- Default role is 'sales_rep'
- User profile has correct name and email
- auth_provider is set to 'microsoft'

✅ **Account Linking**:
- Existing users can link Microsoft accounts
- Both login methods work after linking
- No duplicate accounts created

✅ **Dashboard Access**:
- User is redirected to /sales-dashboard
- Permissions are loaded correctly
- User can access their role's features

---

## Next Steps After Successful Test

Once Microsoft SSO is working:

1. **Document Internal Procedures**:
   - How to add new users via Microsoft SSO
   - How to manage user roles
   - How to troubleshoot SSO issues

2. **Production Deployment**:
   - Update Azure App Registration with production redirect URI
   - Update backend `.env` with production URLs
   - Use HTTPS for all production URLs
   - Set up client secret rotation reminders

3. **SharePoint Integration** (Optional):
   - Implement SharePoint context detection
   - Extract Microsoft access token from SharePoint
   - Test seamless login with `?sso=auto` parameter

4. **User Training**:
   - Show users how to sign in with Microsoft
   - Explain they can use either login method
   - Document what to do if SSO fails

5. **Monitoring**:
   - Set up logging for authentication failures
   - Monitor Microsoft token expiration issues
   - Track SSO usage vs traditional login

---

## Quick Reference

**Restart Backend**:
```bash
taskkill /PID 15880 /F
cd d:\CRM-postgres\backend
python run.py
```

**Check Backend Health**:
```bash
curl http://localhost:8000/api/v1/auth/microsoft/login
```

**View Recent SSO Users**:
```sql
SELECT email, first_name, last_name, created_at
FROM user_profiles
WHERE auth_provider = 'microsoft'
ORDER BY created_at DESC
LIMIT 10;
```

**Frontend URLs**:
- Login: http://localhost:3000/login
- Dashboard: http://localhost:3000/sales-dashboard
- Callback: http://localhost:3000/auth/microsoft/success

**Backend Endpoints**:
- Initiate: GET http://localhost:8000/api/v1/auth/microsoft/login
- Callback: GET http://localhost:8000/api/v1/auth/microsoft/callback
- Silent SSO: POST http://localhost:8000/api/v1/auth/microsoft/silent

---

**Last Updated**: 2025-01-05 (Scope configuration fix applied)
