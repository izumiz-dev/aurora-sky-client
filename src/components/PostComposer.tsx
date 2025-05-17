import { useState, useRef } from 'preact/hooks';
import { useAuth } from '../context/AuthContext';
import { useLanguagePreferences } from '../context/LanguagePreferences';
import { createPost, createPostWithImages, uploadImage } from '../lib/api';
import { ImagePreview } from './content/ImagePreview';

interface PostComposerProps {
  onPostSuccess?: () => void;
}

interface UploadedImage {
  file: File;
  preview: string;
  blob?: any;
  alt: string;
}

export const PostComposer = ({ onPostSuccess }: PostComposerProps) => {
  const { session } = useAuth();
  const { preferences } = useLanguagePreferences();
  const [text, setText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number>(-1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePost = async () => {
    if (!text.trim() && images.length === 0) return;

    setIsPosting(true);
    setError(null);

    try {
      if (images.length > 0) {
        // 画像付き投稿
        const uploadedImages = await Promise.all(
          images.map(async (img) => {
            if (!img.blob) {
              img.blob = await uploadImage(img.file);
            }
            return { alt: img.alt, blob: img.blob };
          })
        );
        await createPostWithImages(text, uploadedImages, [preferences.postLanguage]);
      } else {
        // テキストのみ投稿
        await createPost(text, [preferences.postLanguage]);
      }

      setText('');
      setImages([]);
      if (onPostSuccess) {
        onPostSuccess();
      }
    } catch (err) {
      console.error('Failed to post:', err);
      setError('投稿に失敗しました。もう一度お試しください。');
    } finally {
      setIsPosting(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handlePost();
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
          if (file.size > 1000000) {
            throw new Error(`${file.name}は1MB以下にしてください`);
          }
          if (!file.type.startsWith('image/')) {
            throw new Error(`${file.name}は画像ファイルではありません`);
          }

          // プレビュー用のURLを作成
          const preview = URL.createObjectURL(file);

          return {
            file,
            preview,
            alt: '',
          };
        })
      );

      setImages([...images, ...newImages]);
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

  return (
    <div className="glass-card p-4 mb-6">
      <div className="flex gap-3">
        <div className="avatar avatar-md flex-shrink-0">
          <img
            src={session?.avatar || '/default-avatar.png'}
            alt={session?.handle || 'User'}
            onError={(e) => {
              console.error('Avatar load error:', e);
              (e.target as HTMLImageElement).src = '/default-avatar.png';
            }}
          />
        </div>
        <div className="flex-1">
          <textarea
            className="glass-input resize-none"
            rows={3}
            placeholder="今どうしてる？"
            value={text}
            onInput={(e) => setText((e.target as HTMLTextAreaElement).value)}
            onKeyDown={handleKeyDown}
            disabled={isPosting}
          />

          {/* 画像プレビュー */}
          {images.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img.preview}
                    alt={img.alt || `添付画像 ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg cursor-pointer hover:brightness-110 transition-all"
                    onClick={() => setPreviewIndex(index)}
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <input
                    type="text"
                    placeholder="代替テキスト"
                    value={img.alt}
                    onInput={(e) => updateImageAlt(index, (e.target as HTMLInputElement).value)}
                    className="absolute bottom-2 left-2 right-2 px-2 py-1 text-xs bg-black/50 text-white rounded placeholder-white/70 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
            </div>
          )}

          {error && <div className="mt-2 text-red-400 text-sm">{error}</div>}

          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-2">
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
                className="glass-button glass-button-ghost icon-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPosting || isUploading || images.length >= 4}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
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
                {images.length > 0 && <span className="text-xs ml-1">{images.length}/4</span>}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${text.length > 300 ? 'text-red-400' : 'text-white/50'}`}>
                {text.length}/300
              </span>
              <button
                className="glass-button btn-primary"
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
                    投稿中...
                  </span>
                ) : (
                  '投稿する'
                )}
              </button>
            </div>
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
