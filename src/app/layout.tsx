import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Providers } from "./providers";

export const metadata = {
  title: {
    default: "AI-based Nigeria Zip Postal Code Finder",
    template: "%s | AI-based Nigeria Zip Postal Code Finder",
  },
  description: "AI-based Nigeria postal code finder using GPS, smart search, or manual lookup.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
