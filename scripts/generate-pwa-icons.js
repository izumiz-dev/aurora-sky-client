import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// アイコンサイズの定義
const sizes = [
  { size: 64, name: 'icon-64.png' },
  { size: 128, name: 'icon-128.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
];

async function generateIcons() {
  const svgPath = path.join(__dirname, '../public/butterfly.svg');
  const svgBuffer = fs.readFileSync(svgPath);
  
  for (const { size, name } of sizes) {
    const outputPath = path.join(__dirname, '../public', name);
    
    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Failed to generate ${name}:`, error);
    }
  }
  
  console.log('\n🎉 PWA icons generated successfully!');
}

generateIcons().catch(console.error);