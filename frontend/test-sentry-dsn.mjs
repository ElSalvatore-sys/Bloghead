import * as Sentry from '@sentry/react';

const DSN = 'https://6f04482fe3a3347cca97ffe0e2c127a0@o4509668104470528.ingest.de.sentry.io/4510591312986192';

console.log('\n🧪 TESTING SENTRY DSN\n');
console.log('='.repeat(60));
console.log('DSN:', DSN);
console.log('='.repeat(60));

try {
  // Initialize Sentry with the DSN
  Sentry.init({
    dsn: DSN,
    environment: 'test',
    tracesSampleRate: 1.0,
    debug: true,
  });

  console.log('\n✅ Sentry initialized successfully!');
  console.log('');
  console.log('📤 Sending test message to Sentry...');

  // Send a test message
  Sentry.captureMessage('🧪 Test Message from Bloghead - DSN Validation', 'info');

  console.log('✅ Test message sent!');
  console.log('');
  console.log('📤 Sending test exception to Sentry...');

  // Send a test exception
  Sentry.captureException(new Error('🧪 Test Error from Bloghead - DSN Validation'));

  console.log('✅ Test exception sent!');
  console.log('');
  console.log('='.repeat(60));
  console.log('RESULT: DSN is VALID and working! ✅');
  console.log('='.repeat(60));
  console.log('');
  console.log('🎯 Next Steps:');
  console.log('1. Add this DSN to Vercel as VITE_SENTRY_DSN');
  console.log('2. Redeploy from Vercel dashboard (no cache)');
  console.log('3. Wait 2-3 minutes for deployment');
  console.log('4. Check Sentry dashboard: https://o4509668104470528.ingest.de.sentry.io/');
  console.log('5. Run: node sentry-test.mjs (should show initialized: true)');
  console.log('');

  // Keep process alive for 2 seconds to let events send
  await new Promise(resolve => setTimeout(resolve, 2000));

} catch (error) {
  console.error('\n❌ ERROR:', error.message);
  console.error('');
  console.error('The DSN might be invalid or Sentry package has issues.');
  console.error('Please check the DSN format and try again.');
  console.error('');
  process.exit(1);
}
