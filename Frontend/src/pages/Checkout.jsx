import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../features/orders/ordersSlice';
import { clearCart } from '../features/cart/cartSlice';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

// Load Stripe with error handling
let stripePromise;
try {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (key) {
    stripePromise = loadStripe(key);
  } else {
    console.error('Stripe publishable key is missing. Please check your .env file.');
  }
} catch (error) {
  console.error('Failed to initialize Stripe:', error);
}

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalPrice, status: cartStatus } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { status: orderStatus, error: orderError } = useSelector((state) => state.orders);
  
  const [clientSecret, setClientSecret] = useState("");
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    phoneNumber: '',
  });
  
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Fetch client secret from backend
    const getPaymentIntent = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/payments/create-payment-intent/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ amount: totalPrice * 100 }), // amount in cents
        });
        
        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        setError(err.message);
      }
    };
    
    if (items.length > 0) {
      getPaymentIntent();
    } else {
      navigate('/cart');
    }
  }, [items, totalPrice, navigate]);
  
  const handleShippingInfoChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleOrderSuccess = () => {
    // Create order in the database
    const orderData = {
      orderItems: items.map((item) => ({
        product: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      })),
      shippingAddress: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state}, ${shippingInfo.postalCode}, ${shippingInfo.country}`,
      phoneNumber: shippingInfo.phoneNumber,
      totalPrice,
    };
    
    dispatch(createOrder(orderData))
      .unwrap()
      .then(() => {
        dispatch(clearCart());
        navigate('/profile', { state: { orderSuccess: true } });
      })
      .catch((err) => {
        setError(err.message);
      });
  };
  
  if (cartStatus === 'loading' || (clientSecret === "" && !error)) {
    return <Loader />;
  }
  
  if (cartStatus === 'failed' || orderStatus === 'failed') {
    return <ErrorMessage message={orderError || error} />;
  }
  
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">You cannot proceed to checkout with an empty cart.</p>
          <button
            onClick={() => navigate('/')}
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h2>
            
            <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
              <div className="sm:col-span-2">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={shippingInfo.fullName}
                  onChange={handleShippingInfoChange}
                  className="mt-1 block w-full border border-gray-200 bg-gray-50 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-700 placeholder-gray-400"
                  required
                />
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={shippingInfo.email}
                  onChange={handleShippingInfoChange}
                  className="mt-1 block w-full border border-gray-200 bg-gray-50 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-700 placeholder-gray-400"
                  required
                />
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleShippingInfoChange}
                  className="mt-1 block w-full border border-gray-200 bg-gray-50 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-700 placeholder-gray-400"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleShippingInfoChange}
                  className="mt-1 block w-full border border-gray-200 bg-gray-50 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-700 placeholder-gray-400"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State / Province
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={shippingInfo.state}
                  onChange={handleShippingInfoChange}
                  className="mt-1 block w-full border border-gray-200 bg-gray-50 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-700 placeholder-gray-400"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                  Postal Code
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={shippingInfo.postalCode}
                  onChange={handleShippingInfoChange}
                  className="mt-1 block w-full border border-gray-200 bg-gray-50 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-700 placeholder-gray-400"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  value={shippingInfo.country}
                  onChange={handleShippingInfoChange}
                  className="mt-1 block w-full border border-gray-200 bg-gray-50 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-700"
                  required
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="FR">France</option>
                  <option value="DE">Germany</option>
                </select>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={shippingInfo.phoneNumber}
                  onChange={handleShippingInfoChange}
                  className="mt-1 block w-full border border-gray-200 bg-gray-50 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-700 placeholder-gray-400"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h2>
            
            {clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm onSuccess={handleOrderSuccess} />
              </Elements>
            )}
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{error}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
            
            <div className="flow-root">
              <ul className="divide-y divide-gray-200">
                {items.map((item) => (
                  <li key={item.id} className="py-4 flex">
                    <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-md overflow-hidden">
                      <img
                        src={item.product.images && item.product.images.length > 0 
                          ? item.product.images[0].image 
                          : '/placeholder.jpg'}
                        alt={item.product.name}
                        className="w-full h-full object-center object-cover"
                      />
                    </div>
                    <div className="ml-4 flex-1 flex flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3>{item.product.name}</h3>
                          <p className="ml-4">${(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex-1 flex items-end justify-between text-sm">
                        <p className="text-gray-500">Qty {item.quantity}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Subtotal</p>
                <p>${totalPrice.toFixed(2)}</p>
              </div>
              <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
