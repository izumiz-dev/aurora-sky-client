import { renderToString } from 'preact-render-to-string';
import { AppIcon } from '../src/components/AppIcon';
import fs from 'fs';

// PWA用のアイコンサイズ
const sizes = [192, 512];

sizes.forEach(size => {
  // 背景付きのアイコンを生成
  const iconString = renderToString(
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      width={size} 
      height={size}
    >
      {/* グラデーション背景 */}
      <defs>
        <linearGradient id={`bg-gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      
      {/* 背景 */}
      <rect width="100" height="100" fill={`url(#bg-gradient-${size})`} rx="20" />
      
      {/* アイコン */}
      <g transform="translate(50, 50) scale(2.5)">
        <AppIcon size="favicon" withGradientBg={false} />
      </g>
    </svg>
  );
  
  // ファイルに書き込み
  fs.writeFileSync(`public/icon-${size}.png`, '');
  console.log(`⚠️  icon-${size}.png ファイルを作成しました。SVGからPNGへの変換が必要です。`);
});

// SVGをPNGに変換するための手順を出力
console.log('\n📝 次の手順でSVGをPNGに変換してください：');
console.log('1. https://cloudconvert.com/svg-to-png または類似のツールを使用');
console.log('2. 生成されたSVGをアップロード');
console.log('3. 192x192と512x512のPNGをダウンロード');
console.log('4. public/icon-192.png と public/icon-512.png として保存');