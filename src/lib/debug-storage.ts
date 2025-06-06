/**
 * デバッグ用のストレージチェック関数
 * ブラウザコンソールで実行: window.debugStorage()
 */
/* eslint-disable no-console */
export function debugStorage() {
  console.log('=== Storage Debug Info ===');

  // LocalStorage
  console.log('\n--- LocalStorage ---');
  const localStorageKeys = Object.keys(localStorage);
  localStorageKeys.forEach((key) => {
    const value = localStorage.getItem(key);
    if (key.includes('bsky')) {
      console.log(`${key}:`, value ? `${value.substring(0, 50)}...` : 'null');
    }
  });

  // SessionStorage
  console.log('\n--- SessionStorage ---');
  const sessionStorageKeys = Object.keys(sessionStorage);
  sessionStorageKeys.forEach((key) => {
    const value = sessionStorage.getItem(key);
    if (key.includes('bsky')) {
      console.log(`${key}:`, value ? `${value.substring(0, 50)}...` : 'null');
    }
  });

  // Check expiry
  const expiry =
    localStorage.getItem('bsky-session-expiry') || sessionStorage.getItem('bsky-session-expiry');
  if (expiry) {
    const expiryDate = new Date(parseInt(expiry));
    const now = new Date();
    console.log('\n--- Session Expiry ---');
    console.log('Expiry:', expiryDate.toLocaleString());
    console.log('Now:', now.toLocaleString());
    console.log('Expired:', now > expiryDate);
    console.log(
      'Time left:',
      Math.floor((expiryDate.getTime() - now.getTime()) / 1000 / 60),
      'minutes'
    );
  }

  // Check crypto availability
  console.log('\n--- Crypto API ---');
  console.log('crypto:', typeof crypto);
  console.log('crypto.subtle:', crypto?.subtle ? 'available' : 'not available');
  console.log('Protocol:', window.location.protocol);
  console.log('Environment:', import.meta.env.PROD ? 'production' : 'development');
  console.log(
    'VITE_SESSION_KEY:',
    import.meta.env.VITE_SESSION_KEY ? 'configured' : 'not configured'
  );

  // Test encryption
  console.log('\n--- Encryption Test ---');
  import('./crypto').then(({ SessionCrypto }) => {
    SessionCrypto.encrypt('test')
      .then(() => {
        console.log('Encryption test: SUCCESS');
      })
      .catch((error) => {
        console.error('Encryption test: FAILED', error.message);
      });
  });

  console.log('\n======================');
}

// デバッグ関数をグローバルに公開
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).debugStorage = debugStorage;
}
