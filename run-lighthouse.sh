#!/bin/bash
# Lighthouse Performance Audit Script
# Run this script to audit your deployed application

echo "Running Lighthouse audit on https://skill-swap-lovat.vercel.app..."
echo "This may take 1-2 minutes..."

npx lighthouse https://skill-swap-lovat.vercel.app \
  --view \
  --output=html \
  --output-path=./lighthouse-report.html \
  --chrome-flags="--headless"

echo ""
echo "Lighthouse audit complete!"
echo "Report saved to: lighthouse-report.html"
echo ""
echo "Key metrics to check:"
echo "- Performance Score (should be 90+)"
echo "- First Contentful Paint"
echo "- Largest Contentful Paint"
echo "- Time to Interactive"
echo ""



