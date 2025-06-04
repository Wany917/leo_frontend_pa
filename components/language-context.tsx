"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export type Language = string;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, any>) => string;
  isLoading: boolean;
  availableLocales: Language[];
  addLocale: (lang: Language) => Promise<void>;
  removeLocale: (lang: Language) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "EN",
  setLanguage: async () => {},
  t: (k) => k,
  isLoading: true,
  availableLocales: [],
  addLocale: async () => {},
  removeLocale: async () => {},
});

export function useLanguage() {
  return useContext(LanguageContext);
}

const STORAGE_KEY = "ecodeli-language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") return "EN";
    return localStorage.getItem(STORAGE_KEY) || "EN";
  });
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [availableLocales, setAvailableLocales] = useState<Language[]>([]);

  const refreshLocales = async () => {
    try {
      const res = await fetch("/api/translations", { cache: "no-store" });
      if (res.ok) {
        const { locales } = await res.json();
        setAvailableLocales(locales.map((l: string) => l.toLowerCase()));
      }
    } catch (e) {
      console.error("Cannot load locales:", e);
    }
  };

  useEffect(() => {
    refreshLocales();
  }, []);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const r = await fetch(`/api/translations/${language}`, {
          cache: "no-store",
        });
        if (r.ok) setTranslations(await r.json());
        else setTranslations({});
      } catch {
        setTranslations({});
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [language]);

  const setLanguage = (loc: Language) => {
    setLanguageState(loc);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, loc);
  };

  const addLocale = async (loc: Language) => {
    try {
      const code = loc.toLowerCase();
      const res = await fetch(`/api/translations/${code}`, { method: "PUT" });
      if (res.ok) {
        await refreshLocales();
        setLanguage(code);
      }
    } catch (err) {
      console.error("addLocale failed", err);
    }
  };

  const removeLocale = async (loc: Language) => {
    try {
      const res = await fetch("/api/translations/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: loc }),
      });
      if (res.ok) {
        await refreshLocales();
        if (language === loc) setLanguage("en");
      }
    } catch (err) {
      console.error("removeLocale failed", err);
    }
  };

  const t = (key: string, params?: Record<string, any>) => {
    if (isLoading) return key;
    let text = key
      .split(".")
      .reduce((acc: any, part) => (acc && acc[part] ? acc[part] : null), translations)
      ?? key;
    
    // Replace parameters if any
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(`{${paramKey}}`, String(paramValue));
      });
    }
    
    return text;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isLoading,
        availableLocales,
        addLocale,
        removeLocale,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}
