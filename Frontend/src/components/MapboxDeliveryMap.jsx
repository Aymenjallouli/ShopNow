import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapboxDeliveryMap = ({ 
  customerAddress = null, 
  shippingInfo = null, // Ajout des informations du formulaire
  warehouseLocation = { lat: 36.8065, lng: 10.1815 }, // Tunis par défaut
  onAddressSelect = null,
  showAddressSearch = false,
  deliveryRoute = null 
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(warehouseLocation.lng);
  const [lat, setLat] = useState(warehouseLocation.lat);
  const [zoom, setZoom] = useState(12);
  const [searchAddress, setSearchAddress] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);

  // Configuration Mapbox
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  // Vérifier si le token Mapbox est présent
  if (!mapboxgl.accessToken) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="text-center py-8">
          <div className="text-red-500 text-4xl mb-4">🗺️</div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Carte non disponible</h3>
          <p className="text-slate-600">Le token Mapbox n'est pas configuré.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (!mapboxgl.accessToken) {
      setMapError('Token Mapbox manquant');
      return;
    }
    if (!mapContainer.current) {
      console.warn('Map container not ready');
      return;
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [lng, lat],
        zoom: zoom
      });

      map.current.on('load', () => {
        setMapLoaded(true);
        
        // Ajouter un marqueur pour l'entrepôt après le chargement
        new mapboxgl.Marker({ color: '#10B981' })
          .setLngLat([warehouseLocation.lng, warehouseLocation.lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('<h3>🏭 Entrepôt ShopNow</h3><p>Point de départ des livraisons</p>'))
          .addTo(map.current);
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

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Effet pour mettre à jour la carte quand les informations du formulaire changent
  useEffect(() => {
    if (shippingInfo && shippingInfo.address && shippingInfo.city && map.current && mapLoaded) {
      // Géocoder l'adresse du formulaire
      geocodeShippingAddress();
    }
  }, [shippingInfo, mapLoaded]);

  // Géocoder l'adresse depuis les informations du formulaire
  const geocodeShippingAddress = async () => {
    if (!shippingInfo.address || !shippingInfo.city) return;

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
        } catch (error) {
          console.error('Error adding customer marker:', error);
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  // Ajouter la route de livraison
  useEffect(() => {
    if (deliveryRoute && map.current && mapLoaded && map.current.isStyleLoaded()) {
      try {
        // Supprimer l'ancienne route
        if (map.current.getSource('route')) {
          map.current.removeLayer('route');
          map.current.removeSource('route');
        }

        // Ajouter la nouvelle route
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: deliveryRoute
            }
          }
        });

        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#10B981',
            'line-width': 4,
            'line-opacity': 0.8
          }
        });
      } catch (error) {
        console.error('Error adding delivery route:', error);
      }
    }
  }, [deliveryRoute, mapLoaded]);

  // Recherche d'adresse avec Mapbox Geocoding
  const searchAddresses = async (query) => {
    if (!query || query.length < 3) {
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
    
    // Centrer la carte sur l'adresse sélectionnée
    if (map.current && mapLoaded) {
      try {
        map.current.flyTo({ center: [lng, lat], zoom: 15 });
      } catch (error) {
        console.error('Error flying to address:', error);
      }
    }

    if (onAddressSelect) {
      onAddressSelect(address);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
      <div className="p-4 border-b border-white/20">
        <h3 className="text-xl font-bold text-slate-800 flex items-center">
          🗺️ Carte de Livraison
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          {shippingInfo && shippingInfo.address ? 
            `Livraison vers: ${shippingInfo.city}, ${shippingInfo.country}` : 
            'Saisissez votre adresse dans le formulaire ci-dessus'
          }
        </p>
      </div>

      {/* Barre de recherche d'adresse - Désactivée car on utilise le formulaire */}
      {showAddressSearch && false && (
        <div className="p-4 border-b border-white/20">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher une adresse en Tunisie..."
              value={searchAddress}
              onChange={(e) => {
                setSearchAddress(e.target.value);
                searchAddresses(e.target.value);
              }}
              className="w-full px-4 py-3 pl-10 pr-4 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-emerald-500 rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>

            {/* Résultats de recherche */}
            {searchResults.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleAddressSelect(result)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors duration-200"
                  >
                    <div className="font-medium text-slate-800">{result.text}</div>
                    <div className="text-sm text-slate-600">{result.place_name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conteneur de la carte */}
      <div className="relative">
        {mapError ? (
          <div className="h-96 w-full flex items-center justify-center bg-slate-100 rounded-lg">
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Erreur de carte</h3>
              <p className="text-slate-600">{mapError}</p>
            </div>
          </div>
        ) : (
          <div>
            <div ref={mapContainer} className="h-96 w-full rounded-lg" />
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100 rounded-lg">
                <div className="text-center">
                  <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-600">Chargement de la carte...</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Légende */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-white/20">
          <div className="space-y-2 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
              <span className="text-slate-700">Entrepôt ShopNow</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-slate-700">Adresse de livraison</span>
            </div>
            {deliveryRoute && (
              <div className="flex items-center">
                <div className="w-3 h-1 bg-emerald-500 mr-2"></div>
                <span className="text-slate-700">Route de livraison</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapboxDeliveryMap;
