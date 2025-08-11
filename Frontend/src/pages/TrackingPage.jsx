import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DeliveryTracking from '../components/delivery/DeliveryTracking';
import MapboxDeliveryMap from '../components/delivery/MapboxDeliveryMap';

const TrackingPage = () => {
  const { trackingNumber } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [deliveryData, setDeliveryData] = useState(null);

  const handleTrackingDataUpdate = (data) => {
    setDeliveryData(data);
  };

  const getDeliveryRoute = () => {
    if (deliveryData?.tracking_info?.estimated_location && deliveryData?.tracking_info?.delivery_address?.coordinates) {
      return [
        [10.1815, 36.8065], // Tunis warehouse
        [deliveryData.tracking_info.estimated_location.lng, deliveryData.tracking_info.estimated_location.lat],
        [deliveryData.tracking_info.delivery_address.coordinates.lng, deliveryData.tracking_info.delivery_address.coordinates.lat]
      ];
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-4 font-medium transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-slate-800 bg-clip-text text-transparent mb-4">
            Suivi de Livraison
          </h1>
          <p className="text-slate-600 text-lg">
            Suivez votre commande en temps réel
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Composant de suivi */}
          <div>
            <DeliveryTracking 
              trackingNumber={trackingNumber}
              onTrackingUpdate={handleTrackingDataUpdate}
            />
          </div>

          {/* Carte avec position estimée */}
          <div>
            <MapboxDeliveryMap
              customerAddress={deliveryData?.tracking_info?.delivery_address}
              deliveryRoute={getDeliveryRoute()}
              showAddressSearch={false}
            />
            
            {/* Informations additionnelles */}
            {deliveryData && (
              <div className="mt-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4">
                  📞 Informations de contact
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold text-emerald-800">Service Client</p>
                      <p className="text-emerald-600">+216 XX XXX XXX</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold text-blue-800">Email Support</p>
                      <p className="text-blue-600">support@shopnow.tn</p>
                    </div>
                  </div>
                </div>

                {/* Actions rapides */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-200">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Chat en direct
                  </button>
                  
                  <button className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-blue-200">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Signaler un problème
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section FAQ ou instructions */}
        <div className="mt-12 bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">
            ❓ Questions Fréquentes
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-2">
                  🕐 Quand ma commande sera-t-elle livrée ?
                </h4>
                <p className="text-sm text-slate-600">
                  Les délais de livraison dépendent de votre zone géographique. 
                  Consultez les informations de suivi ci-dessus pour une estimation précise.
                </p>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-2">
                  📦 Comment modifier ma livraison ?
                </h4>
                <p className="text-sm text-slate-600">
                  Contactez notre service client avant l'expédition pour modifier 
                  l'adresse ou reporter la livraison.
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-2">
                  🚚 Que faire si personne n'est présent ?
                </h4>
                <p className="text-sm text-slate-600">
                  Le livreur tentera une nouvelle livraison ou laissera la commande 
                  dans un point de relais selon vos préférences.
                </p>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-2">
                  🔄 Puis-je retourner ma commande ?
                </h4>
                <p className="text-sm text-slate-600">
                  Oui, vous avez 14 jours pour retourner votre commande. 
                  Consultez nos conditions de retour pour plus d'informations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;
