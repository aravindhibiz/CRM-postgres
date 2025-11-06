# Microsoft SSO Quick Start Guide

**5-Minute Setup** for Microsoft SSO authentication

## Prerequisites Checklist

- [ ] Azure AD tenant access
- [ ] Admin permissions to create app registrations
- [ ] Backend running (`python run.py`)
- [ ] Frontend running (`npm run dev`)

---

## Step 1: Azure App Registration (3 minutes)

1. Go to [Azure Portal](https://portal.azure.com) → **Azure Active Directory** → **App registrations** → **New registration**

2. Fill in:
   - **Name**: `CRM-SSO`
   - **Account type**: Single tenant
   - **Redirect URI**: Web → `http://localhost:8000/api/v1/auth/microsoft/callback`

3. Click **Register**

4. Copy from **Overview** page:
   ```
   Application (client) ID: ___________________________________
   Directory (tenant) ID: ___________________________________
   ```

5. Go to **Certificates & secrets** → **New client secret**:
   - Description: `Backend`
   - Expires: 24 months
   - Click **Add**
   - **Copy the Value immediately**: ___________________________________

6. Go to **API permissions**:
   - Click **Add a permission** → **Microsoft Graph** → **Delegated**
   - Select: `openid`, `email`, `profile`, `User.Read`
   - Click **Add permissions**
   - Click **Grant admin consent** → **Yes**

7. Go to **Authentication**:
   - Under **Implicit grant**, check: ✅ **ID tokens**
   - Click **Save**

---

## Step 2: Backend Configuration (1 minute)

Edit `backend/.env`:

```env
# Microsoft SSO Configuration
MICROSOFT_CLIENT_ID=paste-your-client-id-here
MICROSOFT_CLIENT_SECRET=paste-your-client-secret-here
MICROSOFT_TENANT_ID=paste-your-tenant-id-here
MICROSOFT_AUTHORITY=https://login.microsoftonline.com/paste-your-tenant-id-here
MICROSOFT_REDIRECT_URI=http://localhost:8000/api/v1/auth/microsoft/callback
MICROSOFT_SCOPES=openid email profile User.Read
FRONTEND_URL=http://localhost:3000
```

Restart backend:
```bash
cd backend
python run.py
```

---

## Step 3: Test (1 minute)

1. Open `http://localhost:3000/login`
2. Scroll down to "Or continue with" section
3. Click **"Sign in with Microsoft"**
4. A popup opens → Sign in with your Microsoft account
5. Accept permissions
6. You're redirected to the dashboard!

---

## Verification

Check if it worked:

1. **Backend logs** should show:
   ```
   ✅ Microsoft user data:
      Email: user@example.com
      Microsoft ID: ...
      Name: First Last
   ✅ Created new Microsoft SSO user: user@example.com
   ✅ Microsoft SSO successful, redirecting to frontend
   ```

2. **Database check**:
   ```sql
   SELECT email, auth_provider, microsoft_id, role
   FROM user_profiles
   WHERE auth_provider = 'microsoft';
   ```

3. **Frontend console** (F12) should show:
   ```
   Microsoft SSO successful, token set: Yes
   ✅ Microsoft callback successful
   ```

---

## Troubleshooting

### Error: "Invalid redirect URI"
→ In Azure: Authentication → Redirect URIs → Ensure exact match: `http://localhost:8000/api/v1/auth/microsoft/callback`

### Error: "Client secret invalid"
→ Copy the **Value** (not Secret ID) from Azure and paste in `.env`

### Error: "Popup blocked"
→ Allow popups for `localhost:3000` in browser settings

### Backend doesn't start
→ Run: `pip install msal==1.29.0 requests==2.31.0`

---

## Production Deployment

When going to production:

1. **Azure**: Add production redirect URI
   ```
   https://your-backend.com/api/v1/auth/microsoft/callback
   ```

2. **Backend `.env`**:
   ```env
   MICROSOFT_REDIRECT_URI=https://your-backend.com/api/v1/auth/microsoft/callback
   FRONTEND_URL=https://your-app.com
   ```

3. Use HTTPS for both URLs

---

## Next Steps

✅ Test with multiple users
✅ Test account linking (create user with email/password, then sign in with Microsoft)
✅ Review full documentation: [MICROSOFT_SSO_SETUP.md](./MICROSOFT_SSO_SETUP.md)
✅ Configure production environment
✅ Set up monitoring

---

## Success! 🎉

Your CRM now supports:
- ✅ Traditional email/password login
- ✅ Microsoft SSO with popup flow
- ✅ Automatic user creation
- ✅ Account linking for existing users

Users can sign in with either method seamlessly!
