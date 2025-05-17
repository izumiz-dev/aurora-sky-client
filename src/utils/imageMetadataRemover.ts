/**
 * 画像のメタデータを削除するユーティリティ
 * EXIF、GPS情報などのプライバシーに関わる情報を削除
 */

/**
 * 画像ファイルからメタデータを削除
 * 
 * @param file - 処理する画像ファイル
 * @returns メタデータが削除された新しいBlob
 */
export async function removeImageMetadata(file: File): Promise<Blob> {
  // 非画像ファイルの場合はそのまま返す
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // HEIC/HEIFファイルの場合は現時点でメタデータ削除をスキップ
  // （ブラウザサポートが限定的なため）
  if (file.type === 'image/heic' || file.type === 'image/heif') {
    console.warn('HEIC/HEIF files metadata removal is not supported yet');
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          // キャンバスを作成して画像を描画
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          // 画像を描画（この時点でメタデータは削除される）
          ctx.drawImage(img, 0, 0);
          
          // 元のファイルタイプを保持しつつ、品質を高く設定
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to create blob from canvas'));
              }
            },
            file.type,
            0.95 // 高品質を維持
          );
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      // 画像を読み込む
      if (e.target?.result && typeof e.target.result === 'string') {
        img.src = e.target.result;
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    // ファイルをData URLとして読み込む
    reader.readAsDataURL(file);
  });
}

/**
 * JPEGファイルからEXIFデータを削除（より効率的な方法）
 * 
 * @param file - 処理するJPEGファイル
 * @returns EXIFデータが削除された新しいBlob
 */
export async function removeJpegExif(file: File): Promise<Blob> {
  // JPEGファイルでない場合は通常の処理にフォールバック
  if (file.type !== 'image/jpeg') {
    return removeImageMetadata(file);
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const dataView = new DataView(arrayBuffer);
    
    // JPEGマーカーのチェック
    if (dataView.getUint16(0) !== 0xFFD8) {
      // 有効なJPEGでない場合は通常の処理にフォールバック
      return removeImageMetadata(file);
    }
    
    // EXIFデータを検索して削除
    let offset = 2;
    const cleanedChunks: Uint8Array[] = [new Uint8Array([0xFF, 0xD8])]; // SOI
    
    while (offset < dataView.byteLength) {
      const marker = dataView.getUint16(offset);
      
      // マーカーチェック
      if ((marker & 0xFF00) !== 0xFF00) {
        break;
      }
      
      // APP1(EXIF)マーカーをスキップ
      if (marker === 0xFFE1) {
        const segmentLength = dataView.getUint16(offset + 2);
        offset += 2 + segmentLength;
        continue;
      }
      
      // その他のマーカーは保持
      if (marker === 0xFFDA) { // SOS (Start of Scan)
        // 残りのデータをすべてコピー
        const remaining = new Uint8Array(arrayBuffer, offset);
        cleanedChunks.push(remaining);
        break;
      } else {
        const segmentLength = dataView.getUint16(offset + 2);
        const segment = new Uint8Array(arrayBuffer, offset, 2 + segmentLength);
        cleanedChunks.push(segment);
        offset += 2 + segmentLength;
      }
    }
    
    // クリーンアップされたデータを結合
    const totalLength = cleanedChunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const cleanedData = new Uint8Array(totalLength);
    let position = 0;
    
    for (const chunk of cleanedChunks) {
      cleanedData.set(chunk, position);
      position += chunk.length;
    }
    
    return new Blob([cleanedData], { type: 'image/jpeg' });
  } catch (error) {
    console.error('EXIF removal failed, falling back to canvas method:', error);
    return removeImageMetadata(file);
  }
}

/**
 * ファイルサイズを人間が読みやすい形式に変換
 * 
 * @param bytes - バイトサイズ
 * @returns フォーマットされたサイズ文字列
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}