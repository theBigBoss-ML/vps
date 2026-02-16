import { unstable_noStore as noStore } from "next/cache";
import HomeClient from "./HomeClient";
import { getUsageStatsSnapshot } from "@/lib/usageStatsServer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://postminer.com.ng";
const siteTitle = "Postminer.com.ng";
const siteDescription =
  "AI-based, free and fast Nigeria zip postal code lookup with GPS, drop-pin, and smart manual search.";

function buildSoftwareApplicationSchema(
  likes: number,
  dislikes: number,
  generations: number
) {
  const totalFeedbackVotes = likes + dislikes;

  if (totalFeedbackVotes <= 0) {
    return null;
  }

  const ratingScaleMin = 1;
  const ratingScaleMax = 5;
  const computedRating = (likes / totalFeedbackVotes) * ratingScaleMax;
  const clampedRating = Math.max(
    ratingScaleMin,
    Math.min(ratingScaleMax, computedRating)
  );

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteTitle,
    url: siteUrl,
    description: siteDescription,
    operatingSystem: "Web",
    applicationCategory: "UtilitiesApplication",
    applicationSubCategory: "Postal Code Lookup",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "NGN",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: Number(clampedRating.toFixed(1)),
      ratingCount: totalFeedbackVotes,
      bestRating: ratingScaleMax,
      worstRating: ratingScaleMin,
    },
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/UseAction",
      userInteractionCount: generations,
    },
  };
}

export default async function HomePage() {
  noStore();

  const stats = await getUsageStatsSnapshot();
  const reviewSchema = buildSoftwareApplicationSchema(
    stats.likes,
    stats.dislikes,
    stats.generations
  );

  return (
    <>
      <HomeClient />
      {reviewSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
        />
      ) : null}
    </>
  );
}
