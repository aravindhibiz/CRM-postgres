# SharePoint Seamless Login Setup Guide

## Overview

This guide explains how to set up **zero-click seamless authentication** from SharePoint Online. When users click a link to your CRM from SharePoint, they will be automatically authenticated without any button clicks.

---

## How It Works

1. **User clicks CRM link in SharePoint** with special parameter: `http://localhost:3000/login?auto=microsoft`
2. **Frontend detects `?auto=microsoft`** parameter
3. **Automatically redirects to Microsoft** (no button click needed)
4. **User is already authenticated** in their browser (SharePoint/Office 365 session)
5. **Microsoft immediately redirects back** with authentication token
6. **User lands on dashboard** - entire flow takes ~2 seconds

**No popups required** - uses direct page redirect for seamless experience.

---

## Quick Setup

### Step 1: Verify Microsoft SSO is Working

Before setting up seamless login, ensure regular Microsoft SSO works:

1. Go to `http://localhost:3000/login`
2. Click "Sign in with Microsoft" button manually
3. Verify popup opens and authentication succeeds

If this doesn't work, see [MICROSOFT_SSO_QUICKSTART.md](./MICROSOFT_SSO_QUICKSTART.md) first.

---

### Step 2: Test Seamless Login

Once regular Microsoft SSO works, test seamless login:

1. **Log out** from your CRM (but stay logged into Office 365/SharePoint)
2. **Open this link**: `http://localhost:3000/login?auto=microsoft`
3. **Expected behavior**:
   - You see a loading overlay: "Signing you in..."
   - Page redirects to Microsoft login
   - Microsoft recognizes your existing session (instant redirect back)
   - You land on dashboard within 2-3 seconds
   - **No popups, no button clicks**

---

## SharePoint Link Configuration

### Option 1: Direct Link in SharePoint

Add a direct link to your SharePoint site:

```
http://localhost:3000/login?auto=microsoft
```

**For Production**:
```
https://your-crm-domain.com/login?auto=microsoft
```

### Option 2: SharePoint Web Part

Create a custom web part with an iframe or direct link:

```html
<a href="http://localhost:3000/login?auto=microsoft" target="_blank">
  Open CRM (Auto Sign-In)
</a>
```

### Option 3: SharePoint App Tile

Add custom app tile in SharePoint app launcher:

1. Go to SharePoint Admin Center
2. Navigate to **Classic features** → **Custom tiles**
3. Add new tile:
   - **Title**: "CRM Portal"
   - **URL**: `http://localhost:3000/login?auto=microsoft`
   - **Image**: Upload your CRM logo

---

## User Experience

### First-Time User (New to CRM)

1. Clicks SharePoint link
2. Sees "Signing you in..." overlay
3. Page redirects to Microsoft (auto-authentication)
4. Account is **automatically created** in CRM with:
   - Email from Microsoft profile
   - First and last name
   - Default role: `sales_rep`
   - `auth_provider`: `microsoft`
5. Redirects to dashboard
6. **Total time**: ~3-5 seconds

### Returning User

1. Clicks SharePoint link
2. Sees "Signing you in..." overlay (briefly)
3. Redirects to Microsoft and immediately back
4. Lands on dashboard
5. **Total time**: ~2 seconds

### User Not Logged into Microsoft

If user is not logged into Office 365/Microsoft:

1. Clicks SharePoint link
2. Microsoft popup shows login page
3. User enters credentials
4. Completes authentication
5. Redirects to dashboard
6. **Total time**: ~10-15 seconds (depends on user typing speed)

---

## Configuration Details

### Frontend Changes

The auto-login is implemented in [frontend/src/pages/login/index.jsx](frontend/src/pages/login/index.jsx):

```javascript
// Detects ?auto=microsoft parameter
useEffect(() => {
  const autoParam = searchParams.get('auto');

  if (autoParam === 'microsoft') {
    console.log('🔄 Auto-login detected: Redirecting to Microsoft...');

    const autoLogin = async () => {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/microsoft/login`);
      const { auth_url } = await response.json();

      // Direct redirect to Microsoft (no popup)
      window.location.href = auth_url;
    };

    setIsAutoLoggingIn(true);
    autoLogin();
  }
}, [searchParams]);
```

### Backend Configuration

Ensure `FRONTEND_URL` is set correctly in [backend/.env](backend/.env):

```env
FRONTEND_URL=http://localhost:3000
```

For production:
```env
FRONTEND_URL=https://your-crm-domain.com
```

---

## Testing Scenarios

### Test 1: Auto-Login While Logged Into Microsoft

**Setup**:
- You're logged into Office 365/SharePoint in browser
- You're logged out of CRM

**Test**:
1. Open: `http://localhost:3000/login?auto=microsoft`
2. Expected: Auto sign-in, redirect to dashboard within 2-3 seconds

