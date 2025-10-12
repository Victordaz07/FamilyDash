import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FamilyDash - Dashboard Familiar Integral",
  description: "FamilyDash es el dashboard familiar completo: metas, calendario, tareas, Safe Room y más. Organiza tu familia de manera inteligente.",
  keywords: "familia, dashboard, metas familiares, calendario familiar, organización familiar, tareas, safe room",
  authors: [{ name: "FamilyDash Team" }],
  creator: "FamilyDash",
  publisher: "FamilyDash",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/assets/brand/logo-16.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/brand/logo-32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/brand/logo-64.png", sizes: "64x64", type: "image/png" },
      { url: "/assets/brand/logo-128.png", sizes: "128x128", type: "image/png" },
      { url: "/assets/brand/logo-256.png", sizes: "256x256", type: "image/png" },
    ],
    apple: "/assets/brand/apple-touch-icon.png",
    shortcut: "/assets/brand/logo-32.png",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://family-dash-15944.web.app/",
    siteName: "FamilyDash",
    title: "FamilyDash - Dashboard Familiar Integral",
    description: "FamilyDash es el dashboard familiar completo: metas, calendario, tareas, Safe Room y más.",
    images: [
      {
        url: "/assets/brand/logo-1024.png",
        width: 1024,
        height: 1024,
        alt: "FamilyDash - Dashboard Familiar Integral",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FamilyDash - Dashboard Familiar Integral",
    description: "FamilyDash es el dashboard familiar completo: metas, calendario, tareas, Safe Room y más.",
    images: ["/assets/brand/logo-1024.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
