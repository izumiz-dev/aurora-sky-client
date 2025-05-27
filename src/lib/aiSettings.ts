/**
 * AI機能の設定を管理
 */

const AI_SETTINGS_KEY = 'aurora-sky-ai-settings';

export interface AISettings {
  altTextGenerationEnabled: boolean;
  lastUpdated: string;
}

const DEFAULT_SETTINGS: AISettings = {
  altTextGenerationEnabled: false,
  lastUpdated: new Date().toISOString(),
};

export const getAISettings = (): AISettings => {
  try {
    const stored = localStorage.getItem(AI_SETTINGS_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    
    const settings = JSON.parse(stored);
    return {
      ...DEFAULT_SETTINGS,
      ...settings,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const updateAISettings = (updates: Partial<AISettings>): void => {
  const current = getAISettings();
  const updated = {
    ...current,
    ...updates,
    lastUpdated: new Date().toISOString(),
  };
  
  localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(updated));
};

export const isAltTextGenerationEnabled = (): boolean => {
  // 環境変数が設定されていない場合は無効
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    return false;
  }
  
  return getAISettings().altTextGenerationEnabled;
};