### Test 2: Auto-Login While Not Logged Into Microsoft

**Setup**:
- You're NOT logged into Office 365/SharePoint
- You're logged out of CRM

**Test**:
1. Open: `http://localhost:3000/login?auto=microsoft`
2. Expected: Popup shows Microsoft login page
3. Enter credentials
4. Expected: Redirect to dashboard after authentication

### Test 3: Auto-Login with Existing Traditional User

**Setup**:
- User exists in CRM with email/password auth
- User never signed in with Microsoft before

**Test**:
1. Open: `http://localhost:3000/login?auto=microsoft`
2. Sign in with Microsoft using **same email**
3. Expected: Accounts are linked automatically
4. User can now use both login methods

### Test 4: Regular Login Still Works

**Test**:
1. Open: `http://localhost:3000/login` (without `?auto=microsoft`)
2. Expected: Normal login page, no auto-login
3. Can manually click "Sign in with Microsoft" or use email/password

---

## Browser Console Logs

### Successful Auto-Login

Open browser DevTools (F12) → Console:

```
🔄 Auto-login detected: Initiating Microsoft SSO...
🚀 Initiating Microsoft login...
✅ Received auth URL from backend
🪟 Opening Microsoft login popup...
✅ Microsoft callback successful
✅ Token received: Yes
✅ User: user@hibizsolutions.com
✅ Auto-login successful, redirecting to dashboard...
```

### Failed Auto-Login

```
🔄 Auto-login detected: Initiating Microsoft SSO...
❌ Auto-login failed: [error message]
```

User will see the regular login page and can try again manually.

---

## Backend Logs

When auto-login succeeds, backend shows:

```
🔄 Exchanging authorization code for token...
✅ Token acquired successfully
✅ Microsoft user data:
   Email: user@hibizsolutions.com
   Microsoft ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   Name: First Last
✅ Found existing Microsoft user: user@hibizsolutions.com
🎯 Generated JWT token for user
✅ Microsoft SSO successful, redirecting to frontend
```

For new users:
```
➕ Creating new Microsoft SSO user: user@hibizsolutions.com
✅ Created new Microsoft SSO user: user@hibizsolutions.com
```

---

## Troubleshooting

### Issue: Popup Opens but Nothing Happens

**Cause**: User not logged into Microsoft

**Solution**: This is expected - user needs to sign in. The popup will show Microsoft login page.

### Issue: "Popup blocked" Error

**Cause**: Browser blocking popups

**Solution**:
1. Click popup blocker icon in address bar
2. Allow popups for `localhost:3000`
3. Reload the auto-login link

### Issue: Auto-Login Doesn't Trigger

**Symptoms**: Regular login page shows, no automatic popup

**Check**:
1. Verify URL has `?auto=microsoft` parameter
2. Check browser console for errors
3. Ensure JavaScript is enabled
4. Clear browser cache and try again

**Test manually**:
```javascript
// In browser console on login page:
new URLSearchParams(window.location.search).get('auto')
// Should return: "microsoft"
```

### Issue: "Failed to initiate Microsoft login"

**Cause**: Backend not configured or not running

**Solution**:
1. Verify backend is running: `http://localhost:8000/docs`
2. Check `MICROSOFT_CLIENT_ID` in backend `.env`
3. Restart backend: `cd backend && python run.py`
4. Test regular Microsoft SSO first

### Issue: Redirects to Login Page After Success

**Cause**: Frontend URL mismatch

**Check backend/.env**:
```env
FRONTEND_URL=http://localhost:3000  # Should match frontend
```

**Restart backend** after fixing.

---

## Production Deployment

### Step 1: Update Backend Environment

**Production .env**:
```env
MICROSOFT_CLIENT_ID=your-production-client-id
MICROSOFT_CLIENT_SECRET=your-production-client-secret
MICROSOFT_TENANT_ID=your-tenant-id
MICROSOFT_AUTHORITY=https://login.microsoftonline.com/your-tenant-id
MICROSOFT_REDIRECT_URI=https://api.your-domain.com/api/v1/auth/microsoft/callback
FRONTEND_URL=https://your-domain.com
```

### Step 2: Update Azure App Registration

Add production redirect URI in Azure Portal:

1. Go to Azure AD → App registrations → Your app
2. Click **Authentication**
3. Add redirect URI:
   ```
   https://api.your-domain.com/api/v1/auth/microsoft/callback
   ```
4. Click **Save**

### Step 3: SharePoint Link for Production

Update SharePoint links to:
```
https://your-domain.com/login?auto=microsoft
```

### Step 4: Test Production Seamless Login

1. Click SharePoint link
2. Verify auto-login works
3. Check HTTPS is used for all requests
4. Verify redirect URI matches Azure configuration

---

## Advanced Configuration

### Custom Auto Parameter

