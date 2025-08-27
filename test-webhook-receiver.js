import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

console.log('🔍 Starting webhook receiver on port 3002...');

app.post('/webhook/test', (req, res) => {
  console.log('\n🎯 WEBHOOK RECEIVED:');
  console.log('==================');
  
  // Log the entire payload
  console.log('📦 Full Payload:', JSON.stringify(req.body, null, 2));
  
  // Specifically check for integration data
  if (req.body.integrations) {
    console.log('\n✅ INTEGRATION DATA FOUND:');
    console.log('📊 Integration Data:', JSON.stringify(req.body.integrations, null, 2));
  } else {
    console.log('\n❌ NO INTEGRATION DATA FOUND');
  }
  
  // Check for legacy calendar data
  if (req.body.calendar_integration) {
    console.log('\n📅 Legacy Calendar Data:', JSON.stringify(req.body.calendar_integration, null, 2));
  }
  
  console.log('==================\n');
  
  // Return a simple response
  res.json([{
    "output": "Test webhook received successfully! Check console for details.",
    "intermediateSteps": []
  }]);
});

app.listen(3002, () => {
  console.log('🚀 Webhook receiver running on http://localhost:3002');
  console.log('📋 Endpoint: POST /webhook/test');
  console.log('💡 Use this URL to test integration data flow\n');
});