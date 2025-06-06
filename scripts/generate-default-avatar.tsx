import fs from 'fs';
import { renderToStaticMarkup } from 'preact-render-to-string';

const DefaultAvatar = () => (
  <svg
    width="256"
    height="256"
    viewBox="0 0 256 256"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#ec4899;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="256" height="256" fill="url(#avatarGradient)" />
    <circle cx="128" cy="100" r="45" fill="rgba(255, 255, 255, 0.9)" />
    <path
      d="M 60 180 Q 128 140 196 180 L 196 240 L 60 240 Z"
      fill="rgba(255, 255, 255, 0.9)"
    />
  </svg>
);

const svgString = renderToStaticMarkup(<DefaultAvatar />);

// SVGファイルとして保存
fs.writeFileSync('./public/default-avatar.svg', svgString);

console.log('✅ Generated default-avatar.svg');