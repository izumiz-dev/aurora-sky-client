/**
 * XSS攻撃を防ぐためのサニタイゼーション関数
 */

/**
 * HTMLをサニタイズ
 */
export function sanitizeHTML(html: string): string {
  // DOMPurifyライブラリを使うのが理想的だが、軽量実装として基本的なエスケープを行う
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * URLをサニタイズ
 */
export function sanitizeURL(url: string): string {
  try {
    const parsed = new URL(url);
    
    // 許可されたプロトコルのみを許可
    const allowedProtocols = ['http:', 'https:'];
    if (!allowedProtocols.includes(parsed.protocol)) {
      return '#';
    }
    
    // データURLやJavaScriptプロトコルをブロック
    if (url.toLowerCase().startsWith('javascript:') || 
        url.toLowerCase().startsWith('data:') ||
        url.toLowerCase().startsWith('vbscript:')) {
      return '#';
    }
    
    return parsed.toString();
  } catch {
    // 無効なURLの場合は安全なデフォルト値を返す
    return '#';
  }
}

/**
 * ユーザー入力をサニタイズ
 */
export function sanitizeText(text: string): string {
  // 基本的なHTMLエスケープ
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * ファイル名をサニタイズ
 */
export function sanitizeFileName(fileName: string): string {
  // 危険な文字を除去
  const sanitized = fileName
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
    .replace(/\.\./g, '')
    .trim();
  
  // 最大長を制限
  const maxLength = 255;
  if (sanitized.length > maxLength) {
    const extension = sanitized.substring(sanitized.lastIndexOf('.'));
    const name = sanitized.substring(0, sanitized.lastIndexOf('.'));
    return name.substring(0, maxLength - extension.length) + extension;
  }
  
  return sanitized;
}

/**
 * JSONをパースする際の安全なラッパー
 */
export function safeJSONParse<T = unknown>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return defaultValue;
  }
}

/**
 * 危険なパターンをチェック
 */
export function containsDangerousPatterns(text: string): boolean {
  const dangerousPatterns = [
    /<script/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /vbscript:/i,
    /data:text\/html/i,
  ];
  
  return dangerousPatterns.some(pattern => pattern.test(text));
}