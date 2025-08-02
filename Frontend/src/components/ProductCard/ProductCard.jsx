import React, { useState, memo, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCartIcon, HeartIcon, StarIcon, EyeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../features/cart/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../features/wishlist/wishlistSlice';
import { OptimizedImage } from '../LazyLoadWrapper';

const ProductCard = memo(({ product }) => {
  const dispatch = useDispatch();
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  
  // Memoize expensive calculations
  const isWishlistedMemo = useMemo(() => 
    wishlistItems.some(item => item?.product?.id === product.id),
    [wishlistItems, product.id]
  );
  
  const [isWishlisted, setIsWishlisted] = useState(isWishlistedMemo);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleAddToCart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ productId: product.id, quantity: 1 }));
  }, [dispatch, product.id]);

  const handleAddToWishlist = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isWishlisted) {
      const wishlistItem = wishlistItems.find(item => item?.product?.id === product.id);
      if (wishlistItem) {
        dispatch(removeFromWishlist(wishlistItem.id));
        setIsWishlisted(false);
      }
    } else {
      dispatch(addToWishlist(product.id));
      setIsWishlisted(true);
    }
  }, [dispatch, product.id, isWishlisted, wishlistItems]);

  const handleQuickView = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    // Rediriger vers la page de détail du produit
    window.location.href = `/products/${product.id}`;
  }, [product.id]);

  const handleImageLoad = useCallback(() => setImageLoaded(true), []);
  const handleImageError = useCallback((e) => { 
    e.target.src = 'https://via.placeholder.com/400x400?text=Product';
    setImageLoaded(true);
  }, []);

  // Memoize expensive calculations
  const { rating, reviewCount, originalPrice, discountPercentage } = useMemo(() => {
    const rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars
    const reviewCount = Math.floor(Math.random() * 200) + 10;
    const originalPrice = product.price ? parseFloat(product.price) * 1.2 : null;
    const discountPercentage = originalPrice ? Math.round(((originalPrice - parseFloat(product.price)) / originalPrice) * 100) : null;
    
    return { rating, reviewCount, originalPrice, discountPercentage };
  }, [product.price]);

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1">
      {/* Discount Badge */}
      {discountPercentage && discountPercentage > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
          -{discountPercentage}%
        </div>
      )}

      {/* Stock Status Badge */}
      {product.stock <= 5 && product.stock > 0 && (
        <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-lg">
          Only {product.stock} left
        </div>
      )}

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <Link to={`/products/${product.id}`} className="block h-full">
          <OptimizedImage
            src={product.image || 'https://via.placeholder.com/400x400?text=Product'}
            alt={product.name}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </Link>

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center space-x-3">
          <button
            onClick={handleQuickView}
            className="bg-white/90 backdrop-blur-sm hover:bg-white text-emerald-600 hover:text-emerald-700 p-2.5 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75"
            title="View Details"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleAddToWishlist}
            className={`p-2.5 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100 ${
              isWishlisted
                ? 'bg-rose-500 text-white hover:bg-rose-600'
                : 'bg-white/90 backdrop-blur-sm hover:bg-white text-slate-700 hover:text-rose-500'
            }`}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            {isWishlisted ? (
              <HeartIconSolid className="h-5 w-5" />
            ) : (
              <HeartIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-5">
        <Link to={`/products/${product.id}`} className="block group/title">
          <h3 className="font-semibold text-slate-900 group-hover/title:text-emerald-600 transition-colors duration-200 line-clamp-2 leading-5 mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center space-x-1 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <span key={i}>
                {i < rating ? (
                  <StarIconSolid className="h-4 w-4 text-amber-400" />
                ) : (
                  <StarIcon className="h-4 w-4 text-slate-300" />
                )}
              </span>
            ))}
          </div>
          <span className="text-sm text-slate-500">({reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-slate-900">
              ${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price) ? parseFloat(product.price).toFixed(2) : product.price}
            </span>
            {originalPrice && (
              <span className="text-sm text-slate-500 line-through">
                ${typeof originalPrice === 'number' ? originalPrice.toFixed(2) : parseFloat(originalPrice) ? parseFloat(originalPrice).toFixed(2) : originalPrice}
              </span>
            )}
          </div>
          
          {/* Stock Status */}
          {product.stock <= 0 ? (
            <span className="text-sm font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
              Out of stock
            </span>
          ) : product.stock <= 5 ? (
            <span className="text-sm font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
              Low stock
            </span>
          ) : (
            <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
              In stock
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className={`w-full flex items-center justify-center space-x-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 mb-2 ${
            product.stock > 0
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transform hover:scale-105'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <ShoppingCartIcon className="h-4 w-4" />
          <span>{product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
        </button>
        
        {/* View Details Button */}
        <Link 
          to={`/products/${product.id}`}
          className="w-full flex items-center justify-center space-x-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 bg-slate-100 hover:bg-slate-200 text-slate-700 mt-2"
        >
          <EyeIcon className="h-4 w-4" />
          <span>View Details</span>
        </Link>
      </div>
    </div>
  );
});

// Optimiser la comparaison pour React.memo
ProductCard.displayName = 'ProductCard';

export default ProductCard;
