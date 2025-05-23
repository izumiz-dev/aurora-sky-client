// Service Workerの登録
export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    if (import.meta.env.DEV) {
      console.warn('Service Worker not supported');
    }
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    if (import.meta.env.DEV) {
      console.warn('Service Worker registered successfully:', registration);
    }

    // 更新があった場合の処理
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // 新しいバージョンが利用可能
            if (import.meta.env.DEV) {
              console.warn('New version available! Refresh to update.');
            }
            
            // ユーザーに更新を促す（必要に応じて）
            if (confirm('新しいバージョンが利用可能です。更新しますか？')) {
              window.location.reload();
            }
          }
        });
      }
    });
  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
};

// Service Workerの更新をチェック
export const checkForUpdates = async () => {
  if (!('serviceWorker' in navigator)) return;
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
    }
  } catch (error) {
    console.error('Failed to check for updates:', error);
  }
};