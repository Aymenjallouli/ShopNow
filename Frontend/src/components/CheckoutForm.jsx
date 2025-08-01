import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useSelector } from 'react-redux';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

const CheckoutForm = ({ clientSecret, shippingInfo, onSuccess, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      setError('Stripe n\'est pas encore chargé. Veuillez patienter...');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      console.log('Starting payment with client secret:', clientSecret);
      
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: user?.name || 'Test User',
            email: user?.email || 'test@example.com',
          },
        },
        receipt_email: user?.email || 'test@example.com',
      });
      
      if (confirmError) {
        console.error('Payment confirmation error:', confirmError);
        
        // Messages d'erreur personnalisés en français
        let errorMessage = confirmError.message;
        switch (confirmError.code) {
          case 'card_declined':
            errorMessage = 'Votre carte a été déclinée. Essayez une autre carte.';
            break;
          case 'insufficient_funds':
            errorMessage = 'Fonds insuffisants. Vérifiez votre solde.';
            break;
          case 'expired_card':
            errorMessage = 'Votre carte a expiré. Utilisez une carte valide.';
            break;
          case 'incorrect_cvc':
            errorMessage = 'Code CVC incorrect. Vérifiez les 3 chiffres au dos de votre carte.';
            break;
          case 'processing_error':
            errorMessage = 'Erreur de traitement. Veuillez réessayer.';
            break;
          default:
            errorMessage = `Erreur de paiement: ${confirmError.message}`;
        }
        
        setError(errorMessage);
      } else {
        console.log('Payment successful:', paymentIntent);
        
        // Paiement réussi
        if (paymentIntent.status === 'succeeded') {
          console.log('✅ Payment completed successfully!');
          onSuccess(paymentIntent);
        } else {
          setError(`Statut de paiement inattendu: ${paymentIntent.status}`);
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(`Erreur de paiement: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4">
          <label htmlFor="card-element" className="block text-sm font-medium text-slate-700 mb-2">
            Credit or Debit Card
          </label>
          <div className="border border-slate-200 rounded-xl p-4 bg-white/80 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-colors duration-200">
            <CardElement id="card-element" options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>
        
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
            <p className="text-rose-600 font-medium">{error}</p>
          </div>
        )}
        
        <button
          type="submit"
          disabled={!stripe || processing}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
            !stripe || processing
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transform hover:scale-105'
          }`}
        >
          {processing ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
              Processing Payment...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Pay ${typeof amount === 'number' ? amount.toFixed(2) : parseFloat(amount || 0).toFixed(2)}
            </div>
          )}
        </button>
      </form>
      
      <div className="text-xs text-slate-500 text-center space-y-1">
        <p>🔒 Your payment information is secure and encrypted</p>
        <p>✅ Powered by Stripe - Industry-leading security</p>
      </div>
    </div>
  );
};

export default CheckoutForm;
