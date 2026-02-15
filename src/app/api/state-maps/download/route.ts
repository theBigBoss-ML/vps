import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const stateMapUrls: Record<string, string> = {
  'abia': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Abia.jpg',
  'adamawa': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Adamawa.jpg',
  'akwa-ibom': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Akwa_Ibom.jpg',
  'anambra': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Anambra.jpg',
  'bauchi': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Bauchi.jpg',
  'bayelsa': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Bayelsa.jpg',
  'benue': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/benue.jpg',
  'borno': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/BORNO.jpg',
  'cross-river': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/cross_river.jpg',
  'delta': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/DELTA.jpg',
  'ebonyi': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/EBONYI.jpg',
  'edo': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/EDO.jpg',
  'ekiti': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/ekiti.jpg',
  'enugu': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/ENUGU.jpg',
  'fct': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/FCT-Abuja.jpg',
  'gombe': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Gombe.jpg',
  'imo': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/IMO.jpg',
  'jigawa': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/JIgawa.jpg',
  'kaduna': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Kaduna.jpg',
  'kano': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Kano.jpg',
  'katsina': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/KATSINA.jpg',
  'kebbi': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Kebbi.jpg',
  'kogi': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Kogi.jpg',
  'kwara': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Kwara.jpg',
  'lagos': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Lagos.jpg',
  'nasarawa': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Nassarawa.jpg',
  'niger': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/NIGER.jpg',
  'ogun': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Ogun.jpg',
  'ondo': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Ondo.jpg',
  'osun': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Osun.jpg',
  'oyo': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Oyo.jpg',
  'plateau': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/plateau.jpg',
  'rivers': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Rivers.jpg',
  'sokoto': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/SOKOTO.jpg',
  'taraba': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/taraba.jpg',
  'yobe': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/aYOBE.jpg',
  'zamfara': 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/YOBE2.jpg',
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stateId = searchParams.get('state');

  if (!stateId || !stateMapUrls[stateId]) {
    return NextResponse.json(
      { error: 'not_found', message: 'State not found.' },
      { status: 404 }
    );
  }

  try {
    const response = await fetch(stateMapUrls[stateId]);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'fetch_failed', message: 'Failed to fetch map image.' },
        { status: 502 }
      );
    }

    const blob = await response.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${stateId}-postal-map.jpg"`,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'server_error', message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
