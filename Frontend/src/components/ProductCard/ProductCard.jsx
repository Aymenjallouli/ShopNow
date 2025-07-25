import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ShoppingCartIcon, HeartIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/20/solid';
import { cartService } from '../../services/cartService';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await cartService.addToCart(product.id, 1);
      // Success notification would be added here
    } catch (error) {
      console.error('Error adding product to cart:', error);
      // Error notification would be added here
    }
  };

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Wishlist functionality would be implemented here
  };

  return (
    <div className="group relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Sale badge */}
      {product.on_sale && (
        <div className="absolute top-2 left-2 z-10">
          <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
            SALE
          </span>
        </div>
      )}
      
      {/* Product image */}
      <Link to={`/products/${product.id}`} className="block aspect-h-1 aspect-w-1 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-48 w-full object-cover object-center group-hover:opacity-75 transition-opacity"
        />
      </Link>
      
      {/* Wishlist button */}
      <button
        onClick={handleAddToWishlist}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 transition-colors"
      >
        <HeartIcon className="h-5 w-5" />
      </button>
      
      {/* Product details */}
      <div className="p-4">
        <Link to={`/products/${product.id}`} className="block">
          <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
          
          <div className="mt-2 flex items-center">
            {/* Rating stars */}
            <div className="flex items-center">
              {[0, 1, 2, 3, 4].map((rating) => (
                <StarIconSolid
                  key={rating}
                  className={`h-4 w-4 flex-shrink-0 ${
                    product.rating > rating ? 'text-yellow-400' : 'text-gray-200'
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <p className="ml-2 text-xs text-gray-500">
              {product.review_count || 0} reviews
            </p>
          </div>
          
          {/* Price */}
          <div className="mt-2 flex justify-between items-center">
            <div>
              <span className="text-sm font-medium text-gray-900">
                ${product.price.toFixed(2)}
              </span>
              {product.old_price && (
                <span className="ml-2 text-xs text-gray-500 line-through">
                  ${product.old_price.toFixed(2)}
                </span>
              )}
            </div>
            
            {/* Stock status */}
            {product.stock <= 0 ? (
              <span className="text-xs text-red-600">Out of stock</span>
            ) : product.stock < 5 ? (
              <span className="text-xs text-orange-600">Low stock</span>
            ) : null}
          </div>
        </Link>
        
        {/* Add to cart button */}
        <div className="mt-3">
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`w-full flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium ${
              product.stock > 0
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCartIcon className="h-4 w-4 mr-1" />
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
