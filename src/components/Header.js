"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import LocaleSwitch from "./LocaleSwitch";
import ThemeToggle from "./ThemeToggle";
import { useCart } from "./CartStore";

export default function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const cart = useCart();

  const links = [
    { href: "/", label: t("home") },
    { href: "/catalog", label: t("catalog") },
    { href: "/builder", label: t("builder") },
    { href: "/cart", label: `${t("cart")} (${cart.count()})` },
  ];

  return (
    <header className="site-header">
      <div className="shell header-row">
        <Link href="/" className="brand">
          <small>PC MARKET</small>
          <b>{t("shop")}</b>
        </Link>
        <nav className="nav">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              data-active={pathname === link.href ? "true" : "false"}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="header-tools">
          <LocaleSwitch />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
