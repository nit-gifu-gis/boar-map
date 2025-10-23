import { useCallback } from "react";
import { useRouter } from "next/router";

import { RESOURCES, DEFAULT_LOCALE, isSupportLocale, i18nKey, Locale } from "./resources";

export const useTranslation = (): {
    t: (key: i18nKey) => string;
    locale: Locale;
} => {
  const { locale } = useRouter();
  const currentLocale = isSupportLocale(locale) ? locale : DEFAULT_LOCALE;

  const translate = useCallback(
    (key: i18nKey) => {
      return RESOURCES[currentLocale][key];
    },
    [currentLocale]
  );

  return { t: translate, locale: currentLocale };
};