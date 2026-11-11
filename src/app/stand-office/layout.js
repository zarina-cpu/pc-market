import { Unbounded, Manrope } from "next/font/google";
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

export const metadata = {
  title: "Касса",
  robots: { index: false, follow: false },
};

export default function OfficeLayout({ children }) {
  return (
    <html lang="ru" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <main className="shell office-main">{children}</main>
      </body>
    </html>
  );
}
