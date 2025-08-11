import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm';
import D17Payment from './D17Payment';
import { useDebounce, useApiCache } from '../../hooks/usePerformance';

// Configuration Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentMethodSelector = ({ onSuccess, amount, orderData }) => {
  const [selectedMethod, setSelectedMethod] = useState('stripe');
  const [clientSecret, setClientSecret] = useState('');
  const [d17Data, setD17Data] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const { cachedApiCall } = useApiCache();
  const previousAmountRef = useRef(amount);

  // Détecter si l'utilisateur est en Tunisie
  const isInTunisia = useMemo(() => 
    import.meta.env.VITE_SHOW_D17 === 'true' || 
    user?.country === 'TN' || 
    window.navigator.language.includes('ar') ||
    import.meta.env.NODE_ENV === 'development'
  , [user?.country]);

  // Debug: vérifier que le montant est bien reçu
  useEffect(() => {
    console.log('PaymentMethodSelector - Amount received:', amount, typeof amount);
    console.log('PaymentMethodSelector - Order data:', orderData);
  }, [amount, orderData]);

  // Fonction optimisée pour créer le PaymentIntent
  const createStripePaymentIntent = useCallback(async (paymentAmount) => {
    // Éviter les appels si le montant n'a pas changé significativement
    if (Math.abs(paymentAmount - previousAmountRef.current) < 0.01) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Vérifier le token d'authentification
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }
      
      console.log('Creating payment intent for amount:', paymentAmount);

      // Utiliser le cache API pour éviter les créations dupliquées
      const cacheKey = `payment-intent-${Math.round(paymentAmount * 100)}`;
      
      const data = await cachedApiCall(cacheKey, async () => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/create-payment-intent/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            amount: Math.round(paymentAmount * 100), // Convert to cents and ensure integer
            currency: 'usd' 
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: Failed to create payment intent`);
        }

        return response.json();
      }, 2 * 60 * 1000); // Cache pendant 2 minutes

      console.log('Payment intent created:', data);
      setClientSecret(data.clientSecret);
      previousAmountRef.current = paymentAmount;
    } catch (err) {
      console.error('Error creating payment intent:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [cachedApiCall]);

  // Debouncer la création de PaymentIntent
  const debouncedCreatePaymentIntent = useDebounce(createStripePaymentIntent, 500);

  useEffect(() => {
    if (selectedMethod === 'stripe' && amount > 0) {
      debouncedCreatePaymentIntent(amount);
    }
  }, [selectedMethod, amount, debouncedCreatePaymentIntent]);

  const createD17Payment = async () => {
    if (!phoneNumber.trim()) {
  setError(t('paymentMethodSelector.enterPhone', 'Veuillez saisir votre numéro de téléphone'));
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/payments/create-d17-payment/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ 
          amount: amount,
          phone_number: phoneNumber,
          currency: 'TND'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create d17 payment');
      }

      const data = await response.json();
      setD17Data(data);
      
      // Rediriger vers d17 ou afficher les instructions
      if (data.payment_url) {
        window.open(data.payment_url, '_blank');
        // Démarrer la vérification du paiement
        startD17Verification(data.transaction_id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startD17Verification = (transactionId) => {
    // Vérifier le statut du paiement toutes les 3 secondes
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch('http://localhost:8000/api/payments/verify-d17-payment/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ transaction_id: transactionId }),
        });

        const data = await response.json();
        
        if (data.status === 'completed') {
          clearInterval(intervalId);
          onSuccess(); // Commande validée
        } else if (data.status === 'failed') {
          clearInterval(intervalId);
          setError('Le paiement d17 a échoué');
        }
      } catch (err) {
        console.error('Error verifying d17 payment:', err);
      }
    }, 3000);

    // Arrêter après 5 minutes
    setTimeout(() => {
      clearInterval(intervalId);
    }, 300000);
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
  <h2 className="text-2xl font-bold text-slate-800 mb-6">{t('paymentMethodSelector.chooseMethod', 'Choose Payment Method')}</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl">
          <p className="text-rose-600 font-medium">{error}</p>
        </div>
      )}

      {/* Payment Method Selection */}
      <div className="space-y-4 mb-6">
        {/* Stripe Card Payment */}
        <div className="flex items-center">
          <input
            type="radio"
            id="stripe"
            name="paymentMethod"
            value="stripe"
            checked={selectedMethod === 'stripe'}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 focus:ring-emerald-500 focus:ring-2"
          />
          <label htmlFor="stripe" className="ml-3 flex items-center cursor-pointer">
            <div className="flex items-center">
              <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M2 10h20" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <div>
                <div className="font-medium text-slate-800">{t('paymentMethodSelector.card', 'Credit/Debit Card')}</div>
                <div className="text-sm text-slate-500">{t('paymentMethodSelector.visaMastercard', 'Visa, Mastercard, etc.')}</div>
              </div>
            </div>
          </label>
        </div>

        {/* D17 Payment (Tunisie seulement) */}
        {isInTunisia && (
          <div className="flex items-center">
            <input
              type="radio"
              id="d17"
              name="paymentMethod"
              value="d17"
              checked={selectedMethod === 'd17'}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 focus:ring-emerald-500 focus:ring-2"
            />
            <label htmlFor="d17" className="ml-3 flex items-center cursor-pointer">
              <div className="flex items-center">
                <div className="w-8 h-8 mr-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">d17</span>
                </div>
                <div>
                  <div className="font-medium text-slate-800">{t('paymentMethodSelector.d17', 'd17 Mobile Payment')}</div>
                  <div className="text-sm text-slate-500">{t('paymentMethodSelector.d17Desc', 'Paiement mobile tunisien')}</div>
                </div>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Payment Form Based on Selected Method */}
      {selectedMethod === 'stripe' && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('paymentMethodSelector.cardPayment', 'Card Payment')}</h3>
          
          {/* Affichage du montant */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-300">{t('paymentMethodSelector.amountToPay', 'Amount to pay:')}</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-lg">
                ${typeof amount === 'number' ? amount.toFixed(2) : parseFloat(amount || 0).toFixed(2)}
              </span>
            </div>
          </div>
          
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm 
                onSuccess={onSuccess} 
                amount={amount}
                clientSecret={clientSecret}
              />
            </Elements>
          )}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <span className="ml-2 text-slate-600">{t('paymentMethodSelector.settingUp', 'Setting up payment...')}</span>
            </div>
          )}
        </div>
      )}

      {selectedMethod === 'd17' && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('paymentMethodSelector.d17', 'd17 Mobile Payment')}</h3>
          <D17Payment
            amount={amount}
            orderId={orderData?.id || Date.now()}
            onSuccess={(data) => {
              console.log('d17 payment success:', data);
              onSuccess(data);
            }}
            onError={(error) => {
              console.error('d17 payment error:', error);
              setError(t('d17Payment.error', 'Erreur lors du paiement d17'));
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
