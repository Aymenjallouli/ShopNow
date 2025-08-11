import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * ShopLocationPicker
 * Professional map-based location picker for shop owners.
 * - Click on map to set location (marker)
 * - Search address (Mapbox Geocoding)
 * - Reverse geocode on click to retrieve address & city
 * Props:
 *  value: { address, city, country, coordinates: { lat, lng } }
 *  onChange: fn(locationObject | null)
 *  height: map height (default 320)
 */
const ShopLocationPicker = ({ value=null, onChange, height=320 }) => {
  const { t } = useTranslation();
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapboxRef = useRef(null);
  const [loadingMap, setLoadingMap] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  // Lazy load mapbox
  useEffect(()=>{
    const init = async()=>{
      if(!token){ setError('Mapbox token manquant'); return; }
      try {
        const mod = await import('mapbox-gl');
        await import('mapbox-gl/dist/mapbox-gl.css');
        mod.default.accessToken = token;
        mapboxRef.current = mod.default;
        const center = value ? [value.coordinates.lng, value.coordinates.lat] : [10.1815, 36.8065]; // Tunis
        mapRef.current = new mapboxRef.current.Map({
          container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center,
            zoom: value ? 14 : 11
        });
        mapRef.current.addControl(new mapboxRef.current.NavigationControl(), 'top-right');
        mapRef.current.on('load', ()=>{ setLoadingMap(false); if(value) placeMarker(center[0], center[1], value.address); });
        mapRef.current.on('click', (e)=> handleMapClick(e.lngLat.lng, e.lngLat.lat));
      } catch(e){ console.error(e); setError("Échec de chargement de la carte"); }
    };
    init();
    return ()=>{ if(mapRef.current){ mapRef.current.remove(); mapRef.current=null; } };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const placeMarker = (lng, lat, popupText='Position sélectionnée') => {
    if(!mapboxRef.current || !mapRef.current) return;
    if(markerRef.current){ markerRef.current.remove(); }
    markerRef.current = new mapboxRef.current.Marker({ color:'#10B981' })
      .setLngLat([lng, lat])
      .setPopup(new mapboxRef.current.Popup({ offset: 24 }).setHTML(`<div style='font-size:12px'>${popupText}</div>`))
      .addTo(mapRef.current);
  };

  const reverseGeocode = async(lng, lat) => {
    try {
      const resp = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&types=address,place&limit=1`);
      const data = await resp.json();
      if(data.features && data.features[0]){
        const f = data.features[0];
        const city = f.context?.find(c=>c.id.startsWith('place'))?.text || f.text || '';
        return {
          address: f.place_name,
          city,
          country: 'TN',
          coordinates: { lat, lng }
        };
      }
    } catch(e){ console.error('Reverse geocode error', e); }
    return {
      address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      city: '',
      country: 'TN',
      coordinates: { lat, lng }
    };
  };

  const handleMapClick = async(lng, lat) => {
    placeMarker(lng, lat, 'Nouvelle position');
    const loc = await reverseGeocode(lng, lat);
    if(onChange) onChange(loc);
  };

  const search = useCallback(async(q)=>{
    if(!q || q.length < 3){ setResults([]); return; }
    setSearchLoading(true);
    try {
      const resp = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${token}&country=tn&limit=5`);
      const data = await resp.json();
      setResults(data.features || []);
    } catch(e){ console.error('Search error', e); }
    finally{ setSearchLoading(false); }
  }, [token]);

  // debounce
  useEffect(()=>{
    const t = setTimeout(()=> search(query), 450);
    return ()=> clearTimeout(t);
  },[query, search]);
  const selectResult = (feature) => {
    const [lng, lat] = feature.center;
    placeMarker(lng, lat, feature.text);
    if(mapRef.current){ mapRef.current.flyTo({ center:[lng, lat], zoom:14 }); }
    const city = feature.context?.find(c=>c.id.startsWith('place'))?.text || feature.text || '';
    const loc = {
      address: feature.place_name,
      city,
      country: 'TN',
      coordinates: { lat, lng }
    };
    if(onChange) onChange(loc);
    setResults([]);
    setQuery(feature.place_name);
  };

  const clearLocation = () => { if(onChange) onChange(null); if(markerRef.current){ markerRef.current.remove(); markerRef.current=null; } };

  return (
    <div className='space-y-4'>
      <div className='relative group'>
  <label className='text-xs font-medium text-slate-500 mb-1 block tracking-wide'>{t('delivery.addressSearch', "Recherche d'adresse")}</label>
        <div className='flex items-center gap-2'>
          <div className='flex-1 relative'>
            <input
              type='text'
              className='w-full rounded-xl border border-slate-200 bg-white/90 backdrop-blur p-3 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner'
              placeholder={t('delivery.streetCityPlaceholder', 'Rue, ville...')}
              value={query}
              onChange={e=> setQuery(e.target.value)}
            />
            {searchLoading && <div className='absolute top-1/2 -translate-y-1/2 right-3 animate-spin w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full'></div>}
          </div>
          {query && (
            <button type='button' onClick={()=>{setQuery(''); setResults([]);}} className='text-xs px-3 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700'>{t('delivery.clear', 'Effacer')}</button>
          )}
        </div>
        {results.length > 0 && (
          <ul className='absolute left-0 right-0 top-full mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-2xl max-h-72 overflow-auto text-sm z-50 ring-1 ring-emerald-100 divide-y divide-slate-100'>
            {results.map(r=> (
              <li key={r.id} onClick={()=>selectResult(r)} className='px-3 py-2 cursor-pointer transition-colors text-slate-700 hover:bg-emerald-600 hover:text-white'>
                <div className='font-medium text-[13px]'>{r.text}</div>
                <div className='text-[11px] text-slate-500 group-hover:text-white/80 truncate'>{r.place_name}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className='relative'>
  {error && <div className='text-red-600 text-sm mb-2'>{error}</div>}
        <div ref={mapContainer} style={{height}} className='w-full rounded-2xl overflow-hidden border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200 shadow-inner' />
        {loadingMap && (
          <div className='absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm'>
            <div className='text-center'>
              <div className='w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2'></div>
              <p className='text-xs text-slate-600'>{t('delivery.loadingMap', 'Chargement de la carte...')}</p>
            </div>
          </div>
        )}
      </div>
      <div className='flex items-start justify-between gap-3'>
        <div className='text-xs text-slate-600 flex-1'>
          {value ? (
            <div className='space-y-1'>
              <p className='font-medium text-slate-700'>{t('delivery.selectedAddress', 'Adresse sélectionnée:')}</p>
              <p className='truncate text-slate-700'>{value.address}</p>
              <div className='flex gap-4 text-slate-500'>
                <span>{t('delivery.lat', 'Lat')}: {value.coordinates.lat.toFixed(5)}</span>
                <span>{t('delivery.lng', 'Lng')}: {value.coordinates.lng.toFixed(5)}</span>
              </div>
            </div>
          ) : t('delivery.clickOrSearchToSelect', 'Cliquez sur la carte ou utilisez la recherche pour sélectionner la localisation.')}
        </div>
  {value && <button type='button' onClick={clearLocation} className='text-xs px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'>{t('delivery.remove', 'Retirer')}</button>}
      </div>
    </div>
  );
};

export default ShopLocationPicker;
