# Unipile Google Calendar Integration - Complete Implementation Guide

This document provides the complete implementation guide for integrating Google Calendar using Unipile's hosted authentication and API services.

## 🚀 Overview

We've implemented a production-ready Google Calendar integration using:
- **Unipile Hosted Auth** for secure OAuth flow
- **Supabase** for user and calendar data storage
- **React Frontend** with calendar connection UI
- **n8n Integration** for appointment booking workflows

## 📋 Frontend Implementation Completed

### ✅ Database Schema
- `unipile_accounts` table for storing Unipile account mappings
- `google_calendars` table for calendar selection
- `bookings` table for tracking appointments
- Row Level Security (RLS) for data isolation
- Automatic triggers and functions

### ✅ Frontend Components
- **UnipileService** - Complete service for Unipile API calls
- **GoogleCalendarConnection** - UI component for connection management
- **Success/Failure pages** - OAuth redirect handlers
- **Updated EmbeddedChatbot** - Includes calendar data in webhook payload

### ✅ User Flow
1. User clicks "Connect Google Calendar"
2. Frontend calls backend to generate Unipile hosted auth URL
3. User redirects to Unipile for Google OAuth
4. Unipile calls your notify webhook on success/failure
5. User returns to success/failure page
6. Calendar selection and booking enabled

## 🔧 Backend Implementation Required

You need to implement these backend API endpoints:

### 1. **POST /api/integrations/unipile/google/init**
```typescript
// Generate Unipile hosted auth URL
interface InitRequest {
  userId: string;
  successRedirect?: string;
  failureRedirect?: string;
}

// Call Unipile API:
POST https://api.unipile.com/api/v1/hosted/accounts/link
Headers: { "X-API-KEY": "your-unipile-api-key" }
Body: {
  "type": "create",
  "providers": ["GOOGLE"],
  "api_url": "https://apiXXX.unipile.com:XXX",
  "expiresOn": "<24-hours-from-now>",
  "notify_url": "https://yourapp.com/api/integrations/unipile/notify",
  "success_redirect_url": "https://yourapp.com/integrations/success",
  "failure_redirect_url": "https://yourapp.com/integrations/failure",
  "name": "<user-id>"
}

// Return: { url: string, expiresOn: string }
```

### 2. **POST /api/integrations/unipile/notify** (Public Webhook)
```typescript
// Handle Unipile notifications
interface NotifyPayload {
  status: 'CREATION_SUCCESS' | 'CREATION_FAILED' | 'CREDENTIALS_ERROR';
  account_id: string;
  name: string; // your user_id
}

// On CREATION_SUCCESS:
// Insert into unipile_accounts table:
// { user_id: name, provider: 'GOOGLE', account_id, status: 'connected' }
```

### 3. **POST /api/integrations/unipile/google/calendars/refresh**
```typescript
// Fetch and store user's calendars
interface RefreshRequest {
  userId: string;
}

// 1. Get user's Unipile account_id from database
// 2. Call Unipile Calendar API:
GET https://api.unipile.com/api/v1/accounts/{account_id}/google/calendar/calendars
Headers: { "X-API-KEY": "your-unipile-api-key" }

// 3. Store calendars in google_calendars table
// 4. Return calendar list
```

### 4. **POST /api/integrations/unipile/google/calendars/select**
```typescript
// Select default calendar for bookings
interface SelectRequest {
  userId: string;
  calendarId: string;
}

// Update google_calendars table:
// Set selected = false for all user's calendars
// Set selected = true for the chosen calendar
```

### 5. **POST /api/integrations/unipile/token-resolve** (For n8n)
```typescript
// Get Unipile account for n8n workflows
interface TokenRequest {
  user_id: string;
}

// Return: { account_id: string, unipile_api_key: string }
// OR just proxy n8n calls through your backend
```

### 6. **POST /api/integrations/unipile/google/disconnect**
```typescript
// Disconnect Google Calendar
interface DisconnectRequest {
  userId: string;
}

// 1. Delete from google_calendars table
// 2. Update unipile_accounts status to 'disconnected'
// 3. Optionally call Unipile to revoke access
```

## 🎯 n8n Workflow Configuration

Your n8n workflow will receive enhanced webhook payload:

```json
{
  "message": "I'd like to book an appointment",
  "userId": "user-uuid",
  "sessionId": "session-uuid",
  "clinicName": "The Joint Chiropractic",
  "phoneNumber": "(256) 935-1911",
  // ... all bot configuration fields ...
  "calendar_integration": {
    "connected": true,
    "email": "user@gmail.com",
    "selected_calendar_id": "primary",
    "selected_calendar_name": "John's Calendar",
    "user_id": "user-uuid"
  }
}
```

### n8n HTTP Request Nodes:

