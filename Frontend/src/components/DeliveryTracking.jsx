import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const DeliveryTracking = ({ trackingNumber, orderId = null }) => {
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputTracking, setInputTracking] = useState(trackingNumber || '');
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (trackingNumber) {
      fetchTrackingInfo(trackingNumber);
    }
  }, [trackingNumber]);

  const fetchTrackingInfo = async (tracking) => {
    if (!tracking) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/delivery/track/${tracking}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTrackingInfo(data);
      } else {
        setError(data.error || 'Numéro de suivi introuvable');
      }
    } catch (err) {
      console.error('Tracking error:', err);
      setError('Erreur de connexion lors du suivi');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (inputTracking.trim()) {
      fetchTrackingInfo(inputTracking.trim());
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': '📦',
      'confirmed': '✅',
      'preparing': '🔄',
      'shipped': '🚚',
      'in_transit': '🛣️',
      'out_for_delivery': '🚛',
      'delivered': '✅',
      'cancelled': '❌',
      'returned': '↩️'
    };
    return icons[status] || '📋';
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'confirmed': 'text-blue-600 bg-blue-50 border-blue-200',
      'preparing': 'text-orange-600 bg-orange-50 border-orange-200',
      'shipped': 'text-purple-600 bg-purple-50 border-purple-200',
      'in_transit': 'text-indigo-600 bg-indigo-50 border-indigo-200',
      'out_for_delivery': 'text-emerald-600 bg-emerald-50 border-emerald-200',
      'delivered': 'text-green-600 bg-green-50 border-green-200',
      'cancelled': 'text-red-600 bg-red-50 border-red-200',
      'returned': 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getStatusText = (status) => {
    const texts = {
      'pending': 'En attente',
      'confirmed': 'Confirmée',
      'preparing': 'En préparation',
      'shipped': 'Expédiée',
      'in_transit': 'En transit',
      'out_for_delivery': 'En cours de livraison',
      'delivered': 'Livrée',
      'cancelled': 'Annulée',
      'returned': 'Retournée'
    };
    return texts[status] || status;
  };

  const getProgressPercentage = (status) => {
    const progress = {
      'pending': 10,
      'confirmed': 20,
      'preparing': 40,
      'shipped': 60,
      'in_transit': 75,
      'out_for_delivery': 90,
      'delivered': 100,
      'cancelled': 0,
      'returned': 0
    };
    return progress[status] || 0;
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
        🔍 Suivi de Livraison
      </h3>

      {/* Formulaire de recherche */}
      {!trackingNumber && (
        <form onSubmit={handleTrackSubmit} className="mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Entrez votre numéro de suivi..."
              value={inputTracking}
              onChange={(e) => setInputTracking(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
            />
            <button
              type="submit"
              disabled={loading || !inputTracking.trim()}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                loading || !inputTracking.trim()
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-200'
              }`}
            >
              {loading ? '🔍' : 'Suivre'}
            </button>
          </div>
        </form>
      )}

      {/* État de chargement */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-600">Recherche en cours...</p>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6">
          <div className="flex items-center">
            <div className="text-rose-500 mr-3">❌</div>
            <p className="text-rose-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Informations de suivi */}
      {trackingInfo && (
        <div className="space-y-6">
          {/* Entête avec info principale */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-xl border border-emerald-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xl font-bold text-emerald-800">
                  #{trackingInfo.tracking_number}
                </h4>
                <p className="text-emerald-600">
                  Commande #{trackingInfo.order_id || orderId}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-full border font-semibold ${getStatusColor(trackingInfo.status)}`}>
                {getStatusIcon(trackingInfo.status)} {getStatusText(trackingInfo.status)}
              </div>
            </div>

            {/* Barre de progression */}
            <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${getProgressPercentage(trackingInfo.status)}%` }}
              ></div>
            </div>
            <p className="text-sm text-emerald-600 text-center">
              {getProgressPercentage(trackingInfo.status)}% complété
            </p>
          </div>

          {/* Informations détaillées */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Adresse de livraison */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <h5 className="font-semibold text-blue-800 mb-2 flex items-center">
                📍 Adresse de livraison
              </h5>
              <div className="text-sm text-blue-700 space-y-1">
                <p>{trackingInfo.delivery_address?.address}</p>
                <p>{trackingInfo.delivery_address?.city}, {trackingInfo.delivery_address?.country}</p>
                {trackingInfo.phone && (
                  <p className="flex items-center">
                    📞 {trackingInfo.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Informations de livraison */}
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
              <h5 className="font-semibold text-purple-800 mb-2 flex items-center">
                🚚 Informations de livraison
              </h5>
              <div className="text-sm text-purple-700 space-y-1">
                <p><strong>Frais:</strong> {trackingInfo.delivery_fee} TND</p>
                <p><strong>Distance:</strong> {trackingInfo.distance_km} km</p>
                <p><strong>Temps estimé:</strong> {trackingInfo.estimated_delivery_time}</p>
                {trackingInfo.delivery_date && (
                  <p><strong>Date prévue:</strong> {new Date(trackingInfo.delivery_date).toLocaleDateString('fr-FR')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Historique de suivi */}
          {trackingInfo.tracking_history && trackingInfo.tracking_history.length > 0 && (
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <h5 className="font-semibold text-slate-800 mb-4 flex items-center">
                📋 Historique de suivi
              </h5>
              <div className="space-y-3">
                {trackingInfo.tracking_history.map((event, index) => (
                  <div key={index} className="flex items-start space-x-4 pb-3 border-b border-slate-200 last:border-b-0 last:pb-0">
                    <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h6 className="font-medium text-slate-800">{event.status}</h6>
                        <span className="text-sm text-slate-500">
                          {new Date(event.timestamp).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      {event.message && (
                        <p className="text-sm text-slate-600 mt-1">{event.message}</p>
                      )}
                      {event.location && (
                        <p className="text-xs text-slate-500 mt-1">📍 {event.location}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => fetchTrackingInfo(trackingInfo.tracking_number)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-blue-200"
            >
              🔄 Actualiser
            </button>
            {trackingInfo.estimated_location && (
              <button
                onClick={() => window.open(`https://www.google.com/maps?q=${trackingInfo.estimated_location.lat},${trackingInfo.estimated_location.lng}`, '_blank')}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-200"
              >
                🗺️ Voir sur la carte
            </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryTracking;
