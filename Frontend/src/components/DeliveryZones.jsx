import React from 'react';

const DeliveryZones = ({ selectedGovernorate }) => {
  // Configuration des zones de livraison pour les 24 gouvernorats
  const deliveryZones = {
    // Grand Tunis - Zone 1 (Livraison rapide)
    'Tunis': { zone: 1, fee: 5.000, time: '24-48h', color: 'emerald' },
    'Ariana': { zone: 1, fee: 5.000, time: '24-48h', color: 'emerald' },
    'Ben Arous': { zone: 1, fee: 5.000, time: '24-48h', color: 'emerald' },
    'Manouba': { zone: 1, fee: 5.000, time: '24-48h', color: 'emerald' },
    
    // Nord - Zone 2 (Livraison standard)
    'Bizerte': { zone: 2, fee: 7.000, time: '48-72h', color: 'blue' },
    'Beja': { zone: 2, fee: 7.000, time: '48-72h', color: 'blue' },
    'Jendouba': { zone: 2, fee: 8.000, time: '48-72h', color: 'blue' },
    'Le Kef': { zone: 2, fee: 8.000, time: '48-72h', color: 'blue' },
    'Siliana': { zone: 2, fee: 7.500, time: '48-72h', color: 'blue' },
    
    // Nord-Est - Zone 2 (Livraison standard)
    'Zaghouan': { zone: 2, fee: 6.500, time: '48-72h', color: 'blue' },
    'Nabeul': { zone: 2, fee: 6.000, time: '48-72h', color: 'blue' },
    
    // Centre - Zone 2 (Livraison standard)
    'Sousse': { zone: 2, fee: 6.500, time: '48-72h', color: 'blue' },
    'Monastir': { zone: 2, fee: 6.500, time: '48-72h', color: 'blue' },
    'Mahdia': { zone: 2, fee: 7.000, time: '48-72h', color: 'blue' },
    'Kairouan': { zone: 2, fee: 7.500, time: '48-72h', color: 'blue' },
    'Kasserine': { zone: 3, fee: 9.000, time: '72-96h', color: 'orange' },
    'Sidi Bouzid': { zone: 3, fee: 8.500, time: '72-96h', color: 'orange' },
    
    // Sud - Zone 3 (Livraison étendue)
    'Sfax': { zone: 2, fee: 7.000, time: '48-72h', color: 'blue' },
    'Gabes': { zone: 3, fee: 8.500, time: '72-96h', color: 'orange' },
    'Medenine': { zone: 3, fee: 9.500, time: '72-96h', color: 'orange' },
    'Tataouine': { zone: 3, fee: 10.000, time: '72-96h', color: 'orange' },
    'Gafsa': { zone: 3, fee: 9.000, time: '72-96h', color: 'orange' },
    'Tozeur': { zone: 3, fee: 10.500, time: '72-96h', color: 'orange' },
    'Kebili': { zone: 3, fee: 10.000, time: '72-96h', color: 'orange' }
  };

  const getZoneInfo = (governorate) => {
    return deliveryZones[governorate] || { zone: 1, fee: 5.000, time: '24-48h', color: 'emerald' };
  };

  const getColorClasses = (color) => {
    const colors = {
      emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      orange: 'bg-orange-50 border-orange-200 text-orange-800'
    };
    return colors[color] || colors.emerald;
  };

  if (!selectedGovernorate) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
          🚚 Zones de livraison
        </h3>
        <div className="text-center py-8">
          <div className="text-slate-400 text-4xl mb-4">📦</div>
          <p className="text-slate-600">Sélectionnez un gouvernorat pour voir les options de livraison</p>
        </div>
      </div>
    );
  }

  const zoneInfo = getZoneInfo(selectedGovernorate);

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
        🚚 Information de livraison
      </h3>
      
      <div className="space-y-4">
        {/* Gouvernorat sélectionné */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl">📍</span>
            </div>
            <div>
              <h4 className="font-bold text-slate-800">{selectedGovernorate}</h4>
              <p className="text-sm text-slate-600">Gouvernorat sélectionné</p>
            </div>
          </div>
        </div>

        {/* Informations de zone */}
        <div className={`p-4 rounded-xl border-2 ${getColorClasses(zoneInfo.color)}`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold">Zone {zoneInfo.zone}</h4>
            <span className="px-3 py-1 bg-white/70 rounded-full text-sm font-medium">
              {zoneInfo.time}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{typeof zoneInfo.fee === 'number' ? zoneInfo.fee.toFixed(3) : parseFloat(zoneInfo.fee) ? parseFloat(zoneInfo.fee).toFixed(3) : zoneInfo.fee} DT</div>
              <div className="text-sm opacity-75">Frais de livraison</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{zoneInfo.time}</div>
              <div className="text-sm opacity-75">Délai estimé</div>
            </div>
          </div>
        </div>

        {/* Légende des zones */}
        <div className="bg-slate-50 rounded-xl p-4">
          <h5 className="font-medium text-slate-800 mb-3">Légende des zones</h5>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-emerald-500 rounded-full mr-3"></div>
              <span>Zone 1: Grand Tunis (5 DT - 24-48h)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
              <span>Zone 2: Nord/Centre (6-8 DT - 48-72h)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
              <span>Zone 3: Sud/Intérieur (8-11 DT - 72-96h)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryZones;
