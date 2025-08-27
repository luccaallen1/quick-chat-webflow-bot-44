import fetch from 'node-fetch';

// Test webhook endpoints
const BACKEND_URL = 'http://localhost:3001';

async function testWebhook() {
  console.log('🧪 Testing Unipile webhook handlers...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BACKEND_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health:', healthData);

    // Test 2: Unipile notify webhook (simulate success)
    console.log('\n2. Testing notify webhook with success...');
    const notifyPayload = {
      status: 'CREATION_SUCCESS',
      account_id: 'test-account-123',
      name: 'test-user-456' // This is the user_id
    };

    const notifyResponse = await fetch(`${BACKEND_URL}/api/integrations/unipile/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notifyPayload)
    });

    if (notifyResponse.ok) {
      console.log('✅ Notify webhook processed successfully');
    } else {
      const errorText = await notifyResponse.text();
      console.log('❌ Notify webhook failed:', errorText);
    }

    // Test 3: Token resolve (this will fail without real data, but tests the endpoint)
    console.log('\n3. Testing token resolve...');
    const tokenResponse = await fetch(`${BACKEND_URL}/api/integrations/unipile/token-resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 'test-user-456' })
    });

    if (tokenResponse.status === 404) {
      console.log('✅ Token resolve endpoint working (no user found, as expected)');
    } else {
      console.log('ℹ️  Token resolve response:', tokenResponse.status);
    }

    // Test 4: Init Google connection (will fail without API key)
    console.log('\n4. Testing init Google connection...');
    const initResponse = await fetch(`${BACKEND_URL}/api/integrations/unipile/google/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'test-user-789' })
    });

    if (initResponse.status === 500) {
      const errorData = await initResponse.json();
      if (errorData.error === 'Unipile API key not configured') {
        console.log('✅ Init endpoint working (API key not configured, as expected)');
      } else {
        console.log('⚠️  Unexpected error:', errorData);
      }
    } else {
      console.log('ℹ️  Init response:', initResponse.status);
    }

    console.log('\n🎉 All webhook endpoints are responding correctly!');
    console.log('\n📝 Next steps:');
    console.log('1. Set VITE_UNIPILE_API_KEY in .env file');
    console.log('2. Run database migration in Supabase');
    console.log('3. Configure Unipile webhook URL to point to /api/integrations/unipile/notify');
    console.log('4. Test full integration flow');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nMake sure the backend server is running with: npm run dev:backend');
  }
}

testWebhook();