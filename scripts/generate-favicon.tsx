import { renderToString } from 'preact-render-to-string';
import { AppIcon } from '../src/components/AppIcon';
import fs from 'fs';

// Render the AppIcon as SVG string
const svgString = renderToString(<AppIcon size="favicon" withGradientBg={false} />);

// Extract just the SVG content
const svgMatch = svgString.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
if (svgMatch) {
  const fullSvg = svgMatch[0];
  
  // Create a proper SVG with viewBox
  const faviconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64">
  ${fullSvg.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '')}
</svg>`;

  // Write the SVG file
  fs.writeFileSync('public/favicon.svg', faviconSvg);
  console.log('Favicon generated successfully!');
} else {
  console.error('Failed to extract SVG content');
}