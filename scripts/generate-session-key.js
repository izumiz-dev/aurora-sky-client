/**
 * セッション暗号化キーを生成するスクリプト
 * 
 * 使い方:
 * node scripts/generate-session-key.js
 */

import crypto from 'crypto';

// 方法1: Node.jsのcryptoモジュールを使用
function generateSecureKey(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

// 方法2: より長い、URLセーフな文字列
function generateUrlSafeKey(length = 32) {
  return crypto.randomBytes(length)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// 方法3: 16進数の文字列
function generateHexKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

console.log('セッション暗号化キーの生成例:\n');

console.log('Base64形式（推奨）:');
console.log(generateSecureKey());
console.log();

console.log('URLセーフ形式:');
console.log(generateUrlSafeKey());
console.log();

console.log('16進数形式:');
console.log(generateHexKey());
console.log();

console.log('使い方:');
console.log('1. 上記のいずれかのキーをコピー');
console.log('2. 本番環境の.envファイルに設定:');
console.log('   VITE_SESSION_KEY=<生成されたキー>');
console.log();
console.log('注意事項:');
console.log('- このキーは絶対に公開しないでください');
console.log('- Gitにコミットしないでください');
console.log('- 定期的に変更することを推奨します');