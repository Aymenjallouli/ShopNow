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
      // Stripe.js has not loaded yet
      return;
    }
    
    // Validate shipping info
    for (const [key, value] of Object.entries(shippingInfo)) {
      if (!value && key !== 'state') { // state is optional
        setError(`Please provide your ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }
    
    setProcessing(true);
    
    try {
      const payload = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: user?.name || shippingInfo.fullName,
            email: user?.email || shippingInfo.email,
            address: {
              line1: shippingInfo.address,
              city: shippingInfo.city,
              state: shippingInfo.state,
              postal_code: shippingInfo.postalCode,
              country: shippingInfo.country,
            },
          },
        },
        receipt_email: user?.email || shippingInfo.email,
      });
      
      if (payload.error) {
        setError(`Payment failed: ${payload.error.message}`);
      } else {
        // Payment succeeded
        onSuccess();
      }
    } catch (err) {
      setError(`Payment failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4">
        <label htmlFor="card-element" className="block text-sm font-medium text-gray-700 mb-2">
          Credit or debit card
        </label>
        <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
          <CardElement id="card-element" options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>
      
      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error}
        </div>
      )}
      
      <div className="mt-6">
        <button
          type="submit"
          disabled={!stripe || processing}
          className={`w-full py-3 px-4 rounded-md text-white font-medium ${
            !stripe || processing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {processing ? 'Processing...' : `Pay $${(amount || 0).toFixed(2)}`}
        </button>
      </div>
    </form>
  );
};

export default CheckoutForm;
