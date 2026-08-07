import { create } from "zustand";
import { persist } from "zustand/middleware";

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी (Hindi)" },
  { code: "ta", label: "தமிழ் (Tamil)" },
  { code: "te", label: "తెలుగు (Telugu)" },
  { code: "mr", label: "मराठी (Marathi)" },
];

export const useLanguageStore = create(
  persist(
    set => ({
      language: "en",
      setLanguage: code => set({ language: code }),
    }),
    { name: "thinkhive-language" }
  )
);