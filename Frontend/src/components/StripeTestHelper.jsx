import React, { useState } from 'react';

const StripeTestHelper = () => {
  const [selectedCard, setSelectedCard] = useState('');

  const testCards = {
    success: [
      { name: 'Visa', number: '4242424242424242', description: 'Paiement réussi' },
      { name: 'Visa Debit', number: '4000056655665556', description: 'Carte de débit' },
      { name: 'Mastercard', number: '5555555555554444', description: 'Paiement réussi' },
      { name: 'Amex', number: '378282246310005', description: 'American Express' },
    ],
    failure: [
      { name: 'Declined', number: '4000000000000002', description: 'Carte déclinée' },
      { name: 'Insufficient', number: '4000000000009995', description: 'Fonds insuffisants' },
      { name: 'Expired', number: '4000000000000069', description: 'Carte expirée' },
    ]
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSelectedCard(text);
    setTimeout(() => setSelectedCard(''), 2000);
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
        💳 Cartes de Test Stripe
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Cartes qui marchent */}
        <div>
          <h4 className="font-semibold text-green-700 mb-2 flex items-center">
            ✅ Paiements Réussis
          </h4>
          <div className="space-y-2">
            {testCards.success.map((card) => (
              <div 
                key={card.number}
                onClick={() => copyToClipboard(card.number)}
                className="bg-white p-3 rounded-lg cursor-pointer hover:bg-green-50 border border-green-200 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-slate-800">{card.name}</div>
                    <div className="text-xs text-slate-500">{card.description}</div>
                  </div>
                  <div className="text-sm font-mono text-slate-600">
                    {card.number.replace(/(.{4})/g, '$1 ').trim()}
                  </div>
                </div>
                {selectedCard === card.number && (
                  <div className="text-xs text-green-600 mt-1">📋 Copié!</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Cartes qui échouent */}
        <div>
          <h4 className="font-semibold text-red-700 mb-2 flex items-center">
            ❌ Paiements Échoués
          </h4>
          <div className="space-y-2">
            {testCards.failure.map((card) => (
              <div 
                key={card.number}
                onClick={() => copyToClipboard(card.number)}
                className="bg-white p-3 rounded-lg cursor-pointer hover:bg-red-50 border border-red-200 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-slate-800">{card.name}</div>
                    <div className="text-xs text-slate-500">{card.description}</div>
                  </div>
                  <div className="text-sm font-mono text-slate-600">
                    {card.number.replace(/(.{4})/g, '$1 ').trim()}
                  </div>
                </div>
                {selectedCard === card.number && (
                  <div className="text-xs text-red-600 mt-1">📋 Copié!</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Autres infos */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-slate-200">
        <h4 className="font-semibold text-slate-700 mb-2">📋 Autres informations de test</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="bg-slate-50 p-2 rounded">
            <div className="font-medium text-slate-600">Date d'expiration</div>
            <div className="text-slate-500">N'importe quelle date future</div>
            <div className="font-mono text-emerald-600">12/25, 01/26, etc.</div>
          </div>
          <div className="bg-slate-50 p-2 rounded">
            <div className="font-medium text-slate-600">Code CVC</div>
            <div className="text-slate-500">N'importe quel 3 chiffres</div>
            <div className="font-mono text-emerald-600">123, 456, 789</div>
          </div>
          <div className="bg-slate-50 p-2 rounded">
            <div className="font-medium text-slate-600">Code postal</div>
            <div className="text-slate-500">N'importe lequel</div>
            <div className="font-mono text-emerald-600">12345, 10001</div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-slate-500 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
        <p><strong>💡 Comment utiliser :</strong></p>
        <ol className="list-decimal list-inside space-y-1 mt-1">
          <li>Cliquez sur une carte pour copier le numéro</li>
          <li>Collez-le dans le champ "Card Number" ci-dessous</li>
          <li>Utilisez n'importe quelle date future et CVC</li>
          <li>Testez différents scénarios (réussite/échec)</li>
        </ol>
        <p className="mt-2"><strong>⚠️ Important :</strong> Ces cartes ne fonctionnent qu'en mode TEST!</p>
      </div>
    </div>
  );
};

export default StripeTestHelper;
