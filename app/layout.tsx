import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mirokaï Experience",
  description: "Venez découvrir l'incroyable Mirokaï experience au sein de Paris.",
  manifest: "/manifest.json",
  icons: {
    icon: "/Logo-mirokaÏ.png",
    shortcut: "/Logo-mirokaÏ.png",
    apple: "/Logo-mirokaÏ.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mirokaï",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0d0b1e",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className="antialiased" style={{ fontFamily: "'SpaceGrotesk', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
