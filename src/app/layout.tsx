import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Providers } from "./providers";

export const metadata = {
  title: {
    default: "AI-based Nigeria Zip Postal Code Finder",
    template: "%s | AI-based Nigeria Zip Postal Code Finder",
  },
  description: "Find Nigerian postal codes instantly using GPS, smart search, or manual lookup.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
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
