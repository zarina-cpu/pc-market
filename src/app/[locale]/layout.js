import { Unbounded, Manrope } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { CartProvider } from "@/components/CartStore";
import Header from "@/components/Header";
import ThemeScript from "@/components/ThemeScript";
import "../globals.css";

const display = Unbounded({
  subsets: ["cyrillic", "latin"],
  variable: "--font-display",
  weight: ["500", "700"],
});

const body = Manrope({
  subsets: ["cyrillic", "latin", "latin-ext"],
  variable: "--font-body",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const messages = (await import(`../../../messages/${locale}.json`)).default;
  return {
    title: messages.meta.title,
    description: messages.meta.description,
  };
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${display.variable} ${body.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <CartProvider>
            <Header />
            <main className="shell">{children}</main>
            <footer className="site-footer">
              <div className="shell">{messages.footer.note}</div>
            </footer>
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
