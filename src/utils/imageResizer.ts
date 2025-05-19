/**
 * 画像をリサイズして1MB以下にするユーティリティ
 */

export async function resizeImageToUnder1MB(file: File): Promise<File> {
  // 既に1MB以下の場合はそのまま返す
  if (file.size <= 1000000) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = async () => {
      try {
        // 初期圧縮率を設定
        let quality = 0.9;
        let scaleFactor = 1;
        let blob: Blob | null = null;

        // 元の画像サイズ
        let targetWidth = img.width;
        let targetHeight = img.height;

        // 最大サイズを設定（幅または高さの最大値）
        const maxDimension = 1920;

        // アスペクト比を保持してリサイズ
        if (targetWidth > maxDimension || targetHeight > maxDimension) {
          if (targetWidth > targetHeight) {
            scaleFactor = maxDimension / targetWidth;
          } else {
            scaleFactor = maxDimension / targetHeight;
          }
          targetWidth = Math.round(targetWidth * scaleFactor);
          targetHeight = Math.round(targetHeight * scaleFactor);
        }

        // ファイルサイズが1MB以下になるまで繰り返し圧縮
        while (quality > 0.1) {
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          
          // 画像を描画
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          // Blobに変換
          blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(
              (b) => resolve(b),
              file.type === 'image/png' ? 'image/png' : 'image/jpeg',
              quality
            );
          });

          if (!blob) {
            throw new Error('Failed to convert canvas to blob');
          }

          // サイズチェック
          if (blob.size <= 1000000) {
            break;
          }

          // さらに縮小が必要な場合
          if (quality > 0.5) {
            quality -= 0.1;
          } else {
            // 品質をこれ以上下げたくない場合は、画像サイズを縮小
            scaleFactor *= 0.8;
            targetWidth = Math.round(img.width * scaleFactor);
            targetHeight = Math.round(img.height * scaleFactor);
            quality = 0.8; // 品質をリセット
          }
        }

        if (!blob || blob.size > 1000000) {
          throw new Error('画像を1MB以下に圧縮できませんでした');
        }

        // Blobから新しいFileオブジェクトを作成
        const resizedFile = new File([blob], file.name, {
          type: blob.type,
          lastModified: Date.now(),
        });

        resolve(resizedFile);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('画像の読み込みに失敗しました'));
    };

    // 画像を読み込む
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('ファイルの読み込みに失敗しました'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * ペーストイベントから画像ファイルを取得
 */
export function getImageFromPasteEvent(e: ClipboardEvent): File | null {
  const items = e.clipboardData?.items;
  if (!items) return null;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.indexOf('image') !== -1) {
      const blob = item.getAsFile();
      if (blob) {
        // 画像ファイルに名前を付ける
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        return new File([blob], `screenshot-${timestamp}.png`, {
          type: blob.type,
          lastModified: Date.now(),
        });
      }
    }
  }

  return null;
}