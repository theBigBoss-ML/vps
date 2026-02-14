import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://postminer.com.ng';

export const metadata: Metadata = {
  title: 'History of Nigerian Postal Services and Addressing | Postminer',
  description:
    'From 1852 to NIPOST — how Nigeria built its postal system from colonial mail boats to a national addressing policy. The full story, timeline included.',
  alternates: {
    canonical: '/blog/history-of-nigerian-postal-services',
    languages: { 'en-ng': '/blog/history-of-nigerian-postal-services', 'x-default': '/blog/history-of-nigerian-postal-services' },
  },
  openGraph: {
    type: 'article',
    url: `${siteUrl}/blog/history-of-nigerian-postal-services`,
    title: 'History of Nigerian Postal Services and Addressing',
    description:
      'From 1852 to NIPOST — how Nigeria built its postal system from colonial mail boats to a national addressing policy.',
    siteName: 'Postminer.com.ng',
    locale: 'en_NG',
    images: [{ url: '/icon-512.png', width: 512, height: 512, alt: 'Postminer.com.ng' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'History of Nigerian Postal Services and Addressing',
    description:
      'From 1852 to NIPOST — how Nigeria built its postal system from colonial mail boats to a national addressing policy.',
  },
  robots: { index: true, follow: true },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'The History of Nigerian Postal Services and Addressing',
  author: { '@type': 'Organization', name: 'Postminer.com.ng' },
  publisher: { '@type': 'Organization', name: 'Postminer.com.ng', logo: { '@type': 'ImageObject', url: `${siteUrl}/icon-512.png` } },
  datePublished: '2026-02-14',
  dateModified: '2026-02-14',
  mainEntityOfPage: `${siteUrl}/blog/history-of-nigerian-postal-services`,
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog` },
    { '@type': 'ListItem', position: 3, name: 'History of Nigerian Postal Services' },
  ],
};

export default function HistoryOfNigerianPostalServicesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-lg font-bold text-foreground">Postminer.com.ng</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link>
            <Link href="/drop-pin" className="text-sm text-muted-foreground hover:text-primary transition-colors hidden sm:block">Drop Pin</Link>
            <Link href="/state-maps" className="text-sm text-muted-foreground hover:text-primary transition-colors hidden sm:block">State Maps</Link>
          </nav>
        </div>
      </header>

      {/* Breadcrumb */}
      <nav className="container mx-auto px-4 py-4 max-w-4xl" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
          <li>/</li>
          <li className="text-foreground font-medium">History of Nigerian Postal Services</li>
        </ol>
      </nav>

      {/* Article */}
      <main className="container mx-auto px-4 pb-16 max-w-4xl">
        <article className="space-y-8">
          <header className="space-y-4 pb-6 border-b border-border/40">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
              The History of Nigerian Postal Services and Addressing
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>By Postminer.com.ng Team</span>
              <span>&middot;</span>
              <time dateTime="2026-02-14">February 14, 2026</time>
              <span>&middot;</span>
              <span>8 min read</span>
            </div>
          </header>

          <div className="space-y-8 text-sm md:text-base text-muted-foreground leading-relaxed">
            {/* Intro */}
            <p>
              The history of postal services and addressing in Nigeria go hand-in-hand. You cannot really have an effective postal system
              without a proper addressing system. And understanding how Nigeria got to its current 6-digit postal code setup helps you
              appreciate why tools like <Link href="/" className="text-primary hover:underline">Postminer.com.ng</Link> exist in the first place.
            </p>

            {/* Section 1 */}
            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold text-foreground border-b border-border/40 pb-2">
                The Beginning — Colonial Era (1852–1899)
              </h2>
              <p>
                The history of the Post in Nigeria dates back to the 19th century. The first post office was established by the British Colonial
                Administration in 1852. At that time, it was considered to be part of the British postal system — basically a branch of
                London&apos;s General Post Office. And it stayed that way until 1874.
              </p>
              <p>
                In 1862, when the Post Office became a full department, the Royal Niger Company (RNC) — which was heavily involved in
                trade activities in the region — set up its own postal system. They established post offices at Akassa in 1887, Calabar
                in 1891, Burutu in 1897, and Lokoja in 1899. Mail moved between these trading stations and Lagos by a weekly mail boat.
              </p>
              <p>
                By 1898, the British Post Office had also established offices at Badagary, Epe, Ikorodu, Ijebu-Ode, Ibadan, and Abeokuta.
                And in 1892, the Royal Niger Company became a member of the Universal Postal Union — a significant step that connected
                Nigeria to the international mail network.
              </p>
              <p>
                By 1908, money orders and mail were directly exchanged with the German West African Colonies instead of routing everything
                through London, as was the practice before. The postal system was starting to mature.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold text-foreground border-b border-border/40 pb-2">
                Early Post Office Expansion (1900–1960)
              </h2>
              <p>
                From January 1, 1900, the Southern Nigeria Government took over the responsibility of running the postal system.
                Roads were not exactly great in those days, so mail was conveyed by canoes, launches, and runners — and these
                could only operate at intervals of two weeks or less.
              </p>
              <p>
                The first post office in Northern Nigeria was established at Lokoja in 1899. British postal orders were being sold
                and cashed starting from 1907 at post offices located at the headquarters of all District Commissioners.
              </p>
              <p>
                In 1925, Royal Air Force planes flew from Kano to Cairo carrying mail for the first time outside the country. Internal
                airmail flights started in 1931. By 1906, 27 post offices were operating across the country.
              </p>
              <p>
                And at the time of independence in 1960, Nigeria had grown to 176 post offices, 10 sub-post offices, and about 1,000
                postal agencies. That is a significant network built over roughly six decades.
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold text-foreground border-b border-border/40 pb-2">
                Post-Independence: Building a National System (1960–1992)
              </h2>
              <p>
                At independence, the post was administered jointly with Telecommunications as a government department. The Federal Government
                by Decree No. 22 of 1966 made the department a quasi-commercial organisation — a step towards making it more efficient
                and responsive to public needs.
              </p>
              <p>
                The Nigeria Postal Service Department came into being with the establishment of NITEL (Nigeria Telecommunications Limited)
                on January 1, 1985. This happened when the telecommunications arm split off from the postal arm of the old Post and
                Telecommunications Department.
              </p>
              <p>
                Through Decree No. 18 of 1987, NIPOST became an Extra-Ministerial Department with a clear set of functions: collecting
                and distributing mail, operating money order systems, providing philatelic services, printing postage stamps, and
                representing Nigeria in international postal matters.
              </p>
              <p>
                Then in 1992, the Federal Government promulgated Decree 41, which classified NIPOST as a Government Parastatal. This gave
                NIPOST more autonomy and the power to determine the need for post offices, establish postal tariffs, and explore
                additional services to boost revenue.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold text-foreground border-b border-border/40 pb-2">
                NIPOST as We Know It Today
              </h2>
              <p>
                Today, NIPOST is responsible for developing, promoting, and providing postal services across Nigeria at reasonable rates.
                Its core functions include maintaining an efficient mail collection, sorting, and delivery system nationwide, and
                providing various types of mail services for different categories of users.
              </p>
              <p>
                NIPOST also has the power to prescribe postage rates, establish and review postal tariffs, and provide non-postal services.
                It represents Nigeria in its relations with other postal administrations and international bodies like the Universal Postal Union.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold text-foreground border-b border-border/40 pb-2">
                The Challenge of Addressing in Nigeria
              </h2>
              <p>
                Now here is where things get really interesting. From the beginning, the post has been one of the major means of
                communication. But mailing items from one point to another is only effective when the addressing system is clear.
                The recipient and location must be unambiguous — the right person at the right place.
              </p>
              <p>
                The World Bank, in 2005, declared street addressing as an essential medium of recognising the &ldquo;civic rights of
                all citizens&rdquo; within any administrative jurisdiction. So a proper street naming and property numbering system
                is not just a convenience — it is infrastructure for socio-economic development.
              </p>
              <p>
                Over the years, Nigeria faced the challenge of linking every household to a unique identifiable address using
                international standards. This function is vested in Local Government Administration by the Nigerian Constitution.
                But the lack of uniformity made federal intervention inevitable.
              </p>
              <p>
                Before reforms, the state of addressing was disparate and uncoordinated. Local governments were adopting different
                formats and standards, implementing at varying pace. Other agencies like NIMC and INEC were collecting addressing
                information that did not always conform with what the local governments were doing.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold text-foreground border-b border-border/40 pb-2">
                National Addressing Policy (2004–2014)
              </h2>
              <p>
                In 2004, the Ministry of Housing and Urban Development tried to intervene by collaborating with states and local governments.
                But the real push came in 2009, when the Ministry of Information and Communication hosted a two-day workshop on
                addressing systems at the Lagos Sheraton Hotel with the theme: &ldquo;Addressing as a Strategic Infrastructure for
                National Development.&rdquo;
              </p>
              <p>
                That workshop led to the inauguration of a National Addressing System Steering Committee involving major stakeholders.
                The committee produced a draft National Addressing Policy document, which was submitted to the Minister of Communication
                Technology in May 2012.
              </p>
              <p>
                In January 2013, a stakeholders forum at Lagos City Hall reviewed the draft and collated further recommendations.
                The policy was approved by the Federal Executive Council on November 27, 2013, and adopted by the National Economic
                Council on November 20, 2014.
              </p>
              <p>
                That policy is the backbone of the 6-digit postal code system that NIPOST uses today.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold text-foreground border-b border-border/40 pb-2">
                What This Means for You Today
              </h2>
              <p>
                The postal service started in 1852, but it took until 2014 for a national addressing policy to be adopted.
                That is over 160 years. It shows the complexity of building addressing infrastructure in a country as diverse and large as Nigeria.
              </p>
              <p>
                Today, every area in Nigeria has a unique 6-digit postal code. The challenge now is not whether the code exists — it is
                finding the right one for your specific location. That is exactly what{' '}
                <Link href="/" className="text-primary hover:underline">Postminer.com.ng</Link> was built to solve.
              </p>
              <p>
                Whether you need your postal code for a delivery address, an ecommerce checkout, a bank form, or a government application,
                you can get it in seconds using{' '}
                <Link href="/" className="text-primary hover:underline">GPS detection</Link>,{' '}
                <Link href="/drop-pin" className="text-primary hover:underline">drop-pin maps</Link>, or{' '}
                <Link href="/state-maps" className="text-primary hover:underline">state maps</Link>.
                The 162-year journey from colonial mail boats to instant GPS-powered postal code lookup — that is progress.
              </p>
            </section>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 bg-card/30">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Postminer.com.ng. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Schema Markup */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </div>
  );
}
