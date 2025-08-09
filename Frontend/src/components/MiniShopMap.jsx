import { useEffect, useRef, useState } from 'react';

/**
 * MiniShopMap
 * Lightweight, read-only Mapbox map showing a single shop marker.
 * Lazy-loads mapbox-gl only if a valid lat/lng are provided.
 * Falls back to a static placeholder if Mapbox token missing.
 */
export default function MiniShopMap({ latitude, longitude, name }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      if (!token) { setError('Token Mapbox manquant'); return; }
      if (latitude == null || longitude == null) return;
      try {
        const mod = await import('mapbox-gl');
        await import('mapbox-gl/dist/mapbox-gl.css');
        if (cancelled) return;
        mod.default.accessToken = token;
        mapRef.current = new mod.default.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: [longitude, latitude],
          zoom: 13,
          attributionControl: false
        });
        mapRef.current.on('load', () => {
          if (cancelled) return;
            new mod.default.Marker({ color: '#10B981' })
              .setLngLat([longitude, latitude])
              .setPopup(new mod.default.Popup({ offset: 18 }).setHTML(`<div style="font-size:12px">${name || 'Shop'}</div>`))
              .addTo(mapRef.current);
            setLoaded(true);
        });
      } catch (e) {
        console.error('Mini map error', e);
        setError('Carte indisponible');
      }
    };
    init();
    return () => { cancelled = true; if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, [latitude, longitude, token, name]);

  if (!latitude || !longitude) {
    return <div className="w-full h-48 flex items-center justify-center text-xs text-slate-500 bg-slate-100 rounded-xl">Localisation non fournie</div>;
  }
  if (!token) {
    return <div className="w-full h-48 flex flex-col items-center justify-center text-xs text-slate-600 bg-slate-100 rounded-xl">
      <span>Mapbox token manquant</span>
      <span className='font-mono mt-1'>{latitude}, {longitude}</span>
    </div>;
  }
  return (
    <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
      <div ref={mapContainer} className="w-full h-full" />
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-6 h-6 mb-2 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-[11px] text-slate-600">Chargement...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-red-600">{error}</div>
      )}
    </div>
  );
}
