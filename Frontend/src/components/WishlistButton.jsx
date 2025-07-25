import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../features/wishlist/wishlistSlice';
import { useNavigate } from 'react-router-dom';

const WishlistButton = ({ productId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items = [] } = useSelector((state) => state.wishlist || {});
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Guard against invalid productId
  if (!productId) {
    return null;
  }

  useEffect(() => {
    // Check if the product is already in the wishlist
    if (Array.isArray(items) && items.some(item => item?.product?.id === productId)) {
      setIsInWishlist(true);
    } else {
      setIsInWishlist(false);
    }
  }, [items, productId]);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isInWishlist) {
      const wishlistItem = items.find(item => item?.product?.id === productId);
      if (wishlistItem) {
        dispatch(removeFromWishlist(wishlistItem.id));
      }
    } else {
      dispatch(addToWishlist(productId));
    }
  };

  return (
    <button
      onClick={handleWishlistToggle}
      className={`p-2 rounded-full ${
        isInWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
      } focus:outline-none transition-colors`}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={isInWishlist ? 'currentColor' : 'none'}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
};

export default WishlistButton;
