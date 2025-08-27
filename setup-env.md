# 🔐 HIPAA Agent Environment Setup

## Required API Keys

### 1. OpenAI API Key (Required)
- Go to: https://platform.openai.com/api-keys  
- Create new API key
- Add to `.env` file as: `REACT_APP_OPENAI_API_KEY=sk-your-key-here`

### 2. Encryption Key (Required for HIPAA)
- Generate a 32-character encryption key
- Use this command: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Add to `.env` file as: `REACT_APP_ENCRYPTION_KEY=your-32-char-key-here`

## Create .env File

Create a `.env` file in the project root with:

```bash
# OpenAI Configuration  
REACT_APP_OPENAI_API_KEY=sk-your-openai-key-here

# HIPAA Encryption
REACT_APP_ENCRYPTION_KEY=your-32-character-encryption-key-here

# Existing Webhook (already configured)
REACT_APP_WEBHOOK_URL=https://luccatora.app.n8n.cloud/webhook/webbot
```

## Quick Setup Commands

```bash
# 1. Generate encryption key
node -e "console.log('REACT_APP_ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"

# 2. Create .env file (replace with your actual keys)
echo "REACT_APP_OPENAI_API_KEY=sk-your-key-here" > .env
echo "REACT_APP_ENCRYPTION_KEY=your-generated-key-here" >> .env
echo "REACT_APP_WEBHOOK_URL=https://luccatora.app.n8n.cloud/webhook/webbot" >> .env

# 3. Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

## 🏗️ Architecture Overview

### GPT-4o Function Calling System:

```
User Message
     ↓
GPT-4o + Tools
     ↓
Available Functions:
├── extract_patient_data()    # Extract name, phone, symptoms, etc.
├── classify_message_intent() # appointment|medical|general|spam  
├── book_appointment()        # Complete booking workflow
└── get_clinic_availability() # Check available time slots
     ↓
HIPAA-Compliant Processing
     ↓
Encrypted Storage + Audit Log
```

### Tool Execution Flow:
1. **User sends message** → "I need an appointment tomorrow at 2pm, my name is John"
2. **GPT-4o analyzes** → Calls `extract_patient_data` + `classify_message_intent`
3. **Tools execute** → Extract: {name: "John", preferredTime: "tomorrow 2pm"}, Classify: "appointment"
4. **Agent responds** → "Hi John! I can help you schedule for tomorrow at 2pm. I just need your phone number..."
5. **Data encrypted** → All patient data stored with AES encryption
6. **Audit logged** → HIPAA-compliant audit trail maintained

### Key Features:
- **GPT-4o** with native function calling (not prompt engineering)
- **4 Healthcare Tools** for data extraction, booking, availability
- **Real-time tool tracking** visible in UI  
- **End-to-end encryption** for all patient data
- **HIPAA audit logging** for compliance
- **Intelligent conversation flow** (greeting → data collection → booking → completed)

### Production Deployment:
- Frontend: Netlify (current)
- Backend: Should move OpenAI calls to secure backend
- Database: PostgreSQL for production patient data
- Security: API keys in environment variables only

Ready to test at: https://quick-chat-widget-bot.netlify.app/agent