const https = require('https');

const apiKey = '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';

const options = {
  hostname: 'openrouter.ai',
  path: '/api/v1/auth/key',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (response.data && response.data.credit_balance !== undefined) {
        console.log('\n✓ OpenRouter Account Info:');
        console.log('========================');
        console.log(`Credits Remaining: $${response.data.credit_balance}`);
        
        if (response.data.credit_balance > 5) {
          console.log('✓ Status: SUFFICIENT - You can run course generation');
        } else if (response.data.credit_balance > 0) {
          console.log('⚠ Status: LOW - Limited credits remaining');
        } else {
          console.log('✗ Status: OUT OF CREDITS - Cannot run course generation');
        }
      } else {
        console.log('Response:', JSON.stringify(response, null, 2));
      }
    } catch (e) {
      console.log('Error parsing response:', e.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.end();
