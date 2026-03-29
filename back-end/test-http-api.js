// Test certificate HTTP endpoints
// Make sure backend server is running on port 9999

const testCourseId = '69c6b808989001be8bbc8302'; // From test-api-direct.js

console.log('🧪 Testing Certificate API endpoints\n');
console.log('⚠️  Make sure backend server is running on http://localhost:9999\n');

// Test without authentication (should fail with 401)
fetch('http://localhost:9999/api/certificates/my')
  .then(res => res.json())
  .then(data => {
    console.log('📋 GET /api/certificates/my (no auth):');
    console.log('   Status:', data.success ? '✅' : '❌');
    console.log('   Message:', data.message);
  })
  .catch(err => console.error('   ❌ Error:', err.message));

// Test certificate status endpoint
setTimeout(() => {
  fetch(`http://localhost:9999/api/certificates/status/${testCourseId}`)
    .then(res => res.json())
    .then(data => {
      console.log(`\n📋 GET /api/certificates/status/${testCourseId} (no auth):`);
      console.log('   Status:', data.success ? '✅' : '❌');
      console.log('   Message:', data.message);
    })
    .catch(err => console.error('   ❌ Error:', err.message));
}, 500);

console.log('\n💡 To test with authentication, use Postman or Thunder Client with Bearer token\n');
