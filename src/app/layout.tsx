import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Roboto, Bebas_Neue as BebasNeue } from 'next/font/google';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
});

const bebas_neue = BebasNeue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas-neue',
});

const APP_NAME = "Vendetta";
const APP_DEFAULT_TITLE = "Vendetta tu familia Vendettera";
const APP_TITLE_TEMPLATE = "%s | Vendetta";
const APP_DESCRIPTION = "Gestiona tu imperio mafioso, construye edificios, recluta tropas y domina la ciudad en Vendetta, un juego de estrategia en tiempo real.";

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
    url: new URL("https://vendetta.app"), // Replace with your actual domain
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
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
      <body className={`${roboto.variable} ${bebas_neue.variable} font-sans antialiased bg-background`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
