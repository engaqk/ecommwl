import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import I18nProvider from "@/components/I18nProvider";
import LayoutWrapper from "@/components/LayoutWrapper";
import TenantProvider from "@/components/TenantProvider";
import { Toaster } from "react-hot-toast";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import GoogleTranslate from "@/components/GoogleTranslate";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "E-Commerce Platform",
  description: "Multi-tenant e-commerce platform.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Store",
  },
};

export const viewport: Viewport = {
  themeColor: "#FCFCF9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans min-h-screen flex items-center justify-center bg-slate-200 text-[var(--color-navy)] antialiased`}>
        <div className="relative flex flex-col h-full min-h-screen md:min-h-0 md:h-[95vh] w-full max-w-[1400px] overflow-hidden bg-[var(--color-background)] md:shadow-2xl md:rounded-[40px] border border-gray-200/50">
          <TenantProvider>
            <I18nProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
              <Toaster position="bottom-center" />
            </I18nProvider>
          </TenantProvider>
        </div>
        <PWAInstallPrompt />
        <GoogleTranslate />
      </body>
    </html>
  );
}
