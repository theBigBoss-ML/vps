import { BlogPost, generateTableOfContents, calculateReadingTime } from '@/types/blog';

type BlogPostDraft = Omit<BlogPost, 'readingTime' | 'tableOfContents'>;

function buildPost(draft: BlogPostDraft): BlogPost {
  return {
    ...draft,
    readingTime: calculateReadingTime(draft.content),
    tableOfContents: generateTableOfContents(draft.content),
  };
}

const nipostServicesContent = `
The Nigerian Postal Service (NIPOST) is the national carrier of all classes of mail items for delivery both within and outside Nigeria. Mail items, which include letters, postcards, printed papers, parcels and aerogrammes are processed through the post office.

## Types of Mail Services

### Conventional Mail

These can be classified according to the delivery schedule or other qualities. They include:

**I. First Class Mail:** These are mail that require faster delivery than ordinary mail and they attract extra postage fees.

**II. Second Class Mail:** These are mail delivered at no cost other than the stipulated postage rate, a rate lower than that of First Class Mail.

**III. Registered Mail:** These are mail items requiring special handling because of its contents, which may be Money Order, Postal Order, Bank draft etc. An extra fee is charged in addition to the postage payment.

### Business Mail

Business mail service is concerned with processing mail which are exclusively meant for business purposes (transactions).

## Mail Delivery Options

Delivery of mail to addresses in Nigeria is effected through the following means:

**I. Post Office Boxes:** Post Office boxes are installed in all post offices and sub-post office across the country, and are available for rent on completion of relevant forms and office formalities. The use of post office box guarantees customers' security, privacy and convenience of their mail collection.

**II. Private Mail Bag:** This service is available on application to the Postmaster in-charge of any post office. It is particularly suitable for customers who receive large quantity of mail (daily) and are prepared to accept delivery/collection usually at least once daily.

**III. Special Delivery Service:** This is a service introduced for corporate organisations that have 'PMB' and generate large volume of mail. On agreed frequency, NIPOST collects client's mail for their private mailbags and delivers to their offices for an agreed fee.

**IV. Post Restante:** This is a service for individuals travelling out of their base, who expect important letters. Interested customers could call for such letters by applying for "Post Restante" or "To be called for".

**V. Street Delivery:** It entails mail delivery by postmen on house to house basis. The effectiveness of this service depends, to a large extent, on how well a street is named and numbered.

**VI. Caller Services:** Where there is no house to house delivery and individuals are unable to procure a private box or private mail bag, addressees may claim their correspondence at the post office or postal agency during normal office hours.

## Counter Services and Products

NIPOST has a large number of counters in all the Post offices throughout the country and offers the following transactions across the counters daily:

### Nigerian Postal Orders

Nigerian Postal Orders are redeemable or could be purchased at all post offices, sub-post offices and postal Agencies in Nigeria. They constitute a means of remittance and are not redeemable outside Nigeria. The Postal Orders are available at various denominations. It is faster to obtain from any post office, easy to cash at any post office. It attracts low commission compared to Bank draft.

### Inland Money Order

An inland money order is an order issued at a post office or sub-post office in Nigeria for payment at the same or any other post office or sub-post office. In Nigeria, money order can be drawn for any sum, but at different denominations. Its relative advantage over the postal order is that attracts low commission.

### Postage Stamps

Customers can buy postage stamps across our counters in all post offices, sub-post offices, postal agencies, and Postshops all over the country. Postage Stamps are available in different denominations, to enable customers meet their mailing needs with ease.

### Air Letter Cards

The airmail letter cards are also available for sale over the counters. We have the domestic airmail for local mail as well as the overseas airmail for oversea mail.

### Post Cards

The international postage rate for Post Cards is N50.00 to anywhere in the world. The local rate for post cards is N20.00. Pre-stamped international post cards are available at most post offices.

## Additional Services

### Pick Up Service

The Pick-up Service allows a customer to call either by phone or any other means at any designated post office to have his/her mail collected and delivered to a required address within two hours. The service is available from Monday to Saturday.

### Postal Media and Advertising

This service includes Slogan Die Advertisement and Billboard Advertisement. Slogan Die Advertisement is a unique system through which publicity could be given through a slogan impression on all letters for a period of time.

### Mail/Passenger Services

This is a passenger transport service, which operates on existing mail routes in order to meet the organization's aspiration of carrying human commuters in addition to conveyance of mail at moderate fee.

### Agency Service

Agency service is an across the counter delivery service performed for other organizations on commission basis. This includes Sales and Renewal of Drilling/Meter License, Payment of Pension, Sales and Distribution of Examination forms (WAEC, NECO, JAMB etc).

### Business Reply Services

Under this service, a person who wishes to obtain a reply from a client without putting him to the expense of paying postage, may enclose in his communication an unstamped postcard, envelope, folder or gummed label.

### Sale of International Reply Coupon

This service is only available to foreign countries and no license is required. The user or sender will be required to buy the coupon at determined current rate at the post office counter.

### Licensing of Postage Meter Franking Machine

These machines can be hired or purchased from the manufacturers for the purpose of franking correspondences with an impression denoting the amount of postage with date and place of posting.

### Post Office Counter Space Rental

Counter spaces are available for probable lease to customers like Banks, co-operative societies, clubs, Associations and similar organizations.

### Stamp Duty

The Stamp duty act is principally a financial regulation but its implementation is exercised through the use of Postage stamps. Bulk users can hire Tax Meter Machines for putting on impression denoting the amount of stamp duty.

### Privately Operated Postal Agencies/Sub-offices

NIPOST appoints paid postal agents in areas where a post office is not available and there is established demand for postal services. The Postal agents can sell stamps to the public and deliver mail on behalf of NIPOST.

### Post Office Identity Cards

Post office identity cards are issued to NIPOST customers as a means of identifying them in their day to day transactions with the post office.
`;

