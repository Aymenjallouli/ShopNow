import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import PaymentDebugInfo from '../components/PaymentDebugInfo';

const PaymentTest = () => {
  const [testAmount, setTestAmount] = useState(100);
  const { user } = useSelector((state) => state.auth);

  const handlePaymentSuccess = (paymentData) => {
    console.log('Payment successful:', paymentData);
    alert('Paiement test réussi ! Vérifiez la console pour les détails.');
  };

  const testOrderData = {
    id: 'test-order-' + Date.now(),
    orderItems: [
      {
        product: { id: 1, name: 'Produit Test', price: testAmount },
        quantity: 1,
        price: testAmount,
      }
    ],
    shippingAddress: 'Adresse de test, Tunis, Tunisie',
    phoneNumber: '+216 12 345 678',
    totalPrice: testAmount,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            🧪 Test des Méthodes de Paiement
          </h1>
          <p className="text-slate-600">
            Cette page permet de tester Stripe et d17 en mode développement
          </p>
        </div>

        {/* Debug Info */}
        <PaymentDebugInfo />

        {/* Test Amount Selector */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Montant de test</h2>
          <div className="flex items-center gap-4">
            <label className="text-slate-600">Montant:</label>
            <input
              type="number"
              value={testAmount}
              onChange={(e) => setTestAmount(Number(e.target.value))}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              min="1"
            />
            <span className="text-slate-600">TND</span>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Informations utilisateur</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Nom:</strong> {user?.name || 'Non connecté'}</p>
              <p><strong>Email:</strong> {user?.email || 'Non connecté'}</p>
            </div>
            <div>
              <p><strong>Pays:</strong> {user?.country || 'Non défini'}</p>
              <p><strong>Connecté:</strong> {user ? '✅ Oui' : '❌ Non'}</p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Test de Paiement</h2>
          
          <PaymentMethodSelector
            onSuccess={handlePaymentSuccess}
            amount={testAmount}
            orderData={testOrderData}
          />
        </div>

        {/* Test Instructions */}
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6 mt-6">
          <h3 className="text-lg font-bold text-blue-800 mb-4">Instructions de test</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-blue-700">Test Stripe:</h4>
              <ul className="text-blue-600 text-sm space-y-1 ml-4">
                <li>• Carte: 4242424242424242</li>
                <li>• Date: n'importe quelle date future</li>
                <li>• CVC: n'importe quel 3 chiffres</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-700">Test d17:</h4>
              <ul className="text-blue-600 text-sm space-y-1 ml-4">
                <li>• Utilisez n'importe quel numéro tunisien (+216...)</li>
                <li>• Le paiement sera simulé pour les tests</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentTest;
