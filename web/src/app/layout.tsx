import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FamilyDash - Dashboard Familiar Integral",
  description: "FamilyDash es el dashboard familiar completo: metas, calendario, tareas, Safe Room y más. Organiza tu familia de manera inteligente.",
  keywords: "familia, dashboard, metas familiares, calendario familiar, organización familiar, tareas, safe room",
  authors: [{ name: "FamilyDash Team" }],
  creator: "FamilyDash",
  publisher: "FamilyDash",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://family-dash-15944.web.app/",
    siteName: "FamilyDash",
    title: "FamilyDash - Dashboard Familiar Integral",
    description: "FamilyDash es el dashboard familiar completo: metas, calendario, tareas, Safe Room y más.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FamilyDash - Dashboard Familiar Integral",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FamilyDash - Dashboard Familiar Integral",
    description: "FamilyDash es el dashboard familiar completo: metas, calendario, tareas, Safe Room y más.",
    images: ["/og-image.png"],
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