const historyOfNigerianPostalServicesContent = `
The history of postal services and addressing in Nigeria is a long institutional journey. The postal network started in the colonial era, expanded through independence, and later evolved into NIPOST and a national addressing policy.

## The Beginning - Colonial Era (1852-1899)

### 1852 - First Post Office in Nigeria

The first post office in what is now Nigeria was established in 1852 by the British Colonial Administration. At that stage, the service operated as part of the British postal system.

### 1862 - Post Office Becomes a Full Department

By 1862, the post office had become a full government department. This marked the beginning of a more structured and locally administered postal operation.

### 1887 to 1899 - Royal Niger Company Expansion

The Royal Niger Company developed parallel postal facilities in key trade locations. Offices were set up at Akassa (1887), Calabar (1891), Burutu (1897), and Lokoja (1899), with weekly mail boat connections to Lagos.

### 1892 - Universal Postal Union Link

In 1892, the Royal Niger Company became a member of the Universal Postal Union. That membership improved cross-border postal integration and aligned Nigerian mail operations with global postal standards of that era.

### 1898 - Wider Office Rollout in the South-West

By 1898, British postal offices had also spread to towns including Badagry, Epe, Ikorodu, Ijebu-Ode, Ibadan, and Abeokuta. This helped connect administrative and commercial centers more reliably.

## Early Post Office Expansion (1900-1960)

### 1900 - Southern Nigeria Government Takes Over

From January 1, 1900, the Southern Nigeria Government assumed direct responsibility for operating the postal system. Transport limitations meant mail often moved by canoes, launches, and runners at long intervals.

### 1906 - 27 Post Offices in Operation

By 1906, Nigeria had grown to 27 post offices. This was a major increase from the earliest colonial footprint and signaled growing dependence on formal postal communication.

### 1907 - Postal Orders at District Headquarters

From 1907, British postal orders were sold and cashed at post offices located in district headquarters. This added early financial transaction capability to the postal network.

### 1925 - First Outbound Airmail Movement

In 1925, Royal Air Force aircraft carried outbound mail from Kano to Cairo. This marked an important transition from purely surface-based movement to an aviation-assisted postal channel.

### 1931 - Internal Airmail Services Begin

In 1931, internal airmail services began in Nigeria. This improved inter-city mail speed and reduced dependency on slower road and water routes.

### 1960 - Scale at Independence

At independence in 1960, Nigeria had expanded to 176 post offices, 10 sub-post offices, and about 1,000 postal agencies. The system had become a significant national communications infrastructure.

## Post-Independence Institution Building (1960-1992)

### 1966 - Quasi-Commercial Reform

Through Decree No. 22 of 1966, the combined post and telecommunications department was transformed into a quasi-commercial organization. The aim was to improve efficiency and responsiveness.

### 1985 - Postal and Telecom Split

On January 1, 1985, the establishment of NITEL separated telecommunications from postal operations. This restructuring created a distinct Nigeria Postal Service Department.

### 1987 - NIPOST as Extra-Ministerial Department

Decree No. 18 of 1987 established NIPOST as an Extra-Ministerial Department with defined mandates, including mail conveyance, money order systems, philatelic services, stamp production, and international postal representation.

### 1992 - NIPOST as Government Parastatal

Decree 41 of 1992 classified NIPOST as a Government Parastatal. This gave NIPOST broader operational autonomy over tariffs, service expansion, and postal office development.

## Addressing System Challenges in Nigeria

### 2005 - Addressing Recognized as Core Civic Infrastructure

Street naming and property numbering became more prominent as policy concerns. Public-sector and development institutions emphasized that reliable addressing is foundational for governance, commerce, and service delivery.

### Pre-Reform Period - Fragmented Local Standards

Before a national framework matured, addressing practice was inconsistent across states and local governments. Different conventions and data formats created operational friction for national-scale delivery and identity systems.

## National Addressing Policy Milestones (2004-2014)

### 2004 - Early Federal Coordination Attempts

The Ministry of Housing and Urban Development began coordination efforts with states and local governments to improve addressing consistency and implementation.

### 2009 - Strategic Workshop on National Addressing

A major workshop with the theme "Addressing as a Strategic Infrastructure for National Development" helped align stakeholders around a unified national direction.

### 2012 - Draft Policy Submission

The National Addressing System Steering Committee submitted a draft National Addressing Policy to the Minister of Communication Technology in May 2012.

### 2013 - Federal Executive Council Approval

After broader stakeholder review, the Federal Executive Council approved the National Addressing Policy on November 27, 2013.

### 2014 - National Economic Council Adoption

The National Economic Council adopted the policy on November 20, 2014. This milestone underpins the operational foundation of the 6-digit postal code system used in Nigeria today.

## What This Means for Users Today

### 2014 to Present - From Policy to Practical Use

Nigeria now operates with location-specific 6-digit postal codes. The practical challenge for most users is no longer whether a code exists, but identifying the exact code for the correct street or neighborhood.

### Today - Why Postal Code Lookup Tools Matter

For deliveries, e-commerce checkouts, banking forms, and public-sector applications, accurate code selection remains critical. Modern lookup tools reduce error rates and make the national postal code system easier to use in daily life.
`;

