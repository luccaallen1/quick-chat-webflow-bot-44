# Authentication System Setup

This project now includes a complete user authentication system using Supabase. Users can register, login, and save their bot configurations to the database.

## Features Added

### 🔐 Authentication System
- **User Registration**: New users can create accounts with email/password
- **User Login**: Existing users can sign in
- **Session Management**: Automatic session handling and persistence
- **Secure Logout**: Clean session termination

### 💾 Database Integration
- **User Profiles**: Automatic user profile creation on registration  
- **Bot Configurations**: Save unlimited bot configurations per user
- **Data Persistence**: All configurations saved to Supabase database
- **Row Level Security**: Users can only access their own data

### 🎛️ Updated UI
- **Auth Modal**: Clean login/register modal
- **Header Authentication**: Shows user status and logout option
- **Protected Actions**: Save button requires authentication
- **Configuration Management**: Database-backed save/load/delete system

## Setup Instructions

### 1. Supabase Project Setup
1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the project to be fully initialized
3. Go to Settings > API to find your project URL and anon key

### 2. Environment Variables
Update `.env` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Database Migration
Run the SQL migration in your Supabase SQL editor:
```sql
-- Copy and run the contents of: supabase/migrations/20250826-user-auth-system.sql
```

This creates:
- `users` table (extends auth.users)
- `bot_configurations` table
- Row Level Security policies
- Automatic user profile creation trigger

### 4. Authentication Settings
In Supabase Dashboard:
1. Go to Authentication > Settings
2. Disable "Enable email confirmations" for testing (optional)
3. Or configure SMTP settings for production email confirmations

## How It Works

### User Flow
1. **Anonymous Users**: Can configure bot but cannot save configurations
2. **Sign Up**: Creates new account and user profile automatically
3. **Sign In**: Authenticates and loads user's saved configurations
4. **Save Configuration**: Stores bot config in database linked to user
5. **Manage Configurations**: Load, delete, and switch between saved configs

### Data Structure

#### Users Table
```sql
users (
  id UUID PRIMARY KEY,           -- Links to auth.users
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### Bot Configurations Table
```sql
bot_configurations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  -- All 21 bot configuration fields
  clinic_id TEXT,
  clinic_name TEXT,
  phone_number TEXT,
  -- ... (see migration file for complete schema)
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Security Features
- **Row Level Security**: Users can only access their own data
- **Authentication Required**: Save/load/delete operations require login
- **Secure Sessions**: JWT-based authentication with automatic refresh
- **Data Validation**: Server-side validation of all configuration data

## API Service

The `configService` provides:
- `getUserConfigurations()` - Get all user's configurations
- `saveConfiguration(config, name)` - Save new configuration
- `updateConfiguration(id, config, name)` - Update existing
- `deleteConfiguration(id)` - Delete configuration
- `databaseToBot(dbConfig)` - Convert database format to UI format

## Testing

### Development Testing
1. Start the dev server: `npm run dev`
2. Visit `/saas` page
3. Try creating an account
4. Configure bot settings
5. Save configurations
6. Test switching between configurations
7. Test logout/login persistence

### Production Testing
1. Deploy to your hosting platform
2. Ensure environment variables are set
3. Test email confirmations (if enabled)
4. Verify HTTPS is working for secure authentication

## Troubleshooting

### Common Issues
1. **"Invalid API key"**: Check VITE_SUPABASE_ANON_KEY is correct
2. **"Failed to fetch"**: Verify VITE_SUPABASE_URL is correct
3. **"User not found"**: Run the database migration
4. **Auth not working**: Clear browser localStorage and try again

### Migration Issues
If migration fails:
1. Check Supabase logs in Dashboard > Logs
2. Ensure you have sufficient permissions
3. Run migration statements one by one to identify issues

## Next Steps

This system is ready for production use. Consider adding:
- Password reset functionality
- Email verification requirements
- User profile management
- Configuration sharing between users
- Configuration templates/presets
- Audit logging for configuration changes

The authentication system is fully integrated with the existing chatbot configuration workflow and maintains backward compatibility.