#### A. **Check Calendar Availability**
```javascript
// Node: HTTP Request
URL: https://yourapp.com/api/integrations/unipile/token-resolve
Method: POST
Body: { "user_id": "{{ $json.calendar_integration.user_id }}" }

// Then call your backend which proxies to Unipile:
URL: https://yourapp.com/api/calendar/freebusy
Method: POST  
Body: {
  "user_id": "{{ $json.calendar_integration.user_id }}",
  "calendar_id": "{{ $json.calendar_integration.selected_calendar_id }}",
  "start": "2025-11-03T14:00:00-06:00",
  "end": "2025-11-03T17:00:00-06:00"
}
```

#### B. **Create Booking**
```javascript
// Node: HTTP Request
URL: https://yourapp.com/api/bookings/create
Method: POST
Body: {
  "user_id": "{{ $json.calendar_integration.user_id }}",
  "calendar_id": "{{ $json.calendar_integration.selected_calendar_id }}",
  "start": "2025-11-03T14:30:00-06:00",
  "end": "2025-11-03T14:50:00-06:00",
  "patient": {
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "source": "web"
}
```

#### C. **Update/Cancel Booking**
```javascript
// Node: HTTP Request  
URL: https://yourapp.com/api/bookings/{{ $json.booking_id }}/cancel
Method: POST
```

## 📊 Database Migration

Run this SQL in your Supabase dashboard:

```sql
-- Copy the contents of: supabase/migrations/20250826-unipile-integration.sql
-- This creates all necessary tables, RLS policies, and functions
```

## 🔒 Security & Environment Setup

### Environment Variables Needed:
```env
# Unipile Configuration
VITE_UNIPILE_API_URL=https://api.unipile.com
VITE_UNIPILE_API_KEY=your_unipile_api_key_here

# Supabase (already configured)
VITE_SUPABASE_URL=https://ypgxfhwymbemyiavnlfx.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Security Notes:
- **Never expose** Unipile API key in frontend code
- **All API calls** go through your backend
- **RLS policies** ensure users only see their own data
- **Webhook endpoint** should validate Unipile signatures (if available)

## 🧪 Testing Workflow

### Development Testing:
1. **Run database migration** in Supabase
2. **Set up Unipile account** and get API key
3. **Implement backend endpoints**
4. **Configure webhook URL** in Unipile dashboard
5. **Test connection flow**:
   - Visit `/saas` page
   - Click "Connect Google Calendar"
   - Complete OAuth flow
   - Verify calendar selection
   - Test chatbot with calendar data

### Production Checklist:
- [ ] Backend endpoints implemented and deployed
- [ ] Unipile webhook URL configured
- [ ] Database migration applied
- [ ] Environment variables set
- [ ] n8n workflows updated
- [ ] Success/failure redirect URLs working

## 📝 Implementation Priority

### High Priority (Required for MVP):
1. ✅ Database migration
2. ❗ Backend endpoint implementation
3. ❗ Unipile account setup and API key
4. ❗ Webhook URL configuration
5. ✅ Frontend integration (completed)

### Medium Priority:
- n8n workflow configuration
- Booking management endpoints
- Error handling and reconnection flow

### Low Priority:
- Calendar sync optimization
- Advanced booking features
- Analytics and reporting

## 🔗 Essential URLs & Resources

### Unipile Documentation:
- [Hosted Auth Wizard](https://docs.unipile.com/hosted-auth)
- [Account Management](https://docs.unipile.com/accounts)
- [Google Calendar API](https://docs.unipile.com/google-calendar)
- [Webhooks](https://docs.unipile.com/webhooks)

### Your Application URLs:
- **Frontend**: `http://localhost:5173/saas` (dev) / `https://yourdomain.com/saas` (prod)
- **Success redirect**: `https://yourdomain.com/integrations/success`
- **Failure redirect**: `https://yourdomain.com/integrations/failure`
- **Notify webhook**: `https://yourdomain.com/api/integrations/unipile/notify`

## 🚀 Next Steps

1. **Get Unipile API Key**: Sign up at [Unipile Dashboard](https://dashboard.unipile.com)
2. **Implement Backend Endpoints**: Use the specifications above
3. **Configure Webhook URL**: In Unipile dashboard settings
4. **Test Integration**: Follow the testing workflow
5. **Update n8n Workflows**: Use the new calendar_integration payload

The frontend implementation is complete and ready to use once the backend endpoints are implemented!

## 💡 Advanced Features (Future)

- **Recurring appointments** via Unipile
- **Calendar conflict detection**
- **Automatic reminder emails**
- **Multi-calendar support** per user
- **Appointment rescheduling** via chatbot
- **Calendar analytics** and reporting

This implementation provides a solid foundation for Google Calendar integration that can scale with your business needs.