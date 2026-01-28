import json
import os

def extract_scores(filepath):
    """Extract Lighthouse scores from JSON report"""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Navigate to categories and extract scores
    categories = data.get('categories', {})
    
    scores = {}
    for category_name, category_data in categories.items():
        if isinstance(category_data, dict) and 'score' in category_data:
            # Convert to percentage (0-100)
            scores[category_name] = round(category_data['score'] * 100) if category_data['score'] is not None else 0
    
    return scores

# Extract scores from all three reports
print("Extracting Lighthouse scores...\n")

landing_scores = extract_scores('lh-landing.json')
print("✓ Landing Page scores extracted")

# Run audits for other modes
print("\nRunning Professional Mode audit...")
os.system('lighthouse http://localhost:3000?mode=professional --output=json --output-path=./lh-professional.json --chrome-flags="--headless" --only-categories=performance,accessibility,best-practices,seo --quiet')

print("\nRunning Retro Mode audit...")
os.system('lighthouse http://localhost:3000?mode=retro --output=json --output-path=./lh-retro.json --chrome-flags="--headless" --only-categories=performance,accessibility,best-practices,seo --quiet')

professional_scores = extract_scores('lh-professional.json')
print("✓ Professional Mode scores extracted")

retro_scores = extract_scores('lh-retro.json')
print("✓ Retro Mode scores extracted")

# Display results
print("\n" + "="*60)
print("LIGHTHOUSE AUDIT RESULTS")
print("="*60 + "\n")

print("LANDING PAGE:")
for category, score in landing_scores.items():
    status = "✓" if score >= 90 else "✗"
    print(f"  {status} {category.replace('-', ' ').title()}: {score}/100")

print("\nPROFESSIONAL MODE:")
for category, score in professional_scores.items():
    status = "✓" if score >= 90 else "✗"
    print(f"  {status} {category.replace('-', ' ').title()}: {score}/100")

print("\nRETRO MODE:")
for category, score in retro_scores.items():
    status = "✓" if score >= 90 else "✗"
    print(f"  {status} {category.replace('-', ' ').title()}: {score}/100")

# Calculate averages
all_scores = {
    'performance': [landing_scores.get('performance', 0), professional_scores.get('performance', 0), retro_scores.get('performance', 0)],
    'accessibility': [landing_scores.get('accessibility', 0), professional_scores.get('accessibility', 0), retro_scores.get('accessibility', 0)],
    'best-practices': [landing_scores.get('best-practices', 0), professional_scores.get('best-practices', 0), retro_scores.get('best-practices', 0)],
    'seo': [landing_scores.get('seo', 0), professional_scores.get('seo', 0), retro_scores.get('seo', 0)]
}

print("\n" + "="*60)
print("AVERAGE SCORES ACROSS ALL MODES:")
print("="*60)
for category, scores_list in all_scores.items():
    avg = round(sum(scores_list) / len(scores_list))
    status = "✓" if avg >= 90 else "✗"
    print(f"  {status} {category.replace('-', ' ').title()}: {avg}/100")

# Generate detailed report
report = f"""# Lighthouse Audit Report
Generated: {os.popen('date /t').read().strip()} {os.popen('time /t').read().strip()}

## Summary

Target: All scores >= 90/100

### Landing Page
- Performance: {landing_scores.get('performance', 0)}/100 {'✓' if landing_scores.get('performance', 0) >= 90 else '✗ NEEDS IMPROVEMENT'}
- Accessibility: {landing_scores.get('accessibility', 0)}/100 {'✓' if landing_scores.get('accessibility', 0) >= 90 else '✗ NEEDS IMPROVEMENT'}
- Best Practices: {landing_scores.get('best-practices', 0)}/100 {'✓' if landing_scores.get('best-practices', 0) >= 90 else '✗ NEEDS IMPROVEMENT'}
- SEO: {landing_scores.get('seo', 0)}/100 {'✓' if landing_scores.get('seo', 0) >= 90 else '✗ NEEDS IMPROVEMENT'}

### Professional Mode
- Performance: {professional_scores.get('performance', 0)}/100 {'✓' if professional_scores.get('performance', 0) >= 90 else '✗ NEEDS IMPROVEMENT'}
- Accessibility: {professional_scores.get('accessibility', 0)}/100 {'✓' if professional_scores.get('accessibility', 0) >= 90 else '✗ NEEDS IMPROVEMENT'}
- Best Practices: {professional_scores.get('best-practices', 0)}/100 {'✓' if professional_scores.get('best-practices', 0) >= 90 else '✗ NEEDS IMPROVEMENT'}
- SEO: {professional_scores.get('seo', 0)}/100 {'✓' if professional_scores.get('seo', 0) >= 90 else '✗ NEEDS IMPROVEMENT'}

### Retro Mode
- Performance: {retro_scores.get('performance', 0)}/100 {'✓' if retro_scores.get('performance', 0) >= 90 else '✗ NEEDS IMPROVEMENT'}
- Accessibility: {retro_scores.get('accessibility', 0)}/100 {'✓' if retro_scores.get('accessibility', 0) >= 90 else '✗ NEEDS IMPROVEMENT'}
- Best Practices: {retro_scores.get('best-practices', 0)}/100 {'✓' if retro_scores.get('best-practices', 0) >= 90 else '✗ NEEDS IMPROVEMENT'}
- SEO: {retro_scores.get('seo', 0)}/100 {'✓' if retro_scores.get('seo', 0) >= 90 else '✗ NEEDS IMPROVEMENT'}

## Detailed Reports

HTML reports available at:
- Landing: lighthouse-landing.report.html
- Professional: lighthouse-professional.report.html
- Retro: lighthouse-retro.report.html

JSON reports available at:
- Landing: lh-landing.json
- Professional: lh-professional.json
- Retro: lh-retro.json

## Next Steps

Review the HTML reports to identify specific issues and optimization opportunities.
"""

with open('../docs/LIGHTHOUSE_AUDIT_REPORT.md', 'w', encoding='utf-8') as f:
    f.write(report)

print("\n✓ Detailed report saved to: docs/LIGHTHOUSE_AUDIT_REPORT.md")
print("\nHTML reports can be viewed in browser:")
print("  - lighthouse-landing.report.html")
print("  - lighthouse-professional.report.html")
print("  - lighthouse-retro.report.html")