To use a different parameter (e.g., `?sso=true`), modify [frontend/src/pages/login/index.jsx](frontend/src/pages/login/index.jsx):

```javascript
// Change this line:
if (autoParam === 'microsoft') {

// To:
if (searchParams.get('sso') === 'true') {
```

**SharePoint Link becomes**:
```
http://localhost:3000/login?sso=true
```

### Skip Login Page Entirely

To redirect directly to dashboard (no login page visible):

1. Create new route: `/auto-login`
2. Implement component that immediately triggers SSO
3. Update SharePoint link: `http://localhost:3000/auto-login`

**Example component**:
```javascript
const AutoLogin = () => {
  const { signInWithMicrosoft } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const login = async () => {
      const { user } = await signInWithMicrosoft();
      if (user) navigate('/sales-dashboard');
    };
    login();
  }, []);

  return <div>Authenticating...</div>;
};
```

### Pre-fill User Email

Pass email hint to Microsoft login:

**SharePoint Link**:
```
http://localhost:3000/login?auto=microsoft&email=user@domain.com
```

**Backend modification** (in [backend/app/services/microsoft_sso_service.py](backend/app/services/microsoft_sso_service.py)):

```python
def get_authorization_url(self, state: str, login_hint: str = None):
    auth_url = self.msal_app.get_authorization_request_url(
        scopes=self.scopes,
        state=state,
        redirect_uri=self.redirect_uri,
        login_hint=login_hint  # Adds &login_hint=user@domain.com
    )
    return {"auth_url": auth_url, "state": state}
```

---

## Security Considerations

### CSRF Protection

The implementation includes CSRF protection via state tokens:
- Backend generates unique state token for each login
- State is validated on callback
- Prevents replay attacks

### Token Validation

- Microsoft tokens are validated via Microsoft Graph API
- Backend verifies token authenticity before creating JWT
- No client-side token trust

### Session Management

- JWT tokens expire after configured time (default: 8 hours)
- User must re-authenticate after expiration
- Automatic re-login works seamlessly if still logged into Microsoft

### Popup Security

- Popup has restricted permissions (no toolbars, menus)
- Only redirects to your frontend domain
- Cannot be hijacked by third-party sites

---

## User Training

### For End Users

**Simple Instructions**:
1. Click the "CRM Portal" link in SharePoint
2. You'll be automatically signed in
3. If prompted, enter your Microsoft credentials

**When to Use Manual Login**:
- If auto-login fails, go to `http://localhost:3000/login` and click "Sign in with Microsoft"

### For SharePoint Admins

**Add CRM Link to SharePoint**:
1. Edit SharePoint page
2. Add Quick Links web part
3. Add link: `http://localhost:3000/login?auto=microsoft`
4. Set link text: "CRM Portal (Auto Sign-In)"
5. Publish page

---

## Monitoring & Analytics

### Track Auto-Login Usage

Add analytics to frontend:

```javascript
useEffect(() => {
  const autoParam = searchParams.get('auto');
  if (autoParam === 'microsoft') {
    // Track auto-login attempt
    analytics.track('auto_login_started', {
      method: 'microsoft',
      source: 'sharepoint'
    });
  }
}, [searchParams]);
```

### Backend Logging

Backend already logs all authentication attempts. Check for:
- `🔄 Auto-login detected`
- `✅ Microsoft SSO successful`
- `❌ Auto-login failed`

---

## FAQ

### Q: Does this work on mobile?

**A**: Yes! Auto-login works on mobile browsers. If user is logged into Microsoft mobile app, authentication is seamless.

### Q: Can I use this from Teams?

**A**: Yes! Add your CRM as a Teams app or tab with `?auto=microsoft` parameter. Users will be auto-authenticated.

### Q: What if user has multiple Microsoft accounts?

**A**: Microsoft will prompt user to choose account. First-time setup, then subsequent logins are seamless.

### Q: Does this work with Azure AD B2C?

**A**: Yes, but requires separate Azure AD B2C app registration. Follow same setup with B2C tenant ID.

### Q: Can I force re-authentication?

**A**: Yes, add `?auto=microsoft&prompt=login` to force Microsoft login page even if user is logged in.

---

## Success Metrics

After successful implementation, you should see:

✅ **99% seamless login rate** for users already logged into Microsoft
✅ **Average login time**: 2-3 seconds (down from 10-15 seconds manual)
✅ **Zero user complaints** about authentication friction
✅ **Increased adoption** from SharePoint users

---

## Next Steps

1. ✅ Test auto-login with `?auto=microsoft` parameter
2. ✅ Add SharePoint link to your intranet
3. ✅ Train users on seamless login
4. ✅ Monitor backend logs for authentication patterns
5. ✅ Deploy to production with HTTPS
6. ✅ Set up analytics to track usage

---

**Last Updated**: 2025-01-05 (Auto-login feature implemented)
