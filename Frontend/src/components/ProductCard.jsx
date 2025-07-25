import { Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/20/solid';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../features/cart/cartSlice';
import WishlistButton from './WishlistButton';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Handle missing product
  if (!product) {
    return null;
  }

  const { id, name = 'Product Name', price = 0, images = [], rating = 0, stock = 0, category } = product;
  
  const truncatedName = name && name.length > 40 ? `${name.substring(0, 40)}...` : name;
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ product, quantity: 1 }));
  };
  
  return (
    <div className="group relative">
      <Link to={`/products/${id}`}>
        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-100">
          <img
            src={images && images.length > 0 && images[0]?.image ? images[0].image : '/placeholder.jpg'}
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
      
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm text-gray-700">{truncatedName}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {category?.name || 'Uncategorized'}
          </p>
        </div>
        <p className="text-sm font-medium text-gray-900">${typeof price === 'number' ? price.toFixed(2) : '0.00'}</p>
      </div>
      
      <div className="mt-1 flex items-center">
        <div className="flex items-center">
          {[0, 1, 2, 3, 4].map((star) => (
            <StarIcon
              key={star}
              className={`h-4 w-4 ${
                star < Math.round(rating || 0) ? 'text-yellow-400' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="ml-1 text-xs text-gray-500">
          ({product.reviews?.length || 0})
        </span>
      </div>
      
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
          {stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
