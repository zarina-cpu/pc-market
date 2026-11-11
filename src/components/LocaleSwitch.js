"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export default function LocaleSwitch() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function setLocale(next) {
    router.replace(pathname, { locale: next });
  }

  return (
    <span className="header-tools">
      <button
        className="tool-btn"
        type="button"
        onClick={() => setLocale("ru")}
        aria-pressed={locale === "ru"}
      >
        RU
      </button>
      <button
        className="tool-btn"
        type="button"
        onClick={() => setLocale("uz")}
        aria-pressed={locale === "uz"}
      >
        UZ
      </button>
    </span>
  );
}
