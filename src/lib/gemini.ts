/**
 * Google Gemini API統合
 * 画像からALTテキストを生成
 */

import { isAltTextGenerationEnabled } from './aiSettings';

// Gemini 2.0 Flash Experimental - 最新の高速モデル
const GEMINI_MODEL = 'gemini-2.0-flash-exp';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

/**
 * WCAGガイドラインに基づいたALTテキスト生成プロンプト
 */
const ALT_TEXT_PROMPTS: Record<string, string> = {
  ja: `この画像の代替テキストを生成してください。以下のWCAGガイドラインに従ってください：

【必須要件】
- 100文字以内で簡潔に
- 画像の本質的な情報のみを記述
- 「画像」「写真」「図」などの単語は使わない
- 客観的で事実に基づいた記述
- 現在形で記述

【含めるべき内容】
- 画像が伝える主要な情報
- 重要な人物、物体、場所、行動
- テキストが含まれる場合はその内容

【避けるべき内容】
- 装飾的な詳細
- 個人的な解釈
- 冗長な説明

装飾的な画像の場合は「装飾」とだけ返してください。`,

  en: `Generate alt text for this image following WCAG guidelines:

REQUIREMENTS:
- Maximum 100 characters
- Describe only essential information
- Don't use words like "image", "photo", "picture"
- Be objective and factual
- Use present tense

INCLUDE:
- Main information conveyed by the image
- Important people, objects, places, actions
- Any text content in the image

AVOID:
- Decorative details
- Personal interpretations
- Redundant descriptions

For decorative images, return only "decorative".`,

  es: `Genera texto alternativo para esta imagen siguiendo las pautas WCAG:

REQUISITOS:
- Máximo 100 caracteres
- Describe solo información esencial
- No uses palabras como "imagen", "foto"
- Sé objetivo y factual
- Usa tiempo presente

INCLUIR:
- Información principal de la imagen
- Personas, objetos, lugares, acciones importantes
- Cualquier texto en la imagen

EVITAR:
- Detalles decorativos
- Interpretaciones personales
- Descripciones redundantes

Para imágenes decorativas, devuelve solo "decorativa".`,

  // デフォルト（その他の言語）
  default: `Generate concise alt text for this image (max 100 characters). Describe only essential information. Be objective and factual.`,
};

/**
 * 画像ファイルをBase64に変換
 */
const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Gemini APIを使用して画像の説明を生成
 * @param file 画像ファイル
 * @param language 生成する言語（デフォルト: 'ja'）
 */
export const generateAltText = async (file: File, language: string = 'ja'): Promise<string> => {
  // 機能が無効の場合は空文字を返す
  if (!isAltTextGenerationEnabled()) {
    return '';
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('Gemini API key is not configured');
    return '';
  }

  try {
    const base64Image = await fileToBase64(file);

    // 言語に応じたプロンプトを選択
    const prompt = ALT_TEXT_PROMPTS[language] || ALT_TEXT_PROMPTS.default;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
              {
                inlineData: {
                  mimeType: file.type || 'image/jpeg',
                  data: base64Image,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1, // より一貫性のある出力のため低めに設定
          maxOutputTokens: 150, // 100文字制限に対応
          topP: 0.8,
          topK: 10,
        },
      }),
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status, response.statusText);
      return '';
    }

    const data: GeminiResponse = await response.json();
    const altText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // 改行や余分な空白を削除、100文字に切り詰め
    const cleanedText = altText.trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');

    // WCAGガイドラインに従い100文字以内に制限
    if (cleanedText.length > 100) {
      // 最後の完全な単語で切る
      const truncated = cleanedText.substring(0, 100);
      const lastSpace = truncated.lastIndexOf(' ');
      return lastSpace > 80 ? truncated.substring(0, lastSpace) : truncated;
    }

    return cleanedText;
  } catch (error) {
    console.error('Failed to generate alt text:', error);
    return '';
  }
};

/**
 * 複数の画像に対してALTテキストを生成
 */
export const generateAltTextsForImages = async (
  images: Array<{ file: File; alt: string }>,
  language: string = 'ja',
  onProgress?: (index: number) => void
): Promise<string[]> => {
  const results: string[] = [];

  for (let i = 0; i < images.length; i++) {
    const image = images[i];

    // すでにALTテキストがある場合はスキップ
    if (image.alt) {
      results.push(image.alt);
      continue;
    }

    // 進捗通知
    if (onProgress) {
      onProgress(i);
    }

    // ALTテキスト生成
    const altText = await generateAltText(image.file, language);
    results.push(altText);

    // レート制限を考慮して少し待機
    if (i < images.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return results;
};
