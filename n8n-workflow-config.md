# n8n Workflow Configuration for Unipile Google Calendar Integration

This document provides the complete n8n workflow configuration to handle calendar booking requests from the enhanced chatbot webhook payload.

## 🚀 Workflow Overview

The n8n workflow receives enhanced webhook data from the chatbot that includes:

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

## 📋 Workflow Nodes Configuration

### 1. **Webhook Trigger Node**
```json
{
  "node": "Webhook",
  "settings": {
    "httpMethod": "POST",
    "path": "webbot",
    "responseMode": "responseNode",
    "authentication": "none"
  }
}
```

### 2. **Check Calendar Integration Node** (IF Node)
```javascript
// Expression for IF node condition:
{{ $json.calendar_integration && $json.calendar_integration.connected === true }}
```

### 3. **Get Unipile Account Node** (HTTP Request)
**Settings:**
- Method: POST
- URL: `http://localhost:3001/api/integrations/unipile/token-resolve`
- Headers: `Content-Type: application/json`

**Body:**
```json
{
  "user_id": "{{ $json.calendar_integration.user_id }}"
}
```

**Response Example:**
```json
{
  "account_id": "unipile-account-123",
  "unipile_api_key": "up_api_key_here",
  "email": "user@gmail.com"
}
```

### 4. **Check Calendar Availability Node** (HTTP Request)
**Settings:**
- Method: POST
- URL: `http://localhost:3001/api/calendar/freebusy`
- Headers: `Content-Type: application/json`

**Body:**
```json
{
  "user_id": "{{ $json.calendar_integration.user_id }}",
  "calendar_id": "{{ $json.calendar_integration.selected_calendar_id }}",
  "start": "2025-11-03T14:00:00-06:00",
  "end": "2025-11-03T17:00:00-06:00"
}
```

**JavaScript Expression for Dynamic Time:**
```javascript
// For start time (2 hours from now)
{{ new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() }}

// For end time (6 hours from now)
{{ new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() }}
```

### 5. **Process Available Slots Node** (Function Node)
```javascript
// Function to find available 20-minute slots
const freebusy = $input.all()[0].json;
const busyTimes = freebusy.calendars?.[0]?.busy || [];

const startTime = new Date($json.calendar_integration_check.start);
const endTime = new Date($json.calendar_integration_check.end);
const appointmentDuration = 20 * 60 * 1000; // 20 minutes in milliseconds

const availableSlots = [];
let currentTime = new Date(startTime);

while (currentTime < endTime) {
  const slotEnd = new Date(currentTime.getTime() + appointmentDuration);
  
  // Check if this slot conflicts with any busy time
  const hasConflict = busyTimes.some(busy => {
    const busyStart = new Date(busy.start);
    const busyEnd = new Date(busy.end);
    return (currentTime < busyEnd && slotEnd > busyStart);
  });
  
  if (!hasConflict) {
    availableSlots.push({
      start: currentTime.toISOString(),
      end: slotEnd.toISOString(),
      displayTime: currentTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    });
  }
  
  // Move to next 15-minute interval
  currentTime = new Date(currentTime.getTime() + 15 * 60 * 1000);
}

return [{
  json: {
    availableSlots: availableSlots.slice(0, 3), // Return first 3 slots
    totalAvailable: availableSlots.length
  }
}];
```

### 6. **Create Appointment Response Node** (Function Node)
```javascript
// Generate response with available times
const slots = $json.availableSlots;

if (slots.length === 0) {
  return [{
    json: {
      output: "I'm sorry, but there are no available appointment slots in the next few hours. Would you like me to check for availability tomorrow or later this week?"
    }
  }];
}

const slotOptions = slots.map((slot, index) => 
  `${index + 1}. ${slot.displayTime}`
).join('\n');

const response = `Great! I found ${slots.length} available appointment slots for you:

${slotOptions}

Please reply with the number of your preferred time slot, and I'll book the appointment for you. I'll just need your name and phone number to complete the booking.`;

return [{
  json: {
    output: response,
    availableSlots: slots
  }
}];
```

### 7. **Book Appointment Node** (HTTP Request)
**Note:** This node would be triggered by a follow-up message with the user's selection and details.

**Settings:**
- Method: POST
- URL: `http://localhost:3001/api/bookings/create`
- Headers: `Content-Type: application/json`

**Body:**
```json
{
  "user_id": "{{ $json.calendar_integration.user_id }}",
  "calendar_id": "{{ $json.calendar_integration.selected_calendar_id }}",
  "start": "{{ $json.selectedSlot.start }}",
  "end": "{{ $json.selectedSlot.end }}",
  "patient": {
    "name": "{{ $json.patientName }}",
    "email": "{{ $json.patientEmail }}",
    "phone": "{{ $json.patientPhone }}"
  },
  "source": "web"
}
```

