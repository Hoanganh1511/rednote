import { NextRequest, NextResponse } from 'next/server';

const NOMINATIM = 'https://nominatim.openstreetmap.org/reverse';

function clampLatLon(lat: number, lon: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

/** Reverse geocode: Mapbox (nếu có token server) hoặc Nominatim. */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const latRaw = request.nextUrl.searchParams.get('lat');
  const lonRaw = request.nextUrl.searchParams.get('lon');
  const lat = latRaw === null ? NaN : Number(latRaw);
  const lon = lonRaw === null ? NaN : Number(lonRaw);
  if (!clampLatLon(lat, lon)) {
    return NextResponse.json({ error: 'invalid_coordinates' }, { status: 400 });
  }

  const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
  if (mapboxToken) {
    try {
      const url = new URL(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json`,
      );
      url.searchParams.set('access_token', mapboxToken);
      url.searchParams.set('limit', '1');
      url.searchParams.set('language', 'vi');
      const mb = await fetch(url.toString(), { next: { revalidate: 0 } });
      if (mb.ok) {
        const data = (await mb.json()) as { features?: { place_name?: string }[] };
        const place = data.features?.[0]?.place_name?.trim();
        if (place) {
          return NextResponse.json({ displayName: place.slice(0, 500) });
        }
      }
    } catch {
      // fallback nominatim
    }
  }

  try {
    const url = new URL(NOMINATIM);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lon));
    url.searchParams.set('accept-language', 'vi,en');
    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'RedNote/1.0 (geocode reverse; creator upload)',
      },
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'geocode_upstream' }, { status: 502 });
    }
    const data = (await res.json()) as { display_name?: string };
    const displayName = (data.display_name ?? '').trim();
    return NextResponse.json({ displayName: displayName.slice(0, 500) });
  } catch {
    return NextResponse.json({ error: 'geocode_failed' }, { status: 502 });
  }
}
