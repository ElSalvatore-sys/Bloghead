import { chromium } from 'playwright';

(async () => {
  console.log('\n🔬 DEEP SENTRY VERIFICATION\n');
  console.log('='.repeat(60));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Track all network requests
    const allRequests = [];
    page.on('request', request => {
      allRequests.push({
        url: request.url(),
        method: request.method(),
        type: request.resourceType()
      });
    });

    // Track console messages
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text()
      });
    });

    // Navigate to production
    console.log('📡 Loading: https://blogyydev.xyz');
    await page.goto('https://blogyydev.xyz', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('✅ Page loaded\n');

    // Wait for app to fully initialize
    await page.waitForTimeout(3000);

    // Check production mode and DSN in the page
    console.log('🔍 Checking environment...');
    const envCheck = await page.evaluate(() => {
      return {
        // Check if we can access the DSN from window
        hasSentryGlobal: typeof window.Sentry !== 'undefined',
        // Check if DSN is in any script content
        hasViteProdMode: true, // This can't be checked from browser
      };
    });

    console.log('   Sentry global:', envCheck.hasSentryGlobal ? '✅' : '❌');
    console.log('');

    // Trigger multiple types of errors
    console.log('🐛 Triggering test errors...\n');

    // 1. Console error
    console.log('   1️⃣ Console.error()...');
    await page.evaluate(() => {
      console.error('TEST ERROR 1: Console error from verify-sentry-deep');
    });
    await page.waitForTimeout(1000);

    // 2. Throw in global scope
    console.log('   2️⃣ Global throw...');
    try {
      await page.evaluate(() => {
        window.onerror = null; // Don't let window.onerror catch it
        throw new Error('TEST ERROR 2: Global throw from verify-sentry-deep');
      });
    } catch (e) {
      // Expected to fail
    }
    await page.waitForTimeout(1000);

    // 3. Unhandled promise rejection
    console.log('   3️⃣ Unhandled rejection...');
    await page.evaluate(() => {
      Promise.reject(new Error('TEST ERROR 3: Unhandled rejection from verify-sentry-deep'));
    });
    await page.waitForTimeout(1000);

    // 4. Try to manually capture if Sentry is available
    console.log('   4️⃣ Manual Sentry.captureException()...');
    await page.evaluate(() => {
      if (window.Sentry && window.Sentry.captureException) {
        window.Sentry.captureException(new Error('TEST ERROR 4: Manual capture from verify-sentry-deep'));
      }
    });
    await page.waitForTimeout(2000);

    // Wait for any delayed Sentry requests
    console.log('\n⏳ Waiting for Sentry to send data...');
    await page.waitForTimeout(3000);

    console.log('');
    console.log('='.repeat(60));
    console.log('📊 RESULTS');
    console.log('='.repeat(60));

    // Filter Sentry requests
    const sentryRequests = allRequests.filter(req =>
      req.url.includes('sentry.io') || req.url.includes('ingest')
    );

    console.log('\n📡 Network Requests to Sentry:');
    if (sentryRequests.length > 0) {
      console.log(`✅ Found ${sentryRequests.length} request(s)!\n`);
      sentryRequests.forEach((req, i) => {
        console.log(`   ${i + 1}. ${req.method} ${req.url.substring(0, 80)}...`);
      });
    } else {
      console.log('❌ No Sentry requests detected');
    }

    // Check console for Sentry messages
    console.log('\n💬 Console Messages (first 10):');
    const sentryConsole = consoleMessages.filter(msg =>
      msg.text.toLowerCase().includes('sentry') ||
      msg.text.toLowerCase().includes('dsn')
    );

    if (sentryConsole.length > 0) {
      sentryConsole.slice(0, 10).forEach((msg, i) => {
        console.log(`   ${i + 1}. [${msg.type}] ${msg.text.substring(0, 100)}`);
      });
    } else {
      console.log('   (No Sentry-related console messages)');
    }

    // Final verdict
    console.log('\n='.repeat(60));
    console.log('🎯 VERDICT');
    console.log('='.repeat(60));

    if (sentryRequests.length > 0) {
      console.log('✅ SENTRY IS WORKING!');
      console.log('   Error tracking is active and sending data to Sentry.');
    } else {
      console.log('⚠️  SENTRY IS NOT SENDING DATA');
      console.log('\n   Possible reasons:');
      console.log('   1. import.meta.env.PROD is false (not in production mode)');
      console.log('   2. import.meta.env.VITE_SENTRY_DSN is undefined');
      console.log('   3. Sentry initialization is being skipped');
      console.log('   4. Errors are being filtered by ignoreErrors config');
      console.log('\n   Next steps:');
      console.log('   - Check Vercel build logs for environment variables');
      console.log('   - Verify the deployment was production build (not preview)');
      console.log('   - Check browser DevTools Network tab manually');
    }

    console.log('='.repeat(60));
    console.log('');

  } catch (error) {
    console.error('❌ Error during test:', error.message);
  } finally {
    await browser.close();
  }
})();