### 8. **Booking Confirmation Node** (Function Node)
```javascript
// Generate booking confirmation
const booking = $json;
const startTime = new Date(booking.selectedSlot?.start || booking.start);

const response = `✅ Perfect! Your appointment has been confirmed.

📅 **Appointment Details:**
Date: ${startTime.toLocaleDateString()}
Time: ${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
Duration: 20 minutes
Location: ${$('Webhook').first().json.address}

📞 **Contact Information:**
Phone: ${$('Webhook').first().json.phoneNumber}

You should receive a calendar invitation at ${booking.patient?.email} shortly. If you need to reschedule or cancel, please call us at least 24 hours in advance.

Is there anything else I can help you with today?`;

return [{
  json: {
    output: response
  }
}];
```

### 9. **No Calendar Integration Node** (Function Node)
For users without calendar integration:

```javascript
// Handle users without calendar connection
const response = `I'd be happy to help you schedule an appointment! 

📞 **To Book Your Appointment:**
Please call us directly at ${$json.phoneNumber} during our business hours:
${$json.operationHours}

🌐 **Online Booking:**
You can also book online at: ${$json.bookingLink}

📍 **Location:**
${$json.address}
${$json.addressDescription}

Would you like me to provide directions to our office or answer any questions about our services?`;

return [{
  json: {
    output: response
  }
}];
```

### 10. **Response Node** (Webhook Response)
**Settings:**
- Response Code: 200
- Response Headers: `Content-Type: application/json`

**Response Body:**
```json
[{
  "output": "{{ $json.output }}",
  "intermediateSteps": []
}]
```

## 🔧 Workflow Logic Flow

```
1. Webhook Trigger
   ↓
2. Check Calendar Integration (IF)
   ├─ YES → Get Unipile Account
   │         ↓
   │    Check Availability
   │         ↓
   │    Process Available Slots
   │         ↓
   │    Create Appointment Response
   │         ↓
   │    [Future: Book Appointment]
   │         ↓
   │    [Future: Booking Confirmation]
   │
   ├─ NO → No Calendar Integration Response
   │
   └─ → Response Node
```

## 🎯 Advanced Workflow Features

### A. **Follow-up Message Handler**
Create a separate workflow to handle appointment booking confirmations:

**Trigger:** Message contains slot selection (e.g., "1", "2", "3", "option 1", etc.)
**Logic:**
1. Extract patient details from message using AI
2. Validate selected slot is still available
3. Create booking via API
4. Send confirmation

### B. **Appointment Reminders**
Set up a scheduled workflow to send reminders:

**Trigger:** Cron schedule (daily at 9 AM)
**Logic:**
1. Query bookings for next day
2. Send SMS/email reminders
3. Log reminder status

### C. **Cancellation Handler**
Handle appointment cancellations:

**Trigger:** Message contains cancellation keywords
**Logic:**
1. Identify user's upcoming appointments
2. Confirm cancellation
3. Update booking status
4. Free up calendar slot

## 📊 Error Handling

### Common Error Scenarios:

1. **Calendar Not Connected:**
   - Redirect to manual booking process
   - Provide phone number and booking link

2. **No Available Slots:**
   - Suggest alternative times
   - Offer to check different days

3. **API Errors:**
   - Gracefully fallback to manual booking
   - Log errors for debugging

4. **Invalid User Data:**
   - Request missing information
   - Validate phone/email format

## 🚀 Testing Workflow

### Test Payload:
```json
{
  "message": "I need to schedule an appointment",
  "userId": "test-user-123",
  "sessionId": "test-session-456",
  "clinicName": "Test Clinic",
  "phoneNumber": "(555) 123-4567",
  "operationHours": "Mon-Fri 9AM-6PM",
  "address": "123 Main St, Anytown, ST 12345",
  "bookingLink": "https://example.com/book",
  "calendar_integration": {
    "connected": true,
    "email": "test@example.com",
    "selected_calendar_id": "primary",
    "selected_calendar_name": "Test Calendar",
    "user_id": "test-user-123"
  }
}
```

### Test Commands:
```bash
# Test webhook endpoint
curl -X POST https://your-n8n-instance.com/webhook/webbot \
  -H "Content-Type: application/json" \
  -d @test-payload.json
```

This configuration provides a complete, production-ready n8n workflow for handling Google Calendar integration through Unipile!