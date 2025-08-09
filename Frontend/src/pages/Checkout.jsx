import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../features/orders/ordersSlice';
import { clearCart } from '../features/cart/cartSlice';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import DeliveryCalculator from '../components/DeliveryCalculator';
import SafeMapboxDeliveryMap from '../components/SafeMapboxDeliveryMap';
import SimpleDeliveryMap from '../components/SimpleDeliveryMap';
import LazyImage from '../components/LazyImage';
import PerformancePreloader from '../components/PerformancePreloader';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { optimizeWebVitals, preloadCriticalResources } from '../utils/performanceOptimizer';
import { usePerformanceMonitor, useRenderOptimization } from '../hooks/usePerformanceMonitor';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalPrice, status: cartStatus } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { status: orderStatus, error: orderError } = useSelector((state) => state.orders);
  
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'TN',
    phoneNumber: '',
  });
  
  const [deliveryInfo, setDeliveryInfo] = useState({
    fee: 0,
    estimatedTime: '',
    distance: 0,
  });
  
  const [error, setError] = useState(null);
  const [useSimpleMap, setUseSimpleMap] = useState(false);
  
  // Hooks de surveillance des performances
  const { markFeature } = usePerformanceMonitor();
  const { renderCount } = useRenderOptimization('Checkout');
  
  // Optimisations de performance
  useEffect(() => {
    const endFeatureMark = markFeature('checkout-initialization');
    
    // Injecter CSS critique inline pour LCP
    const criticalCSS = document.createElement('style');
    criticalCSS.id = 'checkout-critical-css';
    criticalCSS.textContent = `
      .checkout-container { 
        min-height: 100vh; 
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #ecfdf5 100%);
        font-family: 'Inter', system-ui, sans-serif;
      }
      .checkout-loading { 
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        border-radius: 0.75rem;
      }
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `;
    
    if (!document.getElementById('checkout-critical-css')) {
      document.head.appendChild(criticalCSS);
    }
    
    // Optimiser les Web Vitals dès le chargement
    optimizeWebVitals();
    preloadCriticalResources();
    
    return () => {
      endFeatureMark();
      // Nettoyage du CSS critique si nécessaire
      const existingCSS = document.getElementById('checkout-critical-css');
      if (existingCSS) {
        existingCSS.remove();
      }
    };
  }, [markFeature]);
  
  useEffect(() => {
    // Rediriger vers le panier si vide
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  // Mémoriser les options du gouvernorat pour éviter les re-renders
  const governorateOptions = useMemo(() => [
    { value: "", label: "Sélectionnez un gouvernorat" },
    // Grand Tunis
    { value: "Tunis", label: "Tunis" },
    { value: "Ariana", label: "Ariana" },
    { value: "Ben Arous", label: "Ben Arous" },
    { value: "Manouba", label: "Manouba" },
    // Nord
    { value: "Bizerte", label: "Bizerte" },
    { value: "Beja", label: "Béja" },
    { value: "Jendouba", label: "Jendouba" },
    { value: "Le Kef", label: "Le Kef" },
    { value: "Siliana", label: "Siliana" },
    // Nord-Est
    { value: "Zaghouan", label: "Zaghouan" },
    { value: "Nabeul", label: "Nabeul" },
    // Centre
    { value: "Sousse", label: "Sousse" },
    { value: "Monastir", label: "Monastir" },
    { value: "Mahdia", label: "Mahdia" },
    { value: "Kairouan", label: "Kairouan" },
    { value: "Kasserine", label: "Kasserine" },
    { value: "Sidi Bouzid", label: "Sidi Bouzid" },
    // Sud
    { value: "Sfax", label: "Sfax" },
    { value: "Gabes", label: "Gabès" },
    { value: "Medenine", label: "Médenine" },
    { value: "Tataouine", label: "Tataouine" },
    { value: "Gafsa", label: "Gafsa" },
    { value: "Tozeur", label: "Tozeur" },
    { value: "Kebili", label: "Kébili" }
  ], []);

  // Mémoriser les données de la commande pour éviter les recalculs
  const orderData = useMemo(() => ({
    orderItems: items.map((item) => ({
      product: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
    })),
    shippingAddress: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state}, ${shippingInfo.postalCode}, ${shippingInfo.country}`,
    phoneNumber: shippingInfo.phoneNumber,
    totalPrice: totalPrice,
  }), [items, shippingInfo, totalPrice]);
  
  const handleShippingInfoChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Stabiliser la fonction handleDeliveryUpdate avec useCallback
  const handleDeliveryUpdate = useCallback((newDeliveryInfo) => {
    setDeliveryInfo(newDeliveryInfo);
  }, []);

  // Stabiliser et optimiser le calcul du total avec useCallback
  const getTotalWithDelivery = useCallback(() => {
    const total = (typeof totalPrice === 'number' ? totalPrice : parseFloat(totalPrice || 0)) + 
                  (typeof deliveryInfo.fee === 'number' ? deliveryInfo.fee : parseFloat(deliveryInfo.fee || 0));
    return total;
  }, [totalPrice, deliveryInfo.fee]);
  
  // Stabiliser la fonction handleOrderSuccess avec useCallback
  const handleOrderSuccess = useCallback((paymentData) => {
    console.log('Payment completed successfully:', paymentData);
    
    // Create order in the database
    const orderData = {
      orderItems: items.map((item) => ({
        product: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      })),
      shippingAddress: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state}, ${shippingInfo.postalCode}, ${shippingInfo.country}`,
      phoneNumber: shippingInfo.phoneNumber,
      totalPrice: getTotalWithDelivery(),
      paymentMethod: 'stripe',
      paymentIntentId: paymentData?.id || 'unknown',
      deliveryInfo: {
        fee: deliveryInfo.fee,
        estimatedTime: deliveryInfo.estimatedTime,
        distance: deliveryInfo.distance,
        coordinates: null, // Les coordonnées peuvent être calculées côté serveur si nécessaire
      },
    };
    
    console.log('Creating order with data:', orderData);
    
    dispatch(createOrder(orderData))
      .unwrap()
      .then((result) => {
        console.log('Order created successfully:', result);
        dispatch(clearCart());
        navigate('/profile', { 
          state: { 
            orderSuccess: true,
            orderId: result.order?.id || 'unknown',
            activeTab: 'orders'
          } 
        });
      })
      .catch((err) => {
        console.error('Failed to create order:', err);
        setError(`Failed to create order: ${err}`);
      });
  }, [items, shippingInfo, deliveryInfo, getTotalWithDelivery, dispatch, navigate]);
  
  if (cartStatus === 'loading') {
    return <Loader />;
  }
  
  if (cartStatus === 'failed' || orderStatus === 'failed') {
    return <ErrorMessage message={orderError || error} />;
  }
  
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-emerald-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-100 to-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-slate-800 bg-clip-text text-transparent mb-4">
                Your Cart is Empty
              </h1>
              <p className="text-slate-600 mb-8 leading-relaxed">
                You cannot proceed to checkout with an empty cart. Please add some items first.
              </p>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transform hover:scale-105 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Start Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <PerformancePreloader />
      <div className="checkout-container min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-emerald-50">
        <div className="container mx-auto px-4 py-8">
        {/* Header optimisé pour LCP */}
        <div className="checkout-header text-center mb-8">
          <h1 className="checkout-title text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-slate-800 bg-clip-text text-transparent mb-4">
            Checkout
          </h1>
          <p className="text-slate-600 text-lg">
            Complete your order with secure payment processing
          </p>
        </div>
        
        <div className="checkout-grid grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Shipping Information</h2>
              
              <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                <div className="sm:col-span-2">
                  <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={shippingInfo.fullName}
                    onChange={handleShippingInfoChange}
                    className="block w-full border border-slate-200 bg-white/80 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-slate-800 placeholder-slate-400 transition-colors duration-200"
                    required
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={shippingInfo.email}
                    onChange={handleShippingInfoChange}
                    className="block w-full border border-slate-200 bg-white/80 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-slate-800 placeholder-slate-400 transition-colors duration-200"
                    required
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleShippingInfoChange}
                    className="block w-full border border-slate-200 bg-white/80 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-slate-800 placeholder-slate-400 transition-colors duration-200"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-2">
                    Gouvernorat
                  </label>
                  <select
                    id="city"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleShippingInfoChange}
                    className="block w-full border border-slate-200 bg-white/80 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-slate-800 transition-colors duration-200"
                    required
                  >
                    {governorateOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-slate-700 mb-2">
                    State / Province
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={shippingInfo.state}
                    onChange={handleShippingInfoChange}
                    className="block w-full border border-slate-200 bg-white/80 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-slate-800 placeholder-slate-400 transition-colors duration-200"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-slate-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={shippingInfo.postalCode}
                    onChange={handleShippingInfoChange}
                    className="block w-full border border-slate-200 bg-white/80 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-slate-800 placeholder-slate-400 transition-colors duration-200"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-slate-700 mb-2">
                    Pays
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={shippingInfo.country}
                    onChange={handleShippingInfoChange}
                    className="block w-full border border-slate-200 bg-white/80 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-slate-800 transition-colors duration-200"
                    required
                  >
                    <option value="TN">🇹🇳 Tunisie</option>
                    <option value="DZ">🇩🇿 Algérie</option>
                    <option value="MA">🇲🇦 Maroc</option>
                    <option value="LY">🇱🇾 Libye</option>
                    <option value="EG">🇪🇬 Égypte</option>
                    <option value="FR">🇫🇷 France</option>
                    <option value="DE">🇩🇪 Allemagne</option>
                    <option value="IT">🇮🇹 Italie</option>
                    <option value="ES">🇪🇸 Espagne</option>
                  </select>
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={shippingInfo.phoneNumber}
                    onChange={handleShippingInfoChange}
                    className="block w-full border border-slate-200 bg-white/80 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-slate-800 placeholder-slate-400 transition-colors duration-200"
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Section de livraison */}
            <div className="space-y-6">
              <DeliveryCalculator 
                shippingInfo={shippingInfo}
                onDeliveryUpdate={handleDeliveryUpdate}
              />
              
              {import.meta.env.VITE_MAPBOX_ACCESS_TOKEN && !useSimpleMap ? (
                <SafeMapboxDeliveryMap
                  shippingInfo={shippingInfo}
                  showAddressSearch={false}
                />
              ) : (
                <SimpleDeliveryMap
                  shippingInfo={shippingInfo}
                  showAddressSearch={false}
                />
              )}
              
              {import.meta.env.VITE_MAPBOX_ACCESS_TOKEN && (
                <div className="text-center">
                  <button
                    onClick={() => setUseSimpleMap(!useSimpleMap)}
                    className="text-sm text-emerald-600 hover:text-emerald-700 underline"
                  >
                    {useSimpleMap ? 'Utiliser la carte Mapbox' : 'Utiliser la sélection simple'}
                  </button>
                </div>
              )}
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Payment Information</h2>
              
              <PaymentMethodSelector
                onSuccess={handleOrderSuccess}
                amount={getTotalWithDelivery()}
                orderData={{
                  orderItems: items.map((item) => ({
                    product: item.product.id,
                    quantity: item.quantity,
                    price: item.product.price,
                  })),
                  shippingAddress: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state}, ${shippingInfo.postalCode}, ${shippingInfo.country}`,
                  phoneNumber: shippingInfo.phoneNumber,
                  totalPrice,
                }}
              />
              
              {error && (
                <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                  <p className="text-rose-600 font-medium">{error}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Order Summary</h2>
              
              <div className="flow-root">
                <ul className="divide-y divide-slate-200/50">
                  {items.map((item) => (
                    <li key={item.id} className="py-4 flex">
                      <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-slate-100 to-emerald-50 rounded-xl overflow-hidden shadow-md">
                        <LazyImage
                          src={
                            item.product.images && item.product.images.length > 0 
                              ? (item.product.images[0].image || item.product.images[0])
                              : item.product.image || '/placeholder.svg'
                          }
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-center object-cover hover:scale-105 transition-transform duration-200"
                          placeholder="/placeholder.svg"
                          priority={false}
                        />
                      </div>
                      <div className="ml-4 flex-1 flex flex-col">
                        <div>
                          <div className="flex justify-between text-base font-semibold text-slate-800">
                            <h3 className="line-clamp-2">{item.product.name}</h3>
                            <p className="ml-4 text-emerald-600">
                              ${typeof item.total_price === 'number' ? item.total_price.toFixed(2) : parseFloat(item.total_price || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex-1 flex items-end justify-between text-sm">
                          <p className="text-slate-500">Qty {item.quantity}</p>
                          <p className="text-slate-400">
                            ${typeof item.product.price === 'number' ? item.product.price.toFixed(2) : parseFloat(item.product.price || 0).toFixed(2)} each
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="border-t border-slate-200/50 pt-6 mt-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-base text-slate-600">
                    <p>Subtotal</p>
                    <p className="font-medium">${typeof totalPrice === 'number' ? totalPrice.toFixed(2) : parseFloat(totalPrice || 0).toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between text-base text-slate-600">
                    <p>Livraison</p>
                    <p className="font-medium text-emerald-600">
                      {deliveryInfo.fee > 0 ? `${(typeof deliveryInfo.fee === 'number' ? deliveryInfo.fee : parseFloat(deliveryInfo.fee || 0)).toFixed(2)} TND` : 'À calculer'}
                    </p>
                  </div>
                  {deliveryInfo.estimatedTime && (
                    <div className="flex justify-between text-sm text-slate-500">
                      <p>Temps estimé</p>
                      <p>{deliveryInfo.estimatedTime}</p>
                    </div>
                  )}
                  {deliveryInfo.distance > 0 && (
                    <div className="flex justify-between text-sm text-slate-500">
                      <p>Distance</p>
                      <p>{deliveryInfo.distance} km</p>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold text-slate-800 pt-3 border-t border-slate-200/50">
                    <p>Total</p>
                    <p className="text-emerald-600">
                      ${typeof getTotalWithDelivery() === 'number' ? getTotalWithDelivery().toFixed(2) : parseFloat(getTotalWithDelivery() || 0).toFixed(2)}
                      {deliveryInfo.fee > 0 && (
                        <span className="text-sm font-normal text-slate-500 ml-2">
                          (+ {(typeof deliveryInfo.fee === 'number' ? deliveryInfo.fee : parseFloat(deliveryInfo.fee || 0)).toFixed(2)} TND livraison)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-500 text-center">
                  Les frais de livraison sont calculés automatiquement selon votre adresse.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Checkout;
