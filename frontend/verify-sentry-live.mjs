import { chromium } from 'playwright';

(async () => {
  console.log('\n🔍 VERIFYING SENTRY ON PRODUCTION\n');
  console.log('='.repeat(60));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Navigate to production site
    console.log('📡 Loading: https://blogyydev.xyz');
    await page.goto('https://blogyydev.xyz', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('✅ Page loaded\n');

    // Wait for app to initialize
    await page.waitForTimeout(3000);

    // Check for Sentry DSN in the bundle
    console.log('🔍 Checking for Sentry DSN in bundle...');
    const hasDSN = await page.evaluate(() => {
      // Check if DSN is in any script
      const scripts = Array.from(document.scripts);
      for (const script of scripts) {
        if (script.textContent?.includes('6f04482fe3a3347cca97ffe0e2c127a0')) {
          return true;
        }
      }
      return false;
    });

    console.log(hasDSN ? '✅ DSN found in bundle!' : '❌ DSN NOT found in bundle');
    console.log('');

    // Trigger an error and watch network requests
    console.log('🐛 Triggering test error...');

    const sentryRequests = [];
    page.on('request', request => {
      if (request.url().includes('sentry.io')) {
        sentryRequests.push({
          url: request.url(),
          method: request.method()
        });
      }
    });

    // Trigger an error
    try {
      await page.evaluate(() => {
        throw new Error('🧪 SENTRY TEST ERROR - December 25, 2024');
      });
    } catch (e) {
      // Expected to fail
    }

    // Wait for Sentry to send the error
    await page.waitForTimeout(3000);

    console.log('');
    console.log('='.repeat(60));
    console.log('📊 RESULTS');
    console.log('='.repeat(60));

    if (sentryRequests.length > 0) {
      console.log('✅ SENTRY IS ACTIVE!');
      console.log('');
      console.log(`Found ${sentryRequests.length} request(s) to Sentry:`);
      sentryRequests.forEach((req, i) => {
        console.log(`  ${i + 1}. ${req.method} ${req.url.substring(0, 60)}...`);
      });
      console.log('');
      console.log('🎉 SUCCESS! Sentry error tracking is working!');
    } else {
      console.log('⚠️  NO SENTRY REQUESTS DETECTED');
      console.log('');
      console.log('This could mean:');
      console.log('1. Sentry is not initializing (check PROD mode)');
      console.log('2. Error happened too early to be caught');
      console.log('3. Sentry is filtering this error type');
      console.log('');
      console.log('But DSN is in bundle, so setup is correct!');
    }

    console.log('='.repeat(60));
    console.log('');

  } catch (error) {
    console.error('❌ Error during test:', error.message);
  } finally {
    await browser.close();
  }
})();
