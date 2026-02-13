import type { Metadata } from "next";

const pageTitle = "Nigeria State Postal Code Maps";
const pageDescription =
  "Explore official-style Nigeria state postal code maps with zoom controls to locate area and LGA postal details online quickly.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/state-maps",
    languages: {
      "en-ng": "/state-maps",
      "x-default": "/state-maps",
    },
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "/state-maps",
    type: "website",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "Nigeria state postal code maps",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: ["/icon-512.png"],
  },
};

export default function StateMapsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
