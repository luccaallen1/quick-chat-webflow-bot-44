# Unipile Backend for Railway

This is the backend API for Google Calendar integration via Unipile.

## Railway Deployment

1. **Upload this folder** to a new Railway project

2. **Set Environment Variables** in Railway dashboard:
   ```
   UNIPILE_API_KEY=0T8j7UMW.IpjHizK58VQPPRQMRG3bSrQldoLavQebTqwH5JuEAns=
   SUPABASE_URL=https://bihobuvkshnzwkwbezrf.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpaG9idXZrc2huentrr250rtvtqXpyZiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzIwNzIyMjA1LCJleHAiOjIwMzYyOTgyMDV9.x0WM7jZOcK5WIYdGPn8pFUVgTHq2Lm2uPJ2xpmdyYPA
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpaG9idXZrc2huentrvndvrXpyZiIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3MjA3MjIyMDUsImV4cCI6MjAzNjI5ODIwNX0.vZ4HdOlVh9WMiYyU3lKqrBV6W-KIkKWPYpRO1sUoGXQ
   ```

3. **Deploy** - Railway will automatically build and start the server

4. **Get your Railway URL** - Railway will provide a URL like `https://your-app.railway.app`

## API Endpoints

- `POST /api/integrations/unipile/google/init` - Initialize Google connection
- `POST /api/integrations/unipile/notify` - **Webhook for Unipile notifications**
- `POST /api/integrations/unipile/token-resolve` - Get account for n8n workflows
- `POST /api/integrations/unipile/google/calendars/refresh` - Refresh calendars
- `POST /api/integrations/unipile/google/calendars/select` - Select calendar
- `POST /api/integrations/unipile/google/disconnect` - Disconnect account
- `POST /api/calendar/freebusy` - Check availability
- `POST /api/bookings/create` - Create calendar events
- `GET /api/health` - Health check

## After Deployment

1. **Update frontend** to use your Railway URL
2. **Add webhook to Unipile**: `https://your-app.railway.app/api/integrations/unipile/notify`
3. **Test the integration**

## Port Configuration

Railway will automatically set the `PORT` environment variable. The app listens on `process.env.PORT || 3001`.