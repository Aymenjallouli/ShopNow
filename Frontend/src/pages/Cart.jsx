import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  fetchCart, 
  updateCartItemQuantity,
  removeFromCart
} from '../features/cart/cartSlice';
import { TrashIcon } from '@heroicons/react/24/outline';
import Loader from '../components/shared/Loader';
import ErrorMessage from '../components/shared/ErrorMessage';
import { orderService } from '../services/orderService';
import { useState } from 'react';

const Cart = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, status, error, totalItems, totalPrice } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [creating, setCreating] = useState(false);
  const [quickError, setQuickError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showCreditForm, setShowCreditForm] = useState(false);
  const [paymentDueDate, setPaymentDueDate] = useState('');
  
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);
  
  const handleQuantityChange = (itemId, quantity) => {
    if (quantity < 1) return;
    dispatch(updateCartItemQuantity({ itemId, quantity }));
  };
  
  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId));
  };
  
  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/login', { state: { from: '/checkout' } });
    }
  };

  const buildItemsPayload = () => (
    items.map(i => ({
      product: i.product.id,
      quantity: i.quantity,
      price: i.product.price,
    }))
  );

  const handleQuickOrder = async (type) => {
    if (!isAuthenticated) {
      return navigate('/login', { state: { from: '/cart' } });
    }
    
    if (type === 'credit' && !paymentDueDate) {
      setQuickError(t('cart.creditDateRequired'));
      return;
    }
    
    setQuickError(null); setSuccessMsg(null);
    setCreating(true);
    try {
      const payloadItems = buildItemsPayload();
      let order;
      if (type === 'cod') {
        order = await orderService.createCashOnDelivery(payloadItems);
  setSuccessMsg(t('cart.codSuccess'));
      } else if (type === 'credit') {
        order = await orderService.createCreditRequest(payloadItems, paymentDueDate);
        if (order.credit_status === 'requested') {
          setSuccessMsg(t('cart.creditRequested'));
        } else {
          setSuccessMsg(t('cart.orderCreated'));
        }
        setShowCreditForm(false);
        setPaymentDueDate('');
      }
      // Option: redirect to profile orders after short delay
      setTimeout(() => navigate('/profile?tab=orders'), 1200);
    } catch (e) {
  setQuickError(e?.response?.data?.error || t('cart.orderFailed'));
    } finally {
      setCreating(false);
    }
  };
  
  if (status === 'loading') {
    return <Loader />;
  }
  
  if (status === 'failed') {
    return <ErrorMessage message={error} />;
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
                {t('cart.emptyTitle')}
              </h1>
              <p className="text-slate-600 mb-8 leading-relaxed">
                {t('cart.emptyDesc')}
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transform hover:scale-105 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {t('cart.startShopping')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-slate-800 bg-clip-text text-transparent mb-4">
            {t('cart.title')}
          </h1>
          <p className="text-slate-600 text-lg">
            {t('cart.desc')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="p-6 border-b border-slate-200/50">
                <h2 className="text-xl font-semibold text-slate-800">{t('cart.itemsTitle', {count: items.length})}</h2>
              </div>
              <ul className="divide-y divide-slate-200/50">
                {items.map((item) => (
                  <li key={item.id} className="p-6 hover:bg-slate-50/50 transition-colors duration-200">
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-full sm:w-32 h-32 bg-gradient-to-br from-slate-100 to-emerald-50 rounded-xl overflow-hidden shadow-md">
                        <img
                          src={
                            item.product.images && item.product.images.length > 0 
                              ? (item.product.images[0].image || item.product.images[0])
                              : item.product.image || '/placeholder.svg'
                          }
                          alt={item.product.name}
                          className="w-full h-full object-center object-cover hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            e.target.src = '/placeholder.svg';
                            e.target.onerror = null;
                          }}
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-semibold text-slate-800 mb-2">
                              <Link 
                                to={`/products/${item.product.id}`} 
                                className="hover:text-emerald-600 transition-colors duration-200"
                              >
                                {item.product.name}
                              </Link>
                            </h3>
                            <p className="text-slate-500 text-sm mb-1">
                              {t('cart.unitPrice')}: ${typeof item.product.price === 'number' ? item.product.price.toFixed(2) : parseFloat(item.product.price || 0).toFixed(2)}
                            </p>
                            <p className="text-sm text-slate-400">
                              {t('cart.inStock', {count: item.product.stock})}
                            </p>
                          </div>
                          
                          {/* Total Price */}
                          <div className="text-right ml-4">
                            <p className="text-2xl font-bold text-emerald-600">
                              ${typeof item.total_price === 'number' ? item.total_price.toFixed(2) : parseFloat(item.total_price || 0).toFixed(2)}
                            </p>
                            <p className="text-sm text-slate-500">Total</p>
                          </div>
                        </div>
                        
                        {/* Quantity Controls and Remove Button */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <label className="text-sm font-medium text-slate-600 mr-4">{t('cart.quantity')}:</label>
                            <div className="flex items-center bg-white/80 border border-slate-200 rounded-lg shadow-sm">
                              <button
                                type="button"
                                className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-l-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="px-4 py-2 text-slate-800 font-medium min-w-[3rem] text-center border-x border-slate-200">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-r-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.product.stock}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            type="button"
                            className="flex items-center px-4 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors duration-200 group"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <TrashIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                            <span className="text-sm font-medium">{t('cart.remove')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">{t('cart.summaryTitle')}</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between py-3 border-b border-slate-200/50">
                  <span className="text-slate-600">{t('cart.subtotal', {count: totalItems})}</span>
                  <span className="font-semibold text-slate-800">
                    ${typeof totalPrice === 'number' ? totalPrice.toFixed(2) : parseFloat(totalPrice || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-200/50">
                  <span className="text-slate-600">{t('cart.shipping')}</span>
                  <span className="text-slate-500 text-sm">{t('cart.calculatedAtCheckout')}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-200/50">
                  <span className="text-slate-600">{t('cart.tax')}</span>
                  <span className="text-slate-500 text-sm">{t('cart.calculatedAtCheckout')}</span>
                </div>
                <div className="flex items-center justify-between py-4 border-t-2 border-emerald-200">
                  <span className="text-xl font-bold text-slate-800">{t('cart.total')}</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    ${typeof totalPrice === 'number' ? totalPrice.toFixed(2) : parseFloat(totalPrice || 0).toFixed(2)}
                  </span>
                </div>
              </div>
              
              {/* Checkout Button */}
              <button
                type="button"
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transform hover:scale-105 transition-all duration-200 mb-4"
                onClick={handleCheckout}
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  {t('cart.proceedToCheckout')}
                </span>
              </button>

              {/* Quick Payment Alternatives */}
              <div className="space-y-3 mb-4">
                <div className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{t('cart.otherOptions')}</div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={creating}
                    onClick={() => handleQuickOrder('cod')}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-emerald-200 bg-white text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating && <span className="h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />}
                    {t('cart.cod')}
                  </button>
                  
                  {!showCreditForm ? (
                    <button
                      type="button"
                      disabled={creating}
                      onClick={() => setShowCreditForm(true)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-indigo-200 bg-white text-sm font-medium text-indigo-700 hover:bg-indigo-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('cart.credit')}
                    </button>
                  ) : (
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 space-y-3">
                      <h4 className="font-medium text-indigo-900 text-sm">{t('cart.creditRequestTitle')}</h4>
                      <div>
                        <label className="block text-xs font-medium text-indigo-700 mb-1">
                          {t('cart.creditDateLabel')}
                        </label>
                        <input
                          type="date"
                          value={paymentDueDate}
                          onChange={(e) => setPaymentDueDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 text-sm border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleQuickOrder('credit')}
                          disabled={creating || !paymentDueDate}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm rounded-md transition-colors"
                        >
                          {creating && <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                          {creating ? t('cart.sending') : t('cart.send')}
                        </button>
                        <button
                          onClick={() => {
                            setShowCreditForm(false);
                            setPaymentDueDate('');
                          }}
                          disabled={creating}
                          className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors"
                        >
                          {t('cart.cancel')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {quickError && <p className="text-xs text-red-600">{quickError}</p>}
                {successMsg && <p className="text-xs text-emerald-600">{successMsg}</p>}
              </div>
              
              {/* Continue Shopping */}
              <div className="text-center">
                <Link 
                  to="/" 
                  className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  {t('cart.continueShopping')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
