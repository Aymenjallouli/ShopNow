import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { formatPriceWithCurrency, safeParseFloat } from '../../utils/priceUtils';
import { useDebounce } from '../../hooks/usePerformance';

const DeliveryCalculator = ({ shippingInfo, onDeliveryUpdate }) => {
  const { t } = useTranslation();
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useSelector((state) => state.auth);
  
  // Références pour éviter les boucles
  const lastCalculationRef = useRef(null);
  const onDeliveryUpdateRef = useRef(onDeliveryUpdate);
  
  // Mettre à jour la référence de callback
  useEffect(() => {
    onDeliveryUpdateRef.current = onDeliveryUpdate;
  }, [onDeliveryUpdate]);

  // Configuration des zones de livraison pour les 24 gouvernorats (mise en cache)
  const deliveryZones = useMemo(() => ({
    // Grand Tunis - Zone 1 (Livraison rapide)
    'Tunis': { zone: 1, fee: 5.000, time: '24-48h', distance: 10 },
    'Ariana': { zone: 1, fee: 5.000, time: '24-48h', distance: 15 },
    'Ben Arous': { zone: 1, fee: 5.000, time: '24-48h', distance: 20 },
    'Manouba': { zone: 1, fee: 5.000, time: '24-48h', distance: 25 },
    
    // Nord - Zone 2 (Livraison standard)
    'Bizerte': { zone: 2, fee: 7.000, time: '48-72h', distance: 65 },
    'Beja': { zone: 2, fee: 7.000, time: '48-72h', distance: 105 },
    'Jendouba': { zone: 2, fee: 8.000, time: '48-72h', distance: 140 },
    'Le Kef': { zone: 2, fee: 8.000, time: '48-72h', distance: 175 },
    'Siliana': { zone: 2, fee: 7.500, time: '48-72h', distance: 120 },
    
    // Nord-Est - Zone 2 (Livraison standard)
    'Zaghouan': { zone: 2, fee: 6.500, time: '48-72h', distance: 60 },
    'Nabeul': { zone: 2, fee: 6.000, time: '48-72h', distance: 70 },
    
    // Centre - Zone 2 (Livraison standard)
    'Sousse': { zone: 2, fee: 6.500, time: '48-72h', distance: 140 },
    'Monastir': { zone: 2, fee: 6.500, time: '48-72h', distance: 160 },
    'Mahdia': { zone: 2, fee: 7.000, time: '48-72h', distance: 200 },
    'Kairouan': { zone: 2, fee: 7.500, time: '48-72h', distance: 160 },
    'Kasserine': { zone: 3, fee: 9.000, time: '72-96h', distance: 300 },
    'Sidi Bouzid': { zone: 3, fee: 8.500, time: '72-96h', distance: 270 },
    
    // Sud - Zone 3 (Livraison étendue)
    'Sfax': { zone: 2, fee: 7.000, time: '48-72h', distance: 270 },
    'Gabes': { zone: 3, fee: 8.500, time: '72-96h', distance: 340 },
    'Medenine': { zone: 3, fee: 9.500, time: '72-96h', distance: 480 },
    'Tataouine': { zone: 3, fee: 10.000, time: '72-96h', distance: 520 },
    'Gafsa': { zone: 3, fee: 9.000, time: '72-96h', distance: 340 },
    'Tozeur': { zone: 3, fee: 10.500, time: '72-96h', distance: 430 },
    'Kebili': { zone: 3, fee: 10.000, time: '72-96h', distance: 480 }
  }), []);

  // Fonction de calcul optimisée avec prévention des boucles
  const calculateDelivery = useCallback(async () => {
    if (!shippingInfo.city || shippingInfo.country !== 'TN') {
      return;
    }

    // Vérifier si on a déjà calculé pour cette ville
    const calculationKey = `${shippingInfo.city}-${shippingInfo.country}`;
    if (lastCalculationRef.current === calculationKey) {
      return; // Éviter les recalculs inutiles
    }

    setLoading(true);
    setError('');

    try {
      // Simuler un délai de traitement (réduit pour de meilleures performances)
      await new Promise(resolve => setTimeout(resolve, 100));

      const zoneInfo = deliveryZones[shippingInfo.city];
      
      if (!zoneInfo) {
  setError(t('delivery.errorZoneNotFound'));
        setLoading(false);
        return;
      }

      const calculatedDelivery = {
        success: true,
        delivery_fee: zoneInfo.fee,
        estimated_time: zoneInfo.time,
        distance: zoneInfo.distance,
        zone: zoneInfo.zone,
        governorate: shippingInfo.city,
  message: t('delivery.available', { city: shippingInfo.city, zone: zoneInfo.zone })
      };

      setDeliveryInfo(calculatedDelivery);
      lastCalculationRef.current = calculationKey;
      
      // Notifier le parent du coût de livraison (utiliser la référence stable)
      if (onDeliveryUpdateRef.current) {
        onDeliveryUpdateRef.current({
          fee: safeParseFloat(calculatedDelivery.delivery_fee),
          estimatedTime: calculatedDelivery.estimated_time,
          distance: calculatedDelivery.distance,
        });
      }
    } catch (error) {
      console.error('Erreur de calcul de livraison:', error);
  setError(t('delivery.errorCalculation'));
    } finally {
      setLoading(false);
    }
  }, [shippingInfo.city, shippingInfo.country, deliveryZones]);

  // Debouncer le calcul pour éviter les appels excessifs - MAIS PAS sur toutes les dépendances
  const debouncedCalculateDelivery = useDebounce(calculateDelivery, 800);

  // Calculer automatiquement quand le gouvernorat change (avec debounce et vérification)
  useEffect(() => {
    if (shippingInfo.city && shippingInfo.country === 'TN') {
      const calculationKey = `${shippingInfo.city}-${shippingInfo.country}`;
      if (lastCalculationRef.current !== calculationKey) {
        debouncedCalculateDelivery();
      }
    }
  }, [shippingInfo.city, shippingInfo.country, debouncedCalculateDelivery]);

  const getDeliveryIcon = () => {
    if (loading) return '⏳';
    if (error) return '❌';
    if (deliveryInfo) return '🚚';
    return '📍';
  };

  const getDeliveryStatus = () => {
    if (loading) return t('delivery.calculating');
    if (error) return error;
    if (deliveryInfo) return t('delivery.calculated');
    return t('delivery.enterAddress');
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
        {getDeliveryIcon()} {t('delivery.title')}
      </h3>

      {/* Statut du calcul */}
      <div className={`p-4 rounded-xl mb-4 ${
        error ? 'bg-rose-50 border border-rose-200' :
        deliveryInfo ? 'bg-emerald-50 border border-emerald-200' :
        'bg-blue-50 border border-blue-200'
      }`}>
        <p className={`font-medium ${
          error ? 'text-rose-700' :
          deliveryInfo ? 'text-emerald-700' :
          'text-blue-700'
        }`}>
          {getDeliveryStatus()}
        </p>
      </div>

      {/* Informations de livraison calculées */}
      {deliveryInfo && (
        <div className="space-y-4">
          {/* Frais et distance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-600">{t('delivery.fee')}</p>
                  <p className="text-2xl font-bold text-emerald-700">
                    {formatPriceWithCurrency(deliveryInfo.delivery_fee, 'TND')}
                  </p>
                </div>
                <div className="text-2xl">💰</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">{t('delivery.distance')}</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {deliveryInfo.distance_km} km
                  </p>
                </div>
                <div className="text-2xl">📏</div>
              </div>
            </div>
          </div>

          {/* Temps estimé */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">{t('delivery.estimatedTime')}</p>
                <p className="text-lg font-semibold text-purple-700">
                  {deliveryInfo.estimated_delivery_time}
                </p>
              </div>
              <div className="text-2xl">⏰</div>
            </div>
          </div>

          {/* Zones de livraison */}
          {deliveryInfo.delivery_zones && (
            <div className="mt-6">
              <h4 className="font-semibold text-slate-700 mb-3">{t('delivery.availableZones')}</h4>
              <div className="space-y-2">
                {deliveryInfo.delivery_zones.map((zone, index) => (
                  <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-slate-800">{zone.name}</p>
                        <p className="text-sm text-slate-600">
                          {zone.cities.join(', ')} • Max {zone.max_distance}km
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-emerald-600">
                          {zone.base_fee} TND
                        </p>
                        <p className="text-xs text-slate-500">{t('delivery.from')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bouton de recalcul manuel */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={calculateDelivery}
          disabled={loading || !shippingInfo.address || !shippingInfo.city}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
            loading || !shippingInfo.address || !shippingInfo.city
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transform hover:scale-105'
          }`}
        >
          {loading ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
              {t('delivery.calculating')}
            </div>
          ) : (
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 01.553-.894L9 2l6 3 6-3v15l-6 3-6-3z" />
              </svg>
              {t('delivery.recalculate')}
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default DeliveryCalculator;
