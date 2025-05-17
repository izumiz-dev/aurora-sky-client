import { createContext } from 'preact';
import { useState, useEffect, useContext } from 'preact/hooks';
import { useAuth } from './AuthContext';
import { getPreferences, updatePreferences } from '../lib/api';

interface LanguagePreferencesType {
  preferences: {
    postLanguage: string;
    contentLanguages: string[];
    showAllLanguages: boolean;
  };
  updatePreferences: (
    prefs: Partial<{
      postLanguage: string;
      contentLanguages: string[];
      showAllLanguages: boolean;
    }>
  ) => Promise<void>;
  isLoading: boolean;
}

const LanguagePreferencesContext = createContext<LanguagePreferencesType | undefined>(undefined);

export const LanguagePreferencesProvider = ({
  children,
}: {
  children: preact.ComponentChildren;
}) => {
  const { isAuthenticated } = useAuth();
  const [postLanguage, setPostLanguage] = useState<string>('ja');
  const [contentLanguages, setContentLanguages] = useState<string[]>([]);
  const [showAllLanguages, setShowAllLanguages] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  interface LanguagesPref {
  $type: string;
  primaryLanguages?: string[];
  contentLanguages?: string[];
}

interface PrefsWithPreferences {
  preferences?: LanguagesPref[];
}

// ローカルストレージから設定を読み込む
  useEffect(() => {
    const loadFromLocalStorage = () => {
      const savedPrefs = localStorage.getItem('language-preferences');
      if (savedPrefs) {
        try {
          const prefs = JSON.parse(savedPrefs);
          setPostLanguage(prefs.postLanguage || 'ja');
          setContentLanguages(prefs.contentLanguages || []);
          setShowAllLanguages(prefs.showAllLanguages !== false);
          // Loaded language preferences from localStorage
        } catch (error) {
          console.error('Failed to parse language preferences from localStorage:', error);
        }
      }
    };

    loadFromLocalStorage();
  }, []);

  // サーバーから設定を読み込む
  useEffect(() => {
    const loadFromServer = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        const prefs = await getPreferences();
        // Loaded preferences from server

        const prefsTyped = prefs as PrefsWithPreferences;
        if (prefsTyped.preferences) {
          const langPref = prefsTyped.preferences.find(
            (p) => p.$type === 'app.bsky.actor.defs#languagesPref'
          );

          if (langPref) {
            if (langPref.primaryLanguages && langPref.primaryLanguages.length > 0) {
              setPostLanguage(langPref.primaryLanguages[0]);
            }
            if (langPref.contentLanguages !== undefined) {
              if (langPref.contentLanguages.length === 0) {
                setShowAllLanguages(true);
                setContentLanguages([]);
              } else {
                setShowAllLanguages(false);
                setContentLanguages(langPref.contentLanguages);
              }
            }

            // ローカルストレージにも保存
            const localPrefs = {
              postLanguage: langPref.primaryLanguages?.[0] || 'ja',
              contentLanguages: langPref.contentLanguages || [],
              showAllLanguages: langPref.contentLanguages?.length === 0,
            };
            localStorage.setItem('language-preferences', JSON.stringify(localPrefs));
          }
        }
      } catch (error) {
        console.error('Failed to load preferences from server:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFromServer();
  }, [isAuthenticated]);

  const updateLanguagePreferences = async (
    prefs: Partial<{
      postLanguage: string;
      contentLanguages: string[];
      showAllLanguages: boolean;
    }>
  ) => {
    // 状態を更新
    if (prefs.postLanguage !== undefined) setPostLanguage(prefs.postLanguage);
    if (prefs.contentLanguages !== undefined) setContentLanguages(prefs.contentLanguages);
    if (prefs.showAllLanguages !== undefined) setShowAllLanguages(prefs.showAllLanguages);

    // ローカルストレージに保存
    const localPrefs = {
      postLanguage: prefs.postLanguage || postLanguage,
      contentLanguages: prefs.contentLanguages || contentLanguages,
      showAllLanguages:
        prefs.showAllLanguages !== undefined ? prefs.showAllLanguages : showAllLanguages,
    };
    localStorage.setItem('language-preferences', JSON.stringify(localPrefs));

    // サーバーに保存
    if (isAuthenticated) {
      try {
        const currentPrefs = await getPreferences();
        const currentPrefsTyped = currentPrefs as PrefsWithPreferences;
        const newPreferences = [...(currentPrefsTyped.preferences || [])];

        const langPrefIndex = newPreferences.findIndex(
          (p) => p.$type === 'app.bsky.actor.defs#languagesPref'
        );

        const languagesPref = {
          $type: 'app.bsky.actor.defs#languagesPref',
          primaryLanguages: [prefs.postLanguage || postLanguage],
          contentLanguages: (
            prefs.showAllLanguages !== undefined ? prefs.showAllLanguages : showAllLanguages
          )
            ? []
            : prefs.contentLanguages || contentLanguages,
        };

        if (langPrefIndex !== -1) {
          newPreferences[langPrefIndex] = languagesPref;
        } else {
          newPreferences.push(languagesPref);
        }

        // Saving preferences to server
        await updatePreferences(newPreferences);
      } catch (error) {
        console.error('Failed to save preferences to server:', error);
        throw error;
      }
    }
  };

  const value = {
    preferences: {
      postLanguage,
      contentLanguages,
      showAllLanguages,
    },
    updatePreferences: updateLanguagePreferences,
    isLoading,
  };

  return (
    <LanguagePreferencesContext.Provider value={value}>
      {children}
    </LanguagePreferencesContext.Provider>
  );
};

export const useLanguagePreferences = () => {
  const context = useContext(LanguagePreferencesContext);
  if (context === undefined) {
    throw new Error('useLanguagePreferences must be used within a LanguagePreferencesProvider');
  }
  return context;
};