const nipostPost: BlogPost = buildPost({
  id: '1',
  slug: 'nipost-mail-postal-services-nigeria',
  title: 'Nigerian Postal Service (NIPOST) - Complete Guide to Mail and Postal Services',
  excerpt: 'A comprehensive guide to NIPOST services in Nigeria, including mail types, delivery options, counter services, and how to use Nigeria zip postal codes effectively.',
  content: nipostServicesContent,
  author: {
    name: 'Postminer.com.ng Team',
    role: 'Editorial Team',
  },
  publishedAt: '2025-12-27',
  category: 'Postal Services',
  tags: ['NIPOST', 'Nigeria Postal Service', 'Mail Services', 'Nigeria Zip Postal Code', 'Postal Orders'],
});

const historyPost: BlogPost = buildPost({
  id: '2',
  slug: 'history-of-nigerian-postal-services',
  title: 'The History of Nigerian Postal Services and Addressing',
  excerpt: 'From 1852 to the national addressing policy era, this timeline explains how postal services and 6-digit postal codes evolved in Nigeria.',
  content: historyOfNigerianPostalServicesContent,
  author: {
    name: 'Postminer.com.ng Team',
    role: 'Editorial Team',
  },
  publishedAt: '2026-02-14',
  updatedAt: '2026-02-15',
  category: 'Postal History',
  tags: ['NIPOST History', 'Nigeria Postal History', 'Addressing Policy', 'Postal Codes'],
});

export const blogPosts: BlogPost[] = [nipostPost, historyPost];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}

export function getAllBlogPosts(): BlogPost[] {
  return [...blogPosts].sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}
