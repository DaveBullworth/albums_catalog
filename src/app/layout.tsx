import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { Providers } from "@/components/providers/providers";
import {
  DEFAULT_LOCALE,
  dictionaries,
  type Locale,
} from "@/lib/i18n/dictionaries";

const display = Space_Grotesk({
  variable: "--font-display-src",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sans = Geist({
  variable: "--font-sans-src",
  subsets: ["latin"],
});

const mono = Geist_Mono({
  variable: "--font-mono-src",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Resonance — your music catalogue",
    template: "%s · Resonance",
  },
  description:
    "A personal, neon-lit catalogue of the albums you love — rate them, review them, build your collection from Spotify.",
};

export const viewport: Viewport = {
  themeColor: "#06070c",
  colorScheme: "dark",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieLocale = (await cookies()).get("locale")?.value as Locale | undefined;
  const initialLocale =
    cookieLocale && dictionaries[cookieLocale] ? cookieLocale : DEFAULT_LOCALE;

  return (
    <html
      lang={initialLocale}
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh antialiased">
        <Providers initialLocale={initialLocale}>{children}</Providers>
      </body>
    </html>
  );
}
