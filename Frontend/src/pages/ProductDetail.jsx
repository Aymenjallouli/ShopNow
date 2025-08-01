import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../features/products/productsSlice';
import { addToCart } from '../features/cart/cartSlice';
import { StarIcon } from '@heroicons/react/20/solid';
import { 
  ShieldCheckIcon, 
  TruckIcon, 
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import ProductReviews from '../components/ProductReviews';
import WishlistButton from '../components/WishlistButton';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { singleProduct, status, error } = useSelector((state) => state.products);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    setQuantity(value);
  };

  const handleAddToCart = () => {
    dispatch(addToCart({ productId: singleProduct.id, quantity }));
  };

  const handleBuyNow = () => {
    dispatch(addToCart({ productId: singleProduct.id, quantity }));
    navigate('/checkout');
  };

  if (status === 'loading') {
    return <Loader />;
  }

  if (status === 'failed') {
    return <ErrorMessage message={error} />;
  }

  if (!singleProduct) {
    return <ErrorMessage message="Product not found" />;
  }

  const { name, price, description, images, stock, rating, reviews, category } = singleProduct;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
            <img 
              src={images && images.length > 0 ? images[selectedImage].image : '/placeholder.jpg'} 
              alt={name} 
              className="h-full w-full object-cover object-center"
            />
          </div>
          
          {images && images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square overflow-hidden rounded-md ${selectedImage === index ? 'ring-2 ring-indigo-500' : 'ring-1 ring-gray-200'}`}
                >
                  <img 
                    src={image.image} 
                    alt={`${name} - view ${index + 1}`} 
                    className="h-full w-full object-cover object-center"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
            <p className="text-sm text-gray-500 mt-1">Category: {category?.name}</p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {[0, 1, 2, 3, 4].map((star) => (
                <StarIcon
                  key={star}
                  className={`h-5 w-5 ${
                    star < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
              <p className="ml-2 text-sm text-gray-500">
                {reviews?.length} {reviews?.length === 1 ? 'review' : 'reviews'}
              </p>
            </div>
            <WishlistButton productId={id} />
          </div>
          
          <div>
            <h2 className="sr-only">Product information</h2>
            <p className="text-3xl font-bold text-gray-900">${price.toFixed(2)}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-900">Description</h3>
            <div className="mt-2 text-sm text-gray-700 space-y-2">
              <p>{description}</p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Stock Status</h3>
              <p className={`text-sm font-medium ${stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stock > 0 ? `In Stock (${stock} available)` : 'Out of Stock'}
              </p>
            </div>
          </div>
          
          {stock > 0 && (
            <div className="flex items-center space-x-3">
              <label htmlFor="quantity" className="sr-only">
                Quantity
              </label>
              <select
                id="quantity"
                name="quantity"
                value={quantity}
                onChange={handleQuantityChange}
                className="rounded-md border border-gray-300 py-1.5 text-base text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              >
                {[...Array(Math.min(stock, 10)).keys()].map((x) => (
                  <option key={x + 1} value={x + 1}>
                    {x + 1}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={stock === 0}
              className={`flex-1 rounded-md px-4 py-3 text-base font-medium text-white ${
                stock > 0 
                  ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Add to Cart
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={stock === 0}
              className={`flex-1 rounded-md px-4 py-3 text-base font-medium ${
                stock > 0 
                  ? 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Buy Now
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center space-x-2">
              <TruckIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500">Free shipping over $50</span>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowPathIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500">30-day returns</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500">Secure payment</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reviews Section */}
      <ProductReviews productId={id} reviews={reviews || []} />
    </div>
  );
};

export default ProductDetail;
