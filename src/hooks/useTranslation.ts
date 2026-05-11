import { useModStore } from '../store/useModStore';
import { translations } from '../data/translations';
import type { Language, TranslationKey } from '../data/translations';

export function useTranslation() {
  const language = useModStore((state) => state.language);
  
  const t = (key: TranslationKey | string) => {
    const dict = translations as Partial<Record<Language, Record<string, string>>>;
    return dict[language]?.[key] || dict.en?.[key] || key;
  };

  return { t, language };
}
