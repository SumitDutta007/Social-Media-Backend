/**
 * Test Script for Authentication and Role-Based Access
 * 
 * This script tests:
 * 1. User registration with JWT
 * 2. User login with JWT
 * 3. Protected route access
 * 4. Role-based authorization
 * 
 * Run: node test-auth.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8800/api';
let userToken = '';
let adminToken = '';
let userId = '';
let postId = '';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`)
};

// Test 1: Register Regular User
async function testRegisterUser() {
  log.info('Testing user registration...');
  
  try {
    // Generate short username to fit max length (20 chars)
    const timestamp = Date.now().toString().slice(-8);
    const response = await axios.post(`${BASE_URL}/auth/register`, {
      username: 'user' + timestamp,
      email: `user${timestamp}@test.com`,
      password: 'password123',
      isAdmin: false
    });

    if (response.data.token && response.data.user) {
      userToken = response.data.token;
      userId = response.data.user._id;
      log.success('User registration successful');
      log.info(`User ID: ${userId}`);
      log.info(`Token: ${userToken.substring(0, 20)}...`);
      return true;
    }
  } catch (error) {
    log.error('User registration failed: ' + error.response?.data?.message);
    return false;
  }
}

// Test 2: Register Admin User
async function testRegisterAdmin() {
  log.info('Testing admin registration...');
  
  try {
    // Generate short username to fit max length (20 chars)
    const timestamp = Date.now().toString().slice(-8);
    const response = await axios.post(`${BASE_URL}/auth/register`, {
      username: 'admin' + timestamp,
      email: `admin${timestamp}@test.com`,
      password: 'admin123',
      isAdmin: true
    });

    if (response.data.token && response.data.user.isAdmin) {
      adminToken = response.data.token;
      log.success('Admin registration successful');
      log.info(`Admin Token: ${adminToken.substring(0, 20)}...`);
      return true;
    }
  } catch (error) {
    log.error('Admin registration failed: ' + error.response?.data?.message);
    return false;
  }
}

// Test 3: Login User
async function testLogin() {
  log.info('Testing user login...');
  
  try {
    // First register a user with short username
    const timestamp = Date.now().toString().slice(-8);
    const username = 'login' + timestamp;
    const registerRes = await axios.post(`${BASE_URL}/auth/register`, {
      username: username,
      email: `login${timestamp}@test.com`,
      password: 'password123'
    });

    // Now login with username (not email)
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      username: username,
      password: 'password123'
    });

    if (loginRes.data.token) {
      log.success('User login successful');
      log.info(`Login Token: ${loginRes.data.token.substring(0, 20)}...`);
      return true;
    }
  } catch (error) {
    log.error('Login failed: ' + error.response?.data?.message);
    return false;
  }
}

// Test 4: Access Protected Route (Create Post)
async function testProtectedRoute() {
  log.info('Testing protected route (create post)...');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/posts`,
      {
        userId: userId,
        desc: 'Test post created via authentication test'
      },
      {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      }
    );

    if (response.data.post) {
      postId = response.data.post._id;
      log.success('Protected route access successful');
      log.info(`Post ID: ${postId}`);
      return true;
    }
  } catch (error) {
    log.error('Protected route access failed: ' + error.response?.data?.message);
    return false;
  }
}

// Test 5: Access Without Token (Should Fail)
async function testUnauthorizedAccess() {
  log.info('Testing unauthorized access (should fail)...');
  
  try {
    await axios.post(
      `${BASE_URL}/posts`,
      {
        userId: userId,
        desc: 'This should fail'
      }
    );
    
    log.error('Unauthorized access succeeded (Security issue!)');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      log.success('Unauthorized access correctly blocked');
      return true;
    } else {
      log.error('Unexpected error: ' + error.response?.data?.message);
      return false;
    }
  }
}

// Test 6: Update Own Profile (Should Succeed)
async function testUpdateOwnProfile() {
  log.info('Testing update own profile...');
  
  try {
    const response = await axios.put(
      `${BASE_URL}/users/${userId}`,
      {
        desc: 'Updated bio',
        city: 'San Francisco'
      },
      {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      }
    );

    if (response.data.message === 'Account has been updated') {
      log.success('Own profile update successful');
      return true;
    }
  } catch (error) {
    log.error('Own profile update failed: ' + (error.response?.data?.message || error.message));
    return false;
  }
}

// Test 7: Update Another User's Profile (Should Fail for Regular User)
async function testUpdateOtherProfile() {
  log.info('Testing update other user profile (should fail for regular user)...');
  
  try {
    // Create another user first with short username
    const timestamp = Date.now().toString().slice(-8);
    const otherUser = await axios.post(`${BASE_URL}/auth/register`, {
      username: 'other' + timestamp,
      email: `other${timestamp}@test.com`,
      password: 'password123'
    });

    // Try to update other user with regular user token
    await axios.put(
      `${BASE_URL}/users/${otherUser.data.user._id}`,
      {
        desc: 'Trying to hack'
      },
      {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      }
    );
    
    log.error('Other user update succeeded (Security issue!)');
    return false;
  } catch (error) {
    if (error.response?.status === 403) {
      log.success('Other user update correctly blocked');
      return true;
    } else {
      log.error('Unexpected error: ' + error.response?.data?.message);
      return false;
    }
  }
}

// Test 8: Admin Can Update Any User
async function testAdminUpdateUser() {
  log.info('Testing admin can update any user...');
  
  try {
    const response = await axios.put(
      `${BASE_URL}/users/${userId}`,
      {
        desc: 'Updated by admin',
        city: 'New York'
      },
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      }
    );

    if (response.data.message === 'Account has been updated') {
      log.success('Admin user update successful');
      return true;
    }
  } catch (error) {
    log.error('Admin user update failed: ' + (error.response?.data?.message || error.message));
    return false;
  }
}

// Test 9: Invalid Token (Should Fail)
async function testInvalidToken() {
  log.info('Testing invalid token (should fail)...');
  
  try {
    await axios.post(
      `${BASE_URL}/posts`,
      {
        userId: userId,
        desc: 'This should fail'
      },
      {
        headers: {
          'Authorization': 'Bearer invalid_token_12345'
        }
      }
    );
    
    log.error('Invalid token accepted (Security issue!)');
    return false;
  } catch (error) {
    if (error.response?.status === 403) {
      log.success('Invalid token correctly rejected');
      return true;
    } else {
      log.error('Unexpected error: ' + error.response?.data?.message);
      return false;
    }
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 AUTHENTICATION & AUTHORIZATION TEST SUITE');
  console.log('='.repeat(60) + '\n');

  const tests = [
    { name: 'User Registration', fn: testRegisterUser },
    { name: 'Admin Registration', fn: testRegisterAdmin },
    { name: 'User Login', fn: testLogin },
    { name: 'Protected Route Access', fn: testProtectedRoute },
    { name: 'Unauthorized Access', fn: testUnauthorizedAccess },
    { name: 'Update Own Profile', fn: testUpdateOwnProfile },
    { name: 'Update Other Profile', fn: testUpdateOtherProfile },
    { name: 'Admin Update User', fn: testAdminUpdateUser },
    { name: 'Invalid Token', fn: testInvalidToken }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`📝 Test: ${test.name}`);
    console.log('─'.repeat(60));
    
    const result = await test.fn();
    if (result) {
      passed++;
    } else {
      failed++;
    }
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
  console.log(`📈 Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
  console.log('='.repeat(60) + '\n');

  if (failed === 0) {
    log.success('ALL TESTS PASSED! 🎉');
    log.info('Authentication and role-based access are working correctly!');
  } else {
    log.warning(`${failed} test(s) failed. Please check the implementation.`);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get('http://localhost:8800');
    return true;
  } catch (error) {
    console.log('\n' + '⚠️'.repeat(30));
    log.error('Server is not running on http://localhost:8800');
    log.info('Please start the server first: npm run dev');
    console.log('⚠️'.repeat(30) + '\n');
    return false;
  }
}

// Main execution
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runAllTests();
  }
})();
