import React, { useState } from 'react';

const SimpleDeliveryMap = ({ 
  customerAddress = null,
  shippingInfo = null, // Ajout des informations du formulaire
  customLocation = null, // Nouvelle prop pour location personnalisée
  onAddressSelect = null,
  showAddressSearch = false 
}) => {
  const [searchAddress, setSearchAddress] = useState('');
  
  // Obtenir les coordonnées basées sur customLocation, puis informations de livraison
  const currentCoordinates = customLocation ? 
    { lat: customLocation.coordinates[1], lng: customLocation.coordinates[0] } :
    (shippingInfo && shippingInfo.city ? 
      getCityCoordinates(shippingInfo.city, shippingInfo.country) : 
      null);

  const handleAddressSelect = (address) => {
    setSearchAddress(address);
    
    if (onAddressSelect) {
      onAddressSelect({
        address: address,
        city: address.split(', ')[1],
        country: 'TN',
        coordinates: { lat: 36.8065, lng: 10.1815 } // Coordonnées par défaut pour Tunis
      });
    }
  };

  // Fonction pour obtenir les coordonnées approximatives basées sur la ville/gouvernorat
  const getCityCoordinates = (city, country) => {
    // Coordonnées des 24 gouvernorats de la Tunisie
    const tunisianGovernorates = {
      // Grand Tunis
      'tunis': { lat: 36.8065, lng: 10.1815 },
      'ariana': { lat: 36.8625, lng: 10.1647 },
      'ben arous': { lat: 36.7540, lng: 10.2277 },
      'manouba': { lat: 36.8090, lng: 10.0982 },
      
      // Nord
      'bizerte': { lat: 37.2744, lng: 9.8739 },
      'beja': { lat: 36.7256, lng: 9.1817 },
      'jendouba': { lat: 36.5014, lng: 8.7803 },
      'le kef': { lat: 36.1699, lng: 8.7048 },
      'siliana': { lat: 36.0836, lng: 9.3706 },
      
      // Nord-Ouest
      'zaghouan': { lat: 36.4028, lng: 10.1425 },
      'nabeul': { lat: 36.4560, lng: 10.7376 },
      
      // Centre
      'sousse': { lat: 35.8256, lng: 10.6369 },
      'monastir': { lat: 35.7643, lng: 10.8113 },
      'mahdia': { lat: 35.5047, lng: 11.0624 },
      'kairouan': { lat: 35.6781, lng: 10.0963 },
      'kasserine': { lat: 35.1674, lng: 8.8363 },
      'sidi bouzid': { lat: 35.0381, lng: 9.4858 },
      
      // Sud
      'sfax': { lat: 34.7406, lng: 10.7603 },
      'gabes': { lat: 33.8815, lng: 10.0982 },
      'medenine': { lat: 33.3548, lng: 10.5055 },
      'tataouine': { lat: 32.9297, lng: 10.4517 },
      'gafsa': { lat: 34.4251, lng: 8.7842 },
      'tozeur': { lat: 33.9194, lng: 8.1335 },
      'kebili': { lat: 33.7049, lng: 8.9690 }
    };
    
    if (country === 'TN' && city) {
      const cityKey = city.toLowerCase().trim();
      return tunisianGovernorates[cityKey] || { lat: 36.8065, lng: 10.1815 };
    }
    
    return { lat: 36.8065, lng: 10.1815 }; // Coordonnées par défaut (Tunis)
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
      <div className="p-4 border-b border-white/20">
        <h3 className="text-xl font-bold text-slate-800 flex items-center">
          🗺️ Sélection d'adresse
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          {shippingInfo && shippingInfo.address ? 
            `Adresse du formulaire: ${shippingInfo.city}, ${shippingInfo.country}` : 
            'Saisissez votre adresse dans le formulaire ci-dessus'
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
                La carte utilise automatiquement l'adresse du formulaire de livraison ci-dessus.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Zone de carte simulée avec marker */}
      <div className="relative h-64 bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center overflow-hidden">
        {/* Grille de fond pour simuler une carte */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 grid-rows-8 h-full">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="border border-slate-300"></div>
            ))}
          </div>
        </div>

        {/* Marker de localisation */}
        {shippingInfo && shippingInfo.city && currentCoordinates && (
          <div className="absolute animate-bounce z-10" style={{
            top: '30%',
            left: '45%',
            transform: 'translate(-50%, -50%)'
          }}>
            <div className="relative">
              <div className="w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white px-2 py-1 rounded shadow-md text-xs font-medium text-slate-800 whitespace-nowrap">
                {shippingInfo.city}
              </div>
            </div>
          </div>
        )}

        <div className="text-center z-5">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            {customLocation ? 'Notre Localisation' : 'Carte de livraison'}
          </h3>
          <p className="text-slate-600 max-w-sm">
            {customLocation ? 
              `Vous pouvez nous trouver à ${customLocation.address}` :
              (shippingInfo && shippingInfo.address ? 
                `Livraison vers ${shippingInfo.city}, ${shippingInfo.country}` : 
                'Remplissez le formulaire de livraison pour voir votre localisation')
            }
          </p>
          {customLocation ? (
            <div className="mt-4 p-3 bg-white/90 backdrop-blur-sm rounded-lg inline-block max-w-xs">
              <div className="flex items-center text-sm text-slate-700">
                <span className="mr-2">📍</span>
                <div className="text-left">
                  <div className="font-medium">{customLocation.address}</div>
                  <div className="text-xs text-slate-500">Coordonnées: {customLocation.coordinates[1].toFixed(4)}, {customLocation.coordinates[0].toFixed(4)}</div>
                </div>
              </div>
            </div>
          ) : (
            shippingInfo && shippingInfo.address && (
              <div className="mt-4 p-3 bg-white/90 backdrop-blur-sm rounded-lg inline-block max-w-xs">
                <div className="flex items-center text-sm text-slate-700">
                  <span className="mr-2">📍</span>
                  <div className="text-left">
                    <div className="font-medium">{shippingInfo.address}</div>
                    <div className="text-xs text-slate-500">{shippingInfo.city}, {shippingInfo.state}</div>
                    <div className="text-xs text-slate-500">{shippingInfo.postalCode}, {shippingInfo.country}</div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Légende */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-white/20">
          <div className="space-y-2 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2 border border-white"></div>
              <span className="text-slate-700">Votre adresse</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
              <span className="text-slate-700">Zones de livraison</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-slate-700">Entrepôt ShopNow</span>
            </div>
          </div>
        </div>

        {/* Coordonnées pour debug (dev only) */}
        {process.env.NODE_ENV === 'development' && currentCoordinates && (
          <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {currentCoordinates.lat.toFixed(4)}, {currentCoordinates.lng.toFixed(4)}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleDeliveryMap;
