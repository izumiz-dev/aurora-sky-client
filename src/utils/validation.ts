/**
 * 入力検証のためのユーティリティ関数
 */

export const ValidationRules = {
  post: {
    maxLength: 300,
    minLength: 1,
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxImageSize: 1000000, // 1MB
    maxImages: 4,
  },
  
  username: {
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_-]+$/,
  },
  
  password: {
    minLength: 8,
    maxLength: 128,
  },
};

/**
 * 投稿テキストの検証
 */
export function validatePostText(text: string): string[] {
  const errors: string[] = [];
  
  // 空白文字のみのチェック
  if (text.trim().length === 0) {
    errors.push('投稿内容を入力してください');
    return errors;
  }
  
  // 文字数チェック
  if (text.length > ValidationRules.post.maxLength) {
    errors.push(`投稿は${ValidationRules.post.maxLength}文字以内にしてください`);
  }
  
  // XSS検出パターン
  const dangerousPatterns = [
    /<script/i,
    /<iframe/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<style/i,
    /<link/i,
  ];
  
  if (dangerousPatterns.some(pattern => pattern.test(text))) {
    errors.push('許可されていない文字パターンが含まれています');
  }
  
  return errors;
}

/**
 * 画像ファイルの検証
 */
export function validateImage(file: File): string[] {
  const errors: string[] = [];
  
  // ファイルタイプチェック
  if (!ValidationRules.post.allowedImageTypes.includes(file.type)) {
    errors.push(`許可されていないファイル形式です。対応形式: ${ValidationRules.post.allowedImageTypes.join(', ')}`);
  }
  
  // ファイルサイズチェック
  if (file.size > ValidationRules.post.maxImageSize) {
    const maxSizeMB = ValidationRules.post.maxImageSize / 1000000;
    errors.push(`ファイルサイズが大きすぎます（最大${maxSizeMB}MB）`);
  }
  
  // ファイル名チェック
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.ps1'];
  const fileName = file.name.toLowerCase();
  if (dangerousExtensions.some(ext => fileName.endsWith(ext))) {
    errors.push('このファイルタイプはアップロードできません');
  }
  
  return errors;
}

/**
 * 複数画像の検証
 */
export function validateImages(files: File[]): string[] {
  const errors: string[] = [];
  
  // 枚数チェック
  if (files.length > ValidationRules.post.maxImages) {
    errors.push(`画像は最大${ValidationRules.post.maxImages}枚まで添付できます`);
  }
  
  // 各画像の検証
  files.forEach((file, index) => {
    const imageErrors = validateImage(file);
    imageErrors.forEach(error => {
      errors.push(`画像${index + 1}: ${error}`);
    });
  });
  
  return errors;
}

/**
 * ユーザー名の検証
 */
export function validateUsername(username: string): string[] {
  const errors: string[] = [];
  
  if (username.length < ValidationRules.username.minLength) {
    errors.push(`ユーザー名は${ValidationRules.username.minLength}文字以上にしてください`);
  }
  
  if (username.length > ValidationRules.username.maxLength) {
    errors.push(`ユーザー名は${ValidationRules.username.maxLength}文字以内にしてください`);
  }
  
  if (!ValidationRules.username.pattern.test(username)) {
    errors.push('ユーザー名は英数字、ハイフン、アンダースコアのみ使用できます');
  }
  
  return errors;
}

/**
 * パスワードの検証
 */
export function validatePassword(password: string): string[] {
  const errors: string[] = [];
  
  if (password.length < ValidationRules.password.minLength) {
    errors.push(`パスワードは${ValidationRules.password.minLength}文字以上にしてください`);
  }
  
  if (password.length > ValidationRules.password.maxLength) {
    errors.push(`パスワードは${ValidationRules.password.maxLength}文字以内にしてください`);
  }
  
  // パスワード強度チェック
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  let strength = 0;
  if (hasUpperCase) strength++;
  if (hasLowerCase) strength++;
  if (hasNumber) strength++;
  if (hasSpecialChar) strength++;
  
  if (strength < 3) {
    errors.push('パスワードは大文字、小文字、数字、特殊文字のうち3種類以上を含めてください');
  }
  
  // 一般的な弱いパスワードのチェック
  const weakPasswords = ['password', '12345678', 'qwerty', 'admin', 'letmein'];
  if (weakPasswords.includes(password.toLowerCase())) {
    errors.push('よく使われる脆弱なパスワードは使用できません');
  }
  
  return errors;
}

/**
 * URLの検証
 */
export function validateURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * メールアドレスの検証
 */
export function validateEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}