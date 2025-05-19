import { useEffect, useState } from 'preact/hooks';
import { createPortal } from 'preact/compat';

interface ImagePreviewProps {
  images: Array<{ src: string; alt?: string }>;
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const ImagePreview = ({ images, currentIndex, onClose, onNavigate }: ImagePreviewProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // ポータルコンテナを作成
    const root = document.createElement('div');
    root.id = 'image-preview-portal';
    document.body.appendChild(root);
    setPortalRoot(root);

    // スクロールを無効化
    document.body.style.overflow = 'hidden';

    // モバイル判定
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      // クリーンアップ
      document.body.removeChild(root);
      document.body.style.overflow = '';
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    // フェードインアニメーション
    setTimeout(() => setIsVisible(true), 10);

    // キーボードイベントのハンドラー
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          handleClose();
          break;
        case 'ArrowLeft':
          navigatePrevious();
          break;
        case 'ArrowRight':
          navigateNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // アニメーション完了後にクローズ
  };

  const navigatePrevious = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  const navigateNext = () => {
    if (currentIndex < images.length - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  const handleBackdropClick = (e: Event) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const content = (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* 背景 - より暗く、よりブラーを効かせる */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />

      {/* コンテンツ */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* 閉じるボタン */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 p-3 rounded-full glass-button glass-button-ghost hover:bg-white/10 transition-colors z-10 backdrop-blur-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* 画像カウンター */}
        {images.length > 1 && (
          <div className="absolute top-6 left-6 px-4 py-2 rounded-full glass backdrop-blur-lg text-white text-sm shadow-lg">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* 前へボタン */}
        {currentIndex > 0 && !isMobile && (
          <button
            onClick={navigatePrevious}
            className="absolute left-6 p-3 rounded-full glass-button glass-button-ghost hover:bg-white/10 transition-colors backdrop-blur-lg shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {/* メイン画像 */}
        <div
          className={`relative max-w-[90vw] max-h-[90vh] transition-all duration-300 ${
            isVisible ? 'scale-100' : 'scale-95'
          }`}
        >
          <img
            src={images[currentIndex].src}
            alt={images[currentIndex].alt || '画像プレビュー'}
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Alt テキスト */}
          {images[currentIndex].alt && (
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg glass backdrop-blur-lg text-white text-sm max-w-md text-center shadow-lg">
              {images[currentIndex].alt}
            </div>
          )}
        </div>

        {/* 次へボタン */}
        {currentIndex < images.length - 1 && !isMobile && (
          <button
            onClick={navigateNext}
            className="absolute right-6 p-3 rounded-full glass-button glass-button-ghost hover:bg-white/10 transition-colors backdrop-blur-lg shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* サムネイルバー（複数画像の場合） */}
        {images.length > 1 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 p-3 rounded-xl glass backdrop-blur-lg shadow-xl">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => onNavigate(index)}
                className={`w-16 h-16 rounded-lg overflow-hidden transition-all ${
                  index === currentIndex
                    ? 'ring-2 ring-blue-400 scale-110 shadow-lg'
                    : 'opacity-60 hover:opacity-90 hover:scale-105'
                }`}
              >
                <img
                  src={images[index].src}
                  alt={`サムネイル ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ポータルがまだ準備できていない場合はnullを返す
  if (!portalRoot) return null;

  // ポータルにレンダリング
  return createPortal(content, portalRoot);
};
