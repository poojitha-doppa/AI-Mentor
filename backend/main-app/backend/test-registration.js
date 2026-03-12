import http from 'http';

const testEmail = `test${Math.floor(Math.random() * 100000)}@example.com`;

const postData = JSON.stringify({
  email: testEmail,
  password: 'TestPassword123',
  name: 'Test User',
  phone: '1234567890'
});

console.log(`\n🧪 Testing user registration...`);
console.log(`📧 Test Email: ${testEmail}`);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (res.statusCode === 200) {
        console.log('\n✅ REGISTRATION SUCCESSFUL!');
        console.log('User ID:', response.user.id);
        console.log('User Email:', response.user.email);
        console.log('User Name:', response.user.name);
        console.log('\n✅ DATABASE IS WORKING - User saved successfully!\n');
      } else {
        console.log('\n❌ REGISTRATION FAILED!');
        console.log('Status Code:', res.statusCode);
        console.log('Error:', response.error);
        console.log('\n');
      }
    } catch (error) {
      console.error('\n❌ Failed to parse response:', error.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ TEST FAILED:', error.message);
  console.log('Make sure the backend is running on port 5000\n');
});

req.write(postData);
req.end();
