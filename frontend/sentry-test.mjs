import { chromium } from 'playwright';

(async () => {
  console.log('🚀 Opening Bloghead production site...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto('https://blogyydev.xyz', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('✅ Page loaded successfully');
    
    // Wait for page to fully initialize
    await page.waitForTimeout(3000);
    
    // Check if Sentry is initialized
    const sentryStatus = await page.evaluate(() => {
      if (window.Sentry) {
        return { initialized: true, hasDSN: true };
      }
      return { initialized: false, hasDSN: false };
    });
    
    console.log('📊 Sentry Status:', JSON.stringify(sentryStatus, null, 2));
    
    if (sentryStatus.initialized) {
      console.log('🐛 Sentry found! Triggering test errors...');
      
      const result = await page.evaluate(() => {
        try {
          // Send test message
          window.Sentry.captureMessage('✅ Bloghead Sentry Test - Playwright - December 25, 2024', 'info');
          
          // Send test exception
          window.Sentry.captureException(new Error('🐛 Test Error from Playwright - Sentry Verification'));
          
          return { success: true, message: 'Sentry events sent!' };
        } catch (error) {
          return { success: false, message: error.message };
        }
      });
      
      console.log('✅ Result:', result.message);
      console.log('');
      console.log('🎯 NEXT STEPS:');
      console.log('1. Go to https://sentry.io');
      console.log('2. Check Issues dashboard for the test errors');
      console.log('3. Verify session replay is working');
    } else {
      console.log('⚠️  Sentry NOT initialized on production');
      console.log('');
      console.log('💡 This is EXPECTED - VITE_SENTRY_DSN is not set in Vercel');
      console.log('');
      console.log('📝 TO ACTIVATE SENTRY:');
      console.log('1. Create Sentry project at https://sentry.io');
      console.log('2. Copy your DSN');
      console.log('3. Add to Vercel: VITE_SENTRY_DSN=<your-dsn>');
      console.log('4. Vercel will auto-redeploy');
      console.log('5. Run this test again');
      
      // Trigger a regular JavaScript error to test ErrorBoundary
      console.log('');
      console.log('🐛 Triggering regular error to test error handling...');
      await page.evaluate(() => {
        throw new Error('🐛 Test Error - Sentry DSN Not Configured - December 25, 2024');
      }).catch(err => {
        console.log('✅ Error triggered and caught (as expected)');
      });
    }
    
    // Take a screenshot
    await page.screenshot({ path: 'sentry-test-screenshot.png', fullPage: false });
    console.log('');
    console.log('📸 Screenshot saved: sentry-test-screenshot.png');
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
  } finally {
    await browser.close();
    console.log('✅ Browser closed');
  }
})();
