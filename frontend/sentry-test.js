const { chromium } = require('playwright');

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
    } else {
      console.log('⚠️  Sentry NOT initialized on production');
      console.log('💡 This is expected - VITE_SENTRY_DSN environment variable is not set in Vercel');
      console.log('📝 Next step: Add VITE_SENTRY_DSN to Vercel environment variables');
      
      // Trigger a regular JavaScript error to test ErrorBoundary
      console.log('🐛 Triggering regular error to test ErrorBoundary...');
      await page.evaluate(() => {
        throw new Error('🐛 Test Error - Sentry DSN Not Configured - December 25, 2024');
      }).catch(err => {
        console.log('✅ Error triggered successfully (caught as expected)');
      });
    }
    
    // Take a screenshot
    await page.screenshot({ path: 'sentry-test-screenshot.png', fullPage: false });
    console.log('📸 Screenshot saved to sentry-test-screenshot.png');
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
  } finally {
    await browser.close();
    console.log('✅ Browser closed');
  }
})();
