const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  password: 'Test1234',
  name: 'Test User',
};

async function testSignup() {
  console.log('\n🧪 Testing Signup...');

  const response = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(TEST_USER),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('❌ Signup failed:', data);
    return null;
  }

  console.log('✅ Signup successful');
  console.log('   User:', TEST_USER.email);
  return data;
}

async function testLogin() {
  console.log('\n🧪 Testing Login...');

  const response = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: TEST_USER.email,
      password: TEST_USER.password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('❌ Login failed:', data);
    return null;
  }

  console.log('✅ Login successful');
  console.log('   Session token:', data.token ? '✓' : '✗');
  return data;
}

async function testSession(token: string) {
  console.log('\n🧪 Testing Session...');

  const response = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: {
      Cookie: `better-auth.session_token=${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('❌ Session check failed:', data);
    return null;
  }

  console.log('✅ Session valid');
  console.log('   User ID:', data.user?.id ? '✓' : '✗');
  console.log('   Email:', data.user?.email || 'N/A');
  return data;
}

async function testLogout(token: string) {
  console.log('\n🧪 Testing Logout...');

  const response = await fetch(`${BASE_URL}/api/auth/sign-out`, {
    method: 'POST',
    headers: {
      Cookie: `better-auth.session_token=${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    console.error('❌ Logout failed:', data);
    return false;
  }

  console.log('✅ Logout successful');
  return true;
}

async function runTests() {
  console.log('🚀 Starting Auth Endpoint Tests...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    const signupResult = await testSignup();
    if (!signupResult) {
      console.log('\n❌ Tests failed at signup');
      process.exit(1);
    }

    const loginResult = await testLogin();
    if (!loginResult) {
      console.log('\n❌ Tests failed at login');
      process.exit(1);
    }

    const sessionToken = loginResult.token;
    if (!sessionToken) {
      console.error('\n❌ No session token returned from login');
      process.exit(1);
    }

    const sessionResult = await testSession(sessionToken);
    if (!sessionResult) {
      console.log('\n❌ Tests failed at session check');
      process.exit(1);
    }

    const logoutSuccess = await testLogout(sessionToken);
    if (!logoutSuccess) {
      console.log('\n❌ Tests failed at logout');
      process.exit(1);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ All auth tests passed!\n');
  } catch (error) {
    console.error('\n❌ Test error:', error);
    process.exit(1);
  }
}

runTests();
