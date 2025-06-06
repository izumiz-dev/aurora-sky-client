import { useState, useRef, useEffect, useCallback } from 'preact/hooks';
import { useAuth } from '../context/AuthContext';
import { useLanguagePreferences } from '../context/LanguagePreferences';
import { createPost, createPostWithImages, uploadImage } from '../lib/api';
import { ImagePreview } from './content/ImagePreview';
import { resizeImageToUnder1MB, getImageFromPasteEvent } from '../utils/imageResizer';
import type { Post } from '../types/post';
import { useQueryClient } from '@tanstack/react-query';
import { cacheKeys } from '../lib/cacheConfig';
import { isAltTextGenerationEnabled } from '../lib/aiSettings';
import { generateAltText } from '../lib/gemini';
import { CachedAvatar } from './CachedAvatar';

interface MobilePostComposerProps {
  isOpen: boolean;
  onClose: () => void;
  replyTo?: Post;
  onPostSuccess?: () => void;
}

interface UploadedImage {
  file: File;
  preview: string;
  blob?: unknown;
  alt: string;
}

export const MobilePostComposer = ({
  isOpen,
  onClose,
  replyTo,
  onPostSuccess,
}: MobilePostComposerProps) => {
  const { session } = useAuth();
  const { preferences } = useLanguagePreferences();
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number>(-1);
  const [isGeneratingAlt, setIsGeneratingAlt] = useState(false);
  const [generatingIndex, setGeneratingIndex] = useState<number>(-1);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const showAiButton = isAltTextGenerationEnabled();

  // モーバイルフルスクリーン表示時の背景固定
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const originalTop = document.body.style.top;
      const scrollY = window.scrollY;

      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.overflow = 'hidden';
      document.body.style.width = '100%';

      return () => {
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.overflow = originalOverflow;
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // テキストエリアに自動フォーカス
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 300); // アニメーション後にフォーカス
    }
  }, [isOpen]);

  const handlePost = async () => {
    if (!text.trim() && images.length === 0) return;

    setIsPosting(true);
    setError(null);

    try {
      const postData = {
        text,
        langs: [preferences.postLanguage],
        reply: replyTo
          ? {
              root: {
                uri: replyTo.record.reply?.root?.uri || replyTo.uri,
                cid: replyTo.record.reply?.root?.cid || replyTo.cid,
              },
              parent: {
                uri: replyTo.uri,
                cid: replyTo.cid,
              },
            }
          : undefined,
      };

      if (images.length > 0) {
        const uploadedImages = await Promise.all(
          images.map(async (img) => {
            if (!img.blob) {
              img.blob = await uploadImage(img.file);
            }
            return { alt: img.alt, blob: img.blob };
          })
        );
        await createPostWithImages(
          text,
          uploadedImages,
          [preferences.postLanguage],
          postData.reply
        );
      } else {
        await createPost(text, [preferences.postLanguage], postData.reply);
      }

      setText('');
      setImages([]);

      await queryClient.invalidateQueries({ queryKey: cacheKeys.timeline(session?.did) });

      if (onPostSuccess) {
        onPostSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Failed to post:', err);
      setError('投稿に失敗しました。もう一度お試しください。');
    } finally {
      setIsPosting(false);
    }
  };

  const handleImageSelect = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 4 - images.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    setIsUploading(true);
    setError(null);

    try {
      const newImages: UploadedImage[] = await Promise.all(
        filesToAdd.map(async (file) => {
          if (!file.type.startsWith('image/')) {
            throw new Error(`${file.name}は画像ファイルではありません`);
          }

          let processedFile = file;
          if (file.size > 1000000) {
            try {
              processedFile = await resizeImageToUnder1MB(file);
            } catch {
              throw new Error(`${file.name}のリサイズに失敗しました`);
            }
          }

          const preview = URL.createObjectURL(processedFile);

          return {
            file: processedFile,
            preview,
            alt: '',
          };
        })
      );

      setImages([...images, ...newImages]);
      // 新しい画像が追加されたらそれを表示
      if (images.length === 0) {
        setCurrentImageIndex(0);
      }
    } catch (err) {
      setError(
        (err instanceof Error ? err.message : String(err)) || '画像のアップロードに失敗しました'
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const updateImageAlt = (index: number, alt: string) => {
    const newImages = [...images];
    newImages[index].alt = alt;
    setImages(newImages);
  };

  const handleGenerateAlt = async (index: number) => {
    const image = images[index];
    if (!image || image.alt) return;

    setIsGeneratingAlt(true);
    setGeneratingIndex(index);
    setError(null);

    try {
      const altText = await generateAltText(image.file, preferences.postLanguage);
      if (altText) {
        updateImageAlt(index, altText);
      } else {
        setError('ALTテキストの生成に失敗しました');
      }
    } catch (err) {
      console.error('Failed to generate alt text:', err);
      setError('ALTテキストの生成中にエラーが発生しました');
    } finally {
      setIsGeneratingAlt(false);
      setGeneratingIndex(-1);
    }
  };

  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      const imageFile = getImageFromPasteEvent(e);
      if (!imageFile) return;

      e.preventDefault();

      if (images.length >= 4) {
        setError('画像は最大4枚まで添付できます');
        return;
      }

      setIsUploading(true);
      setError(null);

      try {
        let processedFile = imageFile;
        if (imageFile.size > 1000000) {
          processedFile = await resizeImageToUnder1MB(imageFile);
        }

        const preview = URL.createObjectURL(processedFile);

        const newImage: UploadedImage = {
          file: processedFile,
          preview,
          alt: '',
        };

        setImages([...images, newImage]);
        // 新しい画像が追加されたらそれを表示
        if (images.length === 0) {
          setCurrentImageIndex(0);
        }
      } catch {
        setError('画像の処理に失敗しました');
      } finally {
        setIsUploading(false);
      }
    },
    [images]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handlePasteEvent = (e: Event) => handlePaste(e as ClipboardEvent);

    textarea.addEventListener('paste', handlePasteEvent);
    return () => {
      textarea.removeEventListener('paste', handlePasteEvent);
    };
  }, [handlePaste]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[10000] bg-black/95 ${isOpen ? 'mobile-composer-enter' : 'mobile-composer-exit'}`}
    >
      {/* ヘッダー */}
      <div
        className="sticky top-0 z-10 bg-black/90 backdrop-blur-sm border-b border-white/10"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-3 -ml-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="閉じる"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <h2 className="text-lg font-medium text-white">{replyTo ? 'リプライ' : '新しい投稿'}</h2>

          <button
            className="glass-button btn-primary text-sm px-4 py-2 min-h-[44px] flex items-center justify-center"
            onClick={handlePost}
            disabled={isPosting || (!text.trim() && images.length === 0) || text.length > 300}
          >
            {isPosting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                送信中
              </span>
            ) : (
              '投稿'
            )}
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4">
          {/* リプライ先の表示 */}
          {replyTo && (
            <div className="mb-4 pb-4 border-b border-white/10">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <CachedAvatar
                    src={replyTo.author.avatar}
                    alt={replyTo.author.displayName || replyTo.author.handle}
                    handle={replyTo.author.handle}
                    size="sm"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white text-sm">
                      {replyTo.author.displayName || replyTo.author.handle}
                    </span>
                    <span className="text-white/60 text-xs">@{replyTo.author.handle}</span>
                  </div>
                  <div className="text-white/80 text-sm line-clamp-3">{replyTo.record.text}</div>
                </div>
              </div>
            </div>
          )}

          {/* 投稿フォーム */}
          <div className="w-full">
            <textarea
              ref={textareaRef}
              className="w-full bg-transparent text-white placeholder-white/40 resize-none outline-none text-base"
              rows={6}
              placeholder={replyTo ? '返信を入力...' : '今どうしてる？'}
              value={text}
              onInput={(e) => setText((e.target as HTMLTextAreaElement).value)}
              disabled={isPosting}
              style={{ minHeight: '120px' }}
            />

            {/* 画像プレビュー - カルーセル形式 */}
            {images.length > 0 && (
              <div className="mt-4">
                {/* 画像サムネイル切り替え */}
                {images.length > 1 && (
                  <div className="mb-3">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {images.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                            index === currentImageIndex
                              ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-black/50'
                              : 'opacity-60 hover:opacity-80'
                          }`}
                        >
                          <img
                            src={img.preview}
                            alt={`画像 ${index + 1}`}
                            className="w-12 h-12 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <span className="text-white text-xs font-semibold bg-black/60 px-1.5 py-0.5 rounded">
                              {index + 1}
                            </span>
                          </div>
                          {index === currentImageIndex && (
                            <div className="absolute inset-0 border-2 border-blue-400 rounded-lg"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 現在の画像のALTテキスト編集 */}
                {images[currentImageIndex] && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex gap-3">
                      <div className="relative flex-shrink-0">
                        <img
                          src={images[currentImageIndex].preview}
                          alt={images[currentImageIndex].alt || `添付画像 ${currentImageIndex + 1}`}
                          className="w-20 h-20 object-cover rounded-lg"
                          onClick={() => setPreviewIndex(currentImageIndex)}
                        />
                        <button
                          onClick={() => {
                            removeImage(currentImageIndex);
                            // 削除後のインデックス調整
                            if (currentImageIndex >= images.length - 1 && currentImageIndex > 0) {
                              setCurrentImageIndex(currentImageIndex - 1);
                            }
                          }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500/90 hover:bg-red-500 rounded-full text-white transition-colors flex items-center justify-center shadow-sm"
                          aria-label={`画像${currentImageIndex + 1}を削除`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-white/80 block mb-1">
                          画像 {currentImageIndex + 1}/{images.length} の代替テキスト
                          {!images[currentImageIndex].alt && (
                            <span className="text-yellow-400 ml-1">(推奨)</span>
                          )}
                        </label>
                        <textarea
                          placeholder="画像の説明"
                          value={images[currentImageIndex].alt}
                          onInput={(e) =>
                            updateImageAlt(
                              currentImageIndex,
                              (e.target as HTMLTextAreaElement).value
                            )
                          }
                          className="w-full bg-white/10 rounded px-2 py-2 text-sm text-white placeholder-white/40 outline-none focus:bg-white/15 resize-none"
                          maxLength={1000}
                          rows={2}
                          disabled={isGeneratingAlt && generatingIndex === currentImageIndex}
                        />
                        {showAiButton && !images[currentImageIndex].alt && (
                          <button
                            onClick={() => handleGenerateAlt(currentImageIndex)}
                            disabled={isGeneratingAlt}
                            className="w-full mt-2 px-3 py-2 bg-white/10 rounded text-sm text-white/80 hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                            title="AIで代替テキストを生成"
                          >
                            {isGeneratingAlt && generatingIndex === currentImageIndex ? (
                              <>
                                <svg
                                  className="animate-spin h-4 w-4"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                <span>AIで生成中...</span>
                              </>
                            ) : (
                              <>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                  />
                                </svg>
                                <span>AIで代替テキストを生成</span>
                              </>
                            )}
                          </button>
                        )}
                        <div className="text-xs text-white/40 mt-1">
                          {images[currentImageIndex].alt.length}/1000文字
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && <div className="mt-3 text-red-400 text-sm">{error}</div>}
          </div>
        </div>
      </div>

      {/* 下部ツールバー */}
      <div className="sticky bottom-0 bg-black/90 backdrop-blur-sm border-t border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
              disabled={isPosting || isUploading || images.length >= 4}
            />
            <button
              className="p-2 text-white/60 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPosting || isUploading || images.length >= 4}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {images.length > 0 && <span className="text-xs">{images.length}/4</span>}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {images.length > 0 && images.some((img) => !img.alt) && (
              <span className="text-yellow-400 text-xs flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                ALT未入力
              </span>
            )}
            <span className={`text-sm ${text.length > 300 ? 'text-red-400' : 'text-white/50'}`}>
              {text.length}/300
            </span>
          </div>
        </div>
      </div>

      {/* 画像プレビューモーダル */}
      {previewIndex >= 0 && (
        <ImagePreview
          images={images.map((img) => ({ src: img.preview, alt: img.alt }))}
          currentIndex={previewIndex}
          onClose={() => setPreviewIndex(-1)}
          onNavigate={setPreviewIndex}
        />
      )}
    </div>
  );
};
