import type { Metadata } from "next";
import DropPinClient from "./DropPinClient";

const pageTitle = "Drop Pin Postal Code Finder in Nigeria";
const pageDescription =
  "Drop a pin on the map to find accurate Nigeria postal codes for addresses, deliveries, and online form submissions quickly.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/drop-pin",
    languages: {
      "en-ng": "/drop-pin",
      "x-default": "/drop-pin",
    },
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "/drop-pin",
    type: "website",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "Drop pin postal code finder",
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://postminer.com.ng";

export default function DropPinPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Drop Pin Finder",
        item: `${siteUrl}/drop-pin`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <DropPinClient />
    </>
  );
}
