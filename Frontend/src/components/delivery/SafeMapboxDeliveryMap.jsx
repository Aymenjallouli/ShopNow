import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const SafeMapboxDeliveryMap = ({ 
  customerAddress = null, 
  shippingInfo = null, // Ajout des informations du formulaire
  warehouseLocation = { lat: 36.8065, lng: 10.1815 }, // Tunis par défaut
  customLocation = null, // Nouvelle prop pour location personnalisée
  onAddressSelect = null,
  showAddressSearch = false,
  deliveryRoute = null 
}) => {
  const { t } = useTranslation();
  const mapContainer = useRef(null);
  const map = useRef(null);
  // Utiliser customLocation si fournie, sinon warehouseLocation
  const targetLocation = customLocation ? 
    { lat: customLocation.coordinates[1], lng: customLocation.coordinates[0] } : 
    warehouseLocation;
  const [lng, setLng] = useState(targetLocation.lng);
  const [lat, setLat] = useState(targetLocation.lat);
  const [zoom, setZoom] = useState(customLocation ? 15 : 12);
  const [searchAddress, setSearchAddress] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [mapboxgl, setMapboxgl] = useState(null);

  // Charger Mapbox dynamiquement
  useEffect(() => {
    const loadMapbox = async () => {
      try {
        const mapboxModule = await import('mapbox-gl');
        const mapboxCss = await import('mapbox-gl/dist/mapbox-gl.css');
        
        const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
        if (!token) {
          setMapError('Token Mapbox manquant');
          return;
        }
        
        mapboxModule.default.accessToken = token;
        setMapboxgl(mapboxModule.default);
      } catch (error) {
        console.error('Failed to load Mapbox:', error);
        setMapError('Impossible de charger Mapbox');
      }
    };

    loadMapbox();
  }, []);

  // Initialiser la carte une fois Mapbox chargé
  useEffect(() => {
    if (!mapboxgl || map.current || !mapContainer.current) return;

    const initMap = () => {
      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: [lng, lat],
          zoom: zoom
        });

        map.current.on('load', () => {
          setMapLoaded(true);
          
          // Ajouter un marqueur pour la location (customLocation ou warehouse)
          if (map.current) {
            const markerLocation = customLocation ? customLocation.coordinates : [warehouseLocation.lng, warehouseLocation.lat];
            const popupContent = customLocation ? 
              `<h3>📍 ${customLocation.address}</h3><p>Notre emplacement</p>` : 
              '<h3>🏭 Entrepôt ShopNow</h3><p>Point de départ des livraisons</p>';
            
            new mapboxgl.Marker({ color: '#10B981' })
              .setLngLat(markerLocation)
              .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent))
              .addTo(map.current);
          }
        });

        map.current.on('error', (e) => {
          console.error('Mapbox error:', e);
          setMapError('Erreur de chargement de la carte');
        });

        // Ajouter les contrôles de navigation
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Mettre à jour les coordonnées en temps réel
        map.current.on('move', () => {
          if (map.current) {
            setLng(map.current.getCenter().lng.toFixed(4));
            setLat(map.current.getCenter().lat.toFixed(4));
            setZoom(map.current.getZoom().toFixed(2));
          }
        });
      } catch (error) {
        console.error('Error initializing Mapbox:', error);
        setMapError(`Erreur d'initialisation: ${error.message}`);
      }
    };

    // Délai pour s'assurer que le DOM est prêt
    const timeoutId = setTimeout(initMap, 100);
    return () => clearTimeout(timeoutId);
  }, [mapboxgl, lng, lat, zoom, customLocation, warehouseLocation]);

  // Nettoyage
  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Géocoder l'adresse du formulaire quand elle change
  useEffect(() => {
    if (mapLoaded && shippingInfo && shippingInfo.address && shippingInfo.city) {
      geocodeShippingAddress();
    }
  }, [shippingInfo, mapLoaded]);

  // Géocoder l'adresse depuis les informations du formulaire
  const geocodeShippingAddress = async () => {
    if (!shippingInfo.address || !shippingInfo.city || !mapboxgl) return;

    const fullAddress = `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.country}`;
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fullAddress)}.json?access_token=${mapboxgl.accessToken}&country=tn&limit=1`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        
        // Supprimer les anciens marqueurs clients
        const existingMarkers = document.querySelectorAll('.customer-marker');
        existingMarkers.forEach(marker => marker.remove());

        // Ajouter nouveau marqueur client
        try {
          const customerMarker = new mapboxgl.Marker({ 
            color: '#EF4444',
            className: 'customer-marker'
          })
            .setLngLat([lng, lat])
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <h3>📍 Adresse de livraison</h3>
              <p>${shippingInfo.address}</p>
              <p>${shippingInfo.city}, ${shippingInfo.country}</p>
            `))
            .addTo(map.current);

          // Centrer la carte pour voir les deux points
          const bounds = new mapboxgl.LngLatBounds();
          bounds.extend([warehouseLocation.lng, warehouseLocation.lat]);
          bounds.extend([lng, lat]);
          map.current.fitBounds(bounds, { padding: 50 });

          // Notifier le parent avec les coordonnées (sans modifier l'adresse)
          if (onAddressSelect) {
            onAddressSelect({
              address: shippingInfo.address, // Utiliser l'adresse originale sans modification
              city: shippingInfo.city,
              country: shippingInfo.country,
              coordinates: { lat, lng }
            });
          }
        } catch (markerError) {
          console.error('Error adding marker:', markerError);
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  // Recherche d'adresse avec Mapbox Geocoding
  const searchAddresses = async (query) => {
    if (!query || query.length < 3 || !mapboxgl) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}&country=tn&limit=5`
      );
      const data = await response.json();
      
      if (data.features) {
        setSearchResults(data.features);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = (feature) => {
    const [lng, lat] = feature.center;
    const address = {
      address: feature.place_name,
      coordinates: { lat, lng },
      city: feature.context?.find(c => c.id.includes('place'))?.text || '',
      country: 'TN'
    };

    setSearchAddress(feature.place_name);
    setSearchResults([]);
    
    if (onAddressSelect) {
      onAddressSelect(address);
    }
  };

  if (!mapboxgl && !mapError) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">{t('delivery.loadingMapbox', 'Chargement de Mapbox...')}</p>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="text-center py-8">
          <div className="text-red-500 text-4xl mb-4">🗺️</div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">{t('delivery.mapUnavailable', 'Carte non disponible')}</h3>
          <p className="text-slate-600">{mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
      <div className="p-4 border-b border-white/20">
        <h3 className="text-xl font-bold text-slate-800 flex items-center">
          🗺️ {t('delivery.mapTitle', 'Carte de Livraison')}
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          {shippingInfo && shippingInfo.address ? 
            t('delivery.formAddress', { city: shippingInfo.city, country: shippingInfo.country, defaultValue: 'Adresse du formulaire: {{city}}, {{country}}' }) : 
            t('delivery.enterAddressAbove', 'Saisissez votre adresse dans le formulaire ci-dessus')
          }
        </p>
      </div>

      {/* Barre de recherche d'adresse - Désactivée car on utilise les données du formulaire */}
      {showAddressSearch && (
        <div className="p-4 border-b border-white/20">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-blue-800 text-sm">
                {t('delivery.mapUsesFormAddress', "La carte utilise automatiquement l'adresse du formulaire de livraison ci-dessus.")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Conteneur de la carte */}
      <div className="relative">
        <div ref={mapContainer} className="h-96 w-full rounded-lg" />
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 rounded-lg">
            <div className="text-center">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">{t('delivery.initializingMap', 'Initialisation de la carte...')}</p>
            </div>
          </div>
        )}
        
        {/* Légende */}
        {mapLoaded && (
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-white/20">
            <div className="space-y-2 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                <span className="text-slate-700">{t('delivery.warehouse', 'Entrepôt ShopNow')}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-slate-700">{t('delivery.customerAddress', 'Adresse de livraison')}</span>
              </div>
              {deliveryRoute && (
                <div className="flex items-center">
                  <div className="w-3 h-1 bg-emerald-500 mr-2"></div>
                  <span className="text-slate-700">{t('delivery.deliveryRoute', 'Route de livraison')}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SafeMapboxDeliveryMap;
