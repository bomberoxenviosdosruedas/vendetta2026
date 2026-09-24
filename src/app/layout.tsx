import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const APP_NAME = "Vendetta";
const APP_DEFAULT_TITLE = "Vendetta tu familia Vendettera";
const APP_TITLE_TEMPLATE = "%s | Vendetta";
const APP_DESCRIPTION = "Gestiona tu imperio mafioso, construye edificios, recluta tropas y domina la ciudad en Vendetta, un juego de estrategia en tiempo real.";
const APP_URL = "https://vendettadashboardredis.vercel.app";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    url: new URL(APP_URL),
    locale: "es_ES",
    images: [
      {
        url: `${APP_URL}/icons/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Banner de Vendetta, un juego de estrategia de mafia.",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    images: [
      {
        url: `${APP_URL}/icons/og-image.png`,
        alt: "Banner de Vendetta, un juego de estrategia de mafia.",
      },
    ],
  },
  keywords: ["vendetta", "mafia", "estrategia", "juego online", "gestión de recursos", "juego de navegador"],
  authors: [{ name: "Vendetta Team" }],
  creator: "Vendetta Team",
  publisher: "Vendetta Team",
  robots: "index, follow",
};

export const viewport: Viewport = {
  themeColor: "#121212",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&family=Space+Mono:wght@400;700&display=swap"
        />
      </head>
      <body className="font-sans antialiased bg-background">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
