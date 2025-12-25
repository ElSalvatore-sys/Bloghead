import lighthouse from 'lighthouse';
import { chromium } from 'playwright';
import fs from 'fs';

async function runLighthouseAudit() {
  console.log('🚀 Starting Lighthouse audit on https://blogyydev.xyz...\n');

  // Launch browser
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Get browser endpoint
    const browserWSEndpoint = browser.wsEndpoint();

    // Run Lighthouse
    const result = await lighthouse('https://blogyydev.xyz', {
      port: new URL(browserWSEndpoint).port,
      output: ['html', 'json'],
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      formFactor: 'desktop',
      screenEmulation: {
        mobile: false,
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
        disabled: false,
      },
      throttling: {
        rttMs: 40,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1,
      },
    });

    // Save reports
    fs.writeFileSync('lighthouse-report.html', result.report[0]);
    fs.writeFileSync('lighthouse-report.json', result.report[1]);

    // Extract scores
    const { categories, audits } = result.lhr;

    console.log('📊 LIGHTHOUSE AUDIT RESULTS\n');
    console.log('='.repeat(60));
    console.log('Category Scores:');
    console.log('='.repeat(60));
    console.log(`🚀 Performance:      ${Math.round(categories.performance.score * 100)}/100`);
    console.log(`♿ Accessibility:    ${Math.round(categories.accessibility.score * 100)}/100`);
    console.log(`✅ Best Practices:   ${Math.round(categories['best-practices'].score * 100)}/100`);
    console.log(`🔍 SEO:              ${Math.round(categories.seo.score * 100)}/100`);
    console.log('='.repeat(60));

    // Performance Metrics
    console.log('\n📈 PERFORMANCE METRICS\n');
    console.log('='.repeat(60));

    const metrics = {
      'First Contentful Paint': audits['first-contentful-paint'],
      'Largest Contentful Paint': audits['largest-contentful-paint'],
      'Total Blocking Time': audits['total-blocking-time'],
      'Cumulative Layout Shift': audits['cumulative-layout-shift'],
      'Speed Index': audits['speed-index'],
    };

    for (const [name, audit] of Object.entries(metrics)) {
      const value = audit.displayValue || 'N/A';
      const score = audit.score !== null ? Math.round(audit.score * 100) : 'N/A';
      console.log(`${name.padEnd(30)}: ${value.padEnd(15)} (${score})`);
    }
    console.log('='.repeat(60));

    // Opportunities
    console.log('\n💡 OPPORTUNITIES FOR IMPROVEMENT\n');
    console.log('='.repeat(60));

    const opportunities = Object.values(audits)
      .filter(a => a.score !== null && a.score < 0.9 && a.details?.overallSavingsMs > 100)
      .sort((a, b) => (b.details?.overallSavingsMs || 0) - (a.details?.overallSavingsMs || 0))
      .slice(0, 5);

    if (opportunities.length > 0) {
      opportunities.forEach(opp => {
        console.log(`• ${opp.title}`);
        console.log(`  Savings: ${opp.displayValue || 'N/A'}`);
      });
    } else {
      console.log('✅ No major opportunities found!');
    }
    console.log('='.repeat(60));

    // Failed Audits
    console.log('\n⚠️  FAILED AUDITS (if any)\n');
    console.log('='.repeat(60));

    const failedAudits = Object.values(audits)
      .filter(a => a.score !== null && a.score < 1 && a.scoreDisplayMode === 'binary')
      .slice(0, 10);

    if (failedAudits.length > 0) {
      failedAudits.forEach(audit => {
        console.log(`❌ ${audit.title}`);
        if (audit.description) {
          console.log(`   ${audit.description.substring(0, 100)}...`);
        }
      });
    } else {
      console.log('✅ All binary audits passed!');
    }
    console.log('='.repeat(60));

    // SEO Details
    console.log('\n🔍 SEO DETAILS\n');
    console.log('='.repeat(60));

    const seoAudits = {
      'Document has meta description': audits['meta-description'],
      'Document has title element': audits['document-title'],
      'Links have descriptive text': audits['link-text'],
      'Page has valid robots.txt': audits['robots-txt'],
      'Image elements have alt': audits['image-alt'],
    };

    for (const [name, audit] of Object.entries(seoAudits)) {
      const status = audit.score === 1 ? '✅' : '❌';
      console.log(`${status} ${name}`);
    }
    console.log('='.repeat(60));

    console.log('\n📄 Full reports saved:');
    console.log('  • lighthouse-report.html');
    console.log('  • lighthouse-report.json');
    console.log('\n✅ Audit complete!\n');

  } catch (error) {
    console.error('❌ Error running Lighthouse:', error.message);
  } finally {
    await browser.close();
  }
}

runLighthouseAudit();
