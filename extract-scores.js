const fs = require('fs');

function extractScores(filename) {
  const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
  return {
    performance: Math.round(data.categories.performance.score * 100),
    accessibility: Math.round(data.categories.accessibility.score * 100),
    bestPractices: Math.round(data.categories['best-practices'].score * 100),
    seo: Math.round(data.categories.seo.score * 100)
  };
}

const landing = extractScores('lighthouse-landing.report.json');
const professional = extractScores('lighthouse-professional.report.json');
const retro = extractScores('lighthouse-retro.report.json');

console.log('=== LIGHTHOUSE AUDIT RESULTS ===\n');
console.log('Landing Page:');
console.log(`  Performance: ${landing.performance}`);
console.log(`  Accessibility: ${landing.accessibility}`);
console.log(`  Best Practices: ${landing.bestPractices}`);
console.log(`  SEO: ${landing.seo}\n`);

console.log('Professional Mode:');
console.log(`  Performance: ${professional.performance}`);
console.log(`  Accessibility: ${professional.accessibility}`);
console.log(`  Best Practices: ${professional.bestPractices}`);
console.log(`  SEO: ${professional.seo}\n`);

console.log('Retro Mode:');
console.log(`  Performance: ${retro.performance}`);
console.log(`  Accessibility: ${retro.accessibility}`);
console.log(`  Best Practices: ${retro.bestPractices}`);
console.log(`  SEO: ${retro.seo}\n`);

// Write to file
const report = `# Lighthouse Audit Report
Generated: ${new Date().toISOString()}

## Landing Page
- Performance: ${landing.performance}/100
- Accessibility: ${landing.accessibility}/100
- Best Practices: ${landing.bestPractices}/100
- SEO: ${landing.seo}/100

## Professional Mode
- Performance: ${professional.performance}/100
- Accessibility: ${professional.accessibility}/100
- Best Practices: ${professional.bestPractices}/100
- SEO: ${professional.seo}/100

## Retro Mode
- Performance: ${retro.performance}/100
- Accessibility: ${retro.accessibility}/100
- Best Practices: ${retro.bestPractices}/100
- SEO: ${retro.seo}/100
`;

fs.writeFileSync('../docs/LIGHTHOUSE_SCORES.txt', report);
console.log('Report saved to docs/LIGHTHOUSE_SCORES.txt');
