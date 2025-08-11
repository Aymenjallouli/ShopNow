import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchWishlist, removeFromWishlist, clearWishlist } from '../features/wishlist/wishlistSlice';
import { addToCart } from '../features/cart/cartSlice';
import Loader from '../components/shared/Loader';
import ErrorMessage from '../components/shared/ErrorMessage';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { items, loading, error } = useSelector((state) => state.wishlist);
  const safeItems = Array.isArray(items) ? items : [];
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  const handleRemoveFromWishlist = (itemId) => {
    dispatch(removeFromWishlist(itemId));
  };

  const handleClearWishlist = () => {
    dispatch(clearWishlist());
  };

  const handleAddToCart = (productId, quantity = 1) => {
    dispatch(addToCart({ productId, quantity }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-emerald-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-100 to-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-slate-800 bg-clip-text text-transparent mb-4">
                {t('wishlist.login_required')}
              </h1>
              <p className="text-slate-600 mb-8 leading-relaxed">
                {t('wishlist.please_login')}
              </p>
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transform hover:scale-105 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                {t('wishlist.login_now')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-slate-800 bg-clip-text text-transparent mb-4">
            {t('wishlist.title')}
          </h1>
          <p className="text-slate-600 text-lg">
            {t('wishlist.subtitle')}
          </p>
        </div>

        {/* Actions Bar */}
  {safeItems.length > 0 && (
          <div className="flex justify-between items-center mb-8">
            <div className="text-slate-600">
              {t('wishlist.items_count', { count: safeItems.length })}
            </div>
            <button
              onClick={handleClearWishlist}
              className="flex items-center px-4 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors duration-200 group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {t('wishlist.clear')}
            </button>
          </div>
        )}

  {safeItems.length === 0 ? (
          <div className="text-center max-w-md mx-auto">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-100 to-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-slate-800 bg-clip-text text-transparent mb-4">
                {t('wishlist.empty_title')}
              </h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                {t('wishlist.empty_message')}
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transform hover:scale-105 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {t('wishlist.continue_shopping')}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeItems.map((item) => (
              <div
                key={item.id}
                className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
              >
                <Link to={`/product/${item.product.id}`} className="block relative">
                  <div className="aspect-w-16 aspect-h-12 bg-gradient-to-br from-slate-100 to-emerald-50">
                    <img
                      src={
                        item.product.images && item.product.images.length > 0 
                          ? (item.product.images[0].image || item.product.images[0])
                          : item.product.image || '/placeholder.svg'
                      }
                      alt={item.product.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = '/placeholder.svg';
                        e.target.onerror = null;
                      }}
                    />
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                  </div>
                </Link>
                
                <div className="p-6">
                  <Link
                    to={`/product/${item.product.id}`}
                    className="block mb-3"
                  >
                    <h3 className="text-xl font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors duration-200 line-clamp-2">
                      {item.product.name}
                    </h3>
                  </Link>
                  
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {item.product.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-emerald-600">
                        {t('wishlist.currency')}{typeof (item.product.discount_price || item.product.price) === 'number' 
                          ? (item.product.discount_price || item.product.price).toFixed(2) 
                          : parseFloat(item.product.discount_price || item.product.price || 0).toFixed(2)}
                      </span>
                      {item.product.discount_price && (
                        <span className="text-sm text-slate-400 line-through">
                          {t('wishlist.currency')}{typeof item.product.price === 'number' ? item.product.price.toFixed(2) : parseFloat(item.product.price || 0).toFixed(2)}
                        </span>
                      )}
                    </div>
                    {item.product.discount_price && (
                      <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        {t('wishlist.sale')}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAddToCart(item.product.id)}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      {t('wishlist.add_to_cart')}
                    </button>
                    
                    <button
                      onClick={() => handleRemoveFromWishlist(item.id)}
                      className="p-3 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors duration-200 group"
                      title={t('wishlist.remove')}
                    >
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
