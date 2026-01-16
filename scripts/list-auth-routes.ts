import { auth } from '../src/core/auth';

console.log('🔍 Better Auth API Routes\n');
console.log('Available endpoints:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const routes = [
  { method: 'POST', path: '/api/auth/sign-up/email', desc: 'Email/password signup' },
  { method: 'POST', path: '/api/auth/sign-in/email', desc: 'Email/password login' },
  { method: 'POST', path: '/api/auth/sign-out', desc: 'Logout' },
  { method: 'GET', path: '/api/auth/session', desc: 'Get current session' },
  { method: 'GET', path: '/api/auth/me', desc: 'Get current user (custom)' },
  { method: 'POST', path: '/api/auth/forgot-password', desc: 'Request password reset' },
  { method: 'POST', path: '/api/auth/reset-password', desc: 'Reset password with token' },
  { method: 'GET', path: '/api/auth/verify-email', desc: 'Verify email with token' },
];

routes.forEach((route) => {
  console.log(`${route.method.padEnd(6)} ${route.path.padEnd(40)} ${route.desc}`);
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n📚 Docs: https://www.better-auth.com/docs/concepts/api-routes\n');
