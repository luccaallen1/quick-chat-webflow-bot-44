# 🗓️ Google Calendar OAuth Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select existing project
3. Enable the Google Calendar API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

## Step 2: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type (unless you have Google Workspace)
3. Fill in required fields:
   - **App name**: "HIPAA Healthcare Agent"
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Add scopes:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
5. Add test users (your email and any others you want to test with)

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Application type: "Web application"
4. Name: "HIPAA Healthcare Agent"
5. **Authorized redirect URIs**:
   - `https://quick-chat-widget-bot.netlify.app/agent`
   - `http://localhost:5173/agent` (for local testing)

## Step 4: Get Your Credentials

After creating, you'll get:
- **Client ID**: `1234567890-abcdefghijklmnop.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-abcdefghijklmnop`

## Step 5: Update Environment Variables

Update your `.env` file:

```bash
# Google OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=your-actual-client-id-here
REACT_APP_GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
```

## Step 6: Test the Integration

1. `npm run build && netlify deploy --prod --dir=dist`
2. Go to https://quick-chat-widget-bot.netlify.app/agent
3. Click "Connect with Google" 
4. Complete OAuth flow
5. Test booking: "I need an appointment tomorrow at 2pm, my name is John"

## 🔒 Security Notes

- **Client Secret**: Only needed for server-side flows (we use it for token exchange)
- **Scopes**: We only request Calendar and basic profile access
- **Data**: All patient data remains encrypted in our system
- **Revocation**: Users can revoke access anytime in Google Account settings

## 🧪 Testing Flow

1. **Connect Google**: OAuth login → Calendar permissions granted
2. **Chat with Agent**: "Hi, I need an appointment"
3. **Provide Details**: Name, phone, preferred time, symptoms
4. **GPT-4o Tools**: Automatically extracts data using function calling
5. **Dual Booking**: 
   - ✅ Encrypted HIPAA storage 
   - ✅ Google Calendar event creation
6. **Confirmation**: Patient gets calendar notification + booking confirmation

## 🚀 Production Checklist

- [ ] Google Cloud Project created
- [ ] Calendar API enabled  
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Redirect URIs added for production domain
- [ ] Environment variables updated
- [ ] Test users added (for testing phase)
- [ ] Request verification for production (if needed)