import fs from 'fs';

const data = JSON.parse(fs.readFileSync('lighthouse-report.report.json', 'utf8'));

const categories = data.categories;
const audits = data.audits;

console.log('\n📊 LIGHTHOUSE AUDIT RESULTS\n');
console.log('='.repeat(60));
console.log('Category Scores:');
console.log('='.repeat(60));
console.log(`🚀 Performance:      ${Math.round(categories.performance.score * 100)}/100`);
console.log(`♿ Accessibility:    ${Math.round(categories.accessibility.score * 100)}/100`);
console.log(`✅ Best Practices:   ${Math.round(categories['best-practices'].score * 100)}/100`);
console.log(`🔍 SEO:              ${Math.round(categories.seo.score * 100)}/100`);
console.log('='.repeat(60));

console.log('\n📈 CORE WEB VITALS\n');
console.log('='.repeat(60));

const metrics = {
  'First Contentful Paint (FCP)': audits['first-contentful-paint'],
  'Largest Contentful Paint (LCP)': audits['largest-contentful-paint'],
  'Total Blocking Time (TBT)': audits['total-blocking-time'],
  'Cumulative Layout Shift (CLS)': audits['cumulative-layout-shift'],
  'Speed Index': audits['speed-index'],
};

for (const [name, audit] of Object.entries(metrics)) {
  const value = audit.displayValue || 'N/A';
  const score = audit.score !== null ? Math.round(audit.score * 100) : 'N/A';
  const emoji = score >= 90 ? '✅' : score >= 50 ? '⚠️' : '❌';
  console.log(`${emoji} ${name.padEnd(40)}: ${value.padEnd(15)} (${score})`);
}
console.log('='.repeat(60));

// Performance Opportunities
console.log('\n💡 PERFORMANCE OPPORTUNITIES\n');
console.log('='.repeat(60));

const opportunities = [
  { key: 'unused-javascript', title: 'Reduce unused JavaScript' },
  { key: 'unused-css-rules', title: 'Reduce unused CSS' },
  { key: 'modern-image-formats', title: 'Serve images in modern formats' },
  { key: 'offscreen-images', title: 'Defer offscreen images' },
  { key: 'render-blocking-resources', title: 'Eliminate render-blocking resources' },
].filter(o => audits[o.key] && audits[o.key].score < 1 && audits[o.key].details?.overallSavingsMs > 0);

if (opportunities.length > 0) {
  opportunities.forEach(({ key, title }) => {
    const audit = audits[key];
    const savings = audit.displayValue || '';
    console.log(`• ${title}`);
    console.log(`  Potential savings: ${savings}`);
  });
} else {
  console.log('✅ No major opportunities detected!');
}
console.log('='.repeat(60));

// Resource Summary
console.log('\n📦 RESOURCE SUMMARY\n');
console.log('='.repeat(60));

const resourceSummary = audits['resource-summary'];
if (resourceSummary?.details?.items) {
  resourceSummary.details.items.forEach(item => {
    const type = item.resourceType?.padEnd(20) || 'unknown';
    const count = String(item.requestCount || 0).padStart(3);
    const size = (item.transferSize / 1024).toFixed(1);
    console.log(`${type}: ${count} requests, ${size} KB`);
  });
}
console.log('='.repeat(60));

// SEO Issues
console.log('\n🔍 SEO AUDIT\n');
console.log('='.repeat(60));

const seoChecks = {
  'meta-description': 'Has meta description',
  'document-title': 'Has title element',
  'link-text': 'Links have descriptive text',
  'crawlable-anchors': 'Links are crawlable',
  'image-alt': 'Images have alt attributes',
  'canonical': 'Has valid canonical URL',
};

for (const [key, label] of Object.entries(seoChecks)) {
  const audit = audits[key];
  if (audit) {
    const status = audit.score === 1 ? '✅' : audit.score > 0.5 ? '⚠️' : '❌';
    console.log(`${status} ${label}`);
  }
}
console.log('='.repeat(60));

// Accessibility Issues
console.log('\n♿ ACCESSIBILITY HIGHLIGHTS\n');
console.log('='.repeat(60));

const a11yChecks = {
  'color-contrast': 'Color contrast is sufficient',
  'image-alt': 'Images have alt text',
  'button-name': 'Buttons have accessible names',
  'link-name': 'Links have discernible names',
  'document-title': 'Document has a title',
};

for (const [key, label] of Object.entries(a11yChecks)) {
  const audit = audits[key];
  if (audit) {
    const status = audit.score === 1 ? '✅' : audit.score > 0.5 ? '⚠️' : '❌';
    console.log(`${status} ${label}`);
  }
}
console.log('='.repeat(60));

console.log('\n📄 Full HTML report: lighthouse-report.report.html');
console.log('📄 JSON data: lighthouse-report.report.json');
console.log('\n✅ Audit complete!\n');
