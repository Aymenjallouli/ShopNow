
import { Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/20/solid';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../features/cart/cartSlice';
import WishlistButton from './WishlistButton';
import { useTranslation } from 'react-i18next';

const ProductCard = ({ product }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Handle missing product
  if (!product) {
    return null;
  }

  const { id, name = t('productCard.productName', 'Product Name'), price = 0, image = '', stock = 0, category, shop_id, shop_name, reviews = [], rating } = product;
  // Use backend rating if provided, otherwise compute from real reviews (no mock injection)
  const computedRating = typeof rating === 'number' ? rating : (reviews.length ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length) : 0);
  const truncatedName = name && name.length > 40 ? `${name.substring(0, 40)}...` : name;
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAuthenticated) {
      dispatch(addToCart({ productId: id, quantity: 1 }));
    } else {
      // Redirect to login if not authenticated
      window.location.href = '/login';
    }
  };
  // Detect discount fields if ever provided
  const hasDiscount = typeof product.discount_price === 'number' && product.discount_price < price;
  return (
    <div className="group relative">
      <Link to={`/products/${id}`}>
        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-100">
          <img
            src={image && image.startsWith('http') ? image : '/placeholder.jpg'}
            alt={name}
            className="h-60 w-full object-cover object-center group-hover:opacity-75 transition-opacity"
            onError={(e) => {
              e.target.src = '/placeholder.jpg';
              e.target.onerror = null;
            }}
          />
        </div>
      </Link>
      
      <div className="absolute top-2 right-2 z-10">
        <WishlistButton productId={id} />
      </div>
      
      <div className="mt-4 space-y-1">
        <div className="flex justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-gray-800 leading-tight line-clamp-2">{truncatedName}</h3>
            <p className="mt-0.5 text-xs text-gray-500">{category?.name || t('productCard.noCategory', 'Sans catégorie')}</p>
          </div>
          <div className="text-right shrink-0">
            {!hasDiscount && (
              <p className="text-sm font-semibold text-gray-900">${typeof price === 'number' ? price.toFixed(2) : parseFloat(price) ? parseFloat(price).toFixed(2) : '0.00'}</p>
            )}
            {hasDiscount && (
              <div className="flex flex-col items-end">
                <p className="text-[11px] line-through text-gray-400">${price.toFixed(2)}</p>
                <p className="text-sm font-semibold text-emerald-600">${product.discount_price.toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>
        {shop_id && (
          <Link to={`/shops/${shop_id}`} className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-700 group/ln">
            <span className="truncate max-w-[160px]">{shop_name || t('productCard.viewShop', 'Voir shop')}</span>
            <svg className="w-3 h-3 opacity-70 group-hover/ln:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
          </Link>
        )}
      </div>
      
      {reviews.length > 0 && computedRating > 0 ? (
        <div className="mt-1 flex items-center">
          <div className="flex items-center">
            {[0, 1, 2, 3, 4].map((star) => (
              <StarIcon
                key={star}
                className={`h-4 w-4 ${star < Math.round(computedRating) ? 'text-amber-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <span className="ml-1 text-xs text-gray-500">({reviews.length})</span>
        </div>
      ) : (
        <div className="mt-1 min-h-[20px]">
          <span className="text-[11px] text-gray-400 italic">{t('productCard.noReviews', "Pas encore d'avis")}</span>
        </div>
      )}
      
      <div className="mt-3">
        <button
          onClick={handleAddToCart}
          disabled={stock <= 0}
          className={`w-full rounded-md px-3 py-2 text-sm font-medium ${
            stock > 0
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {stock > 0 ? t('productCard.addToCart', 'Add to Cart') : t('productCard.outOfStock', 'Out of Stock')}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
