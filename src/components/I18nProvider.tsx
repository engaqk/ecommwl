"use client";

import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "../lib/i18n";

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  // Ensure i18n is initialized on the client side
  useEffect(() => {
    // If you want to detect language from local storage, you can do it here
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
