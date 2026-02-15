import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const stateMapData = [
  { id: 'abia', name: 'Abia', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Abia.jpg' },
  { id: 'adamawa', name: 'Adamawa', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Adamawa.jpg' },
  { id: 'akwa-ibom', name: 'Akwa Ibom', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Akwa_Ibom.jpg' },
  { id: 'anambra', name: 'Anambra', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Anambra.jpg' },
  { id: 'bauchi', name: 'Bauchi', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Bauchi.jpg' },
  { id: 'bayelsa', name: 'Bayelsa', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Bayelsa.jpg' },
  { id: 'benue', name: 'Benue', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/benue.jpg' },
  { id: 'borno', name: 'Borno', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/BORNO.jpg' },
  { id: 'cross-river', name: 'Cross River', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/cross_river.jpg' },
  { id: 'delta', name: 'Delta', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/DELTA.jpg' },
  { id: 'ebonyi', name: 'Ebonyi', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/EBONYI.jpg' },
  { id: 'edo', name: 'Edo', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/EDO.jpg' },
  { id: 'ekiti', name: 'Ekiti', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/ekiti.jpg' },
  { id: 'enugu', name: 'Enugu', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/ENUGU.jpg' },
  { id: 'fct', name: 'Federal Capital Territory (FCT)', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/FCT-Abuja.jpg' },
  { id: 'gombe', name: 'Gombe', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Gombe.jpg' },
  { id: 'imo', name: 'Imo', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/IMO.jpg' },
  { id: 'jigawa', name: 'Jigawa', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/JIgawa.jpg' },
  { id: 'kaduna', name: 'Kaduna', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Kaduna.jpg' },
  { id: 'kano', name: 'Kano', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Kano.jpg' },
  { id: 'katsina', name: 'Katsina', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/KATSINA.jpg' },
  { id: 'kebbi', name: 'Kebbi', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Kebbi.jpg' },
  { id: 'kogi', name: 'Kogi', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Kogi.jpg' },
  { id: 'kwara', name: 'Kwara', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Kwara.jpg' },
  { id: 'lagos', name: 'Lagos', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Lagos.jpg' },
  { id: 'nasarawa', name: 'Nasarawa', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Nassarawa.jpg' },
  { id: 'niger', name: 'Niger', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/NIGER.jpg' },
  { id: 'ogun', name: 'Ogun', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Ogun.jpg' },
  { id: 'ondo', name: 'Ondo', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Ondo.jpg' },
  { id: 'osun', name: 'Osun', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Osun.jpg' },
  { id: 'oyo', name: 'Oyo', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Oyo.jpg' },
  { id: 'plateau', name: 'Plateau', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/plateau.jpg' },
  { id: 'rivers', name: 'Rivers', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Rivers.jpg' },
  { id: 'sokoto', name: 'Sokoto', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/SOKOTO.jpg' },
  { id: 'taraba', name: 'Taraba', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/taraba.jpg' },
  { id: 'yobe', name: 'Yobe', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/aYOBE.jpg' },
  { id: 'zamfara', name: 'Zamfara', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/YOBE2.jpg' },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stateId = searchParams.get('state');

  if (stateId) {
    const state = stateMapData.find((s) => s.id === stateId);
    if (!state) {
      return NextResponse.json(
        { error: 'not_found', message: 'State not found.' },
        { status: 404 }
      );
    }
    return NextResponse.json({ id: state.id, name: state.name, mapUrl: state.mapUrl });
  }

  return NextResponse.json({
    states: stateMapData.map((s) => ({ id: s.id, name: s.name })),
  });
}
