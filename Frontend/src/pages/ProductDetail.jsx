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
            <h1 className="text-3xl font-bold text-slate-800">{name}</h1>
            <p className="text-sm text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded-md mt-2">
              {category?.name || 'Uncategorized'}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {[0, 1, 2, 3, 4].map((star) => (
                <StarIcon
                  key={star}
                  className={`h-5 w-5 ${
                    star < Math.round(rating || 0) ? 'text-amber-400' : 'text-slate-300'
                  }`}
                />
              ))}
              <p className="ml-2 text-sm text-slate-600">
                <span className="font-medium">{rating ? rating.toFixed(1) : '0.0'}</span>
                <span className="mx-1">•</span>
                <span className="hover:underline cursor-pointer" onClick={() => document.getElementById('reviews-section').scrollIntoView({ behavior: 'smooth' })}>
                  {reviews?.length || 0} avis
                </span>
              </p>
            </div>
            <WishlistButton productId={id} />
          </div>
          
          <div>
            <h2 className="sr-only">Product information</h2>
            <p className="text-3xl font-bold text-slate-900 bg-slate-50 px-4 py-2 rounded-lg inline-block">
              <span className="text-emerald-600">$</span>
              <span>{typeof price === 'number' ? price.toFixed(2) : parseFloat(price) ? parseFloat(price).toFixed(2) : price}</span>
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-900">Description</h3>
            <div className="mt-2 text-sm text-gray-700 space-y-2">
              <p>{description}</p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-700">Stock Status</h3>
              {stock <= 0 ? (
                <span className="text-sm font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
                  Out of stock
                </span>
              ) : stock <= 5 ? (
                <span className="text-sm font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                  Low stock ({stock} available)
                </span>
              ) : (
                <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                  In stock ({stock} available)
                </span>
              )}
            </div>
          </div>
          
          {stock > 0 && (
            <div className="flex items-center space-x-3">
              <label htmlFor="quantity" className="text-sm font-medium text-slate-700">
                Quantité:
              </label>
              <select
                id="quantity"
                name="quantity"
                value={quantity}
                onChange={handleQuantityChange}
                className="rounded-lg border border-slate-200 py-2 px-3 text-base text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 bg-slate-50 shadow-sm"
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
              className={`flex-1 flex items-center justify-center space-x-2 rounded-xl px-4 py-3 text-base font-semibold transition-all duration-200 ${
                stock > 0 
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transform hover:scale-105' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Add to Cart</span>
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={stock === 0}
              className={`flex-1 flex items-center justify-center space-x-2 rounded-xl px-4 py-3 text-base font-semibold transition-all duration-200 ${
                stock > 0 
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Buy Now</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg">
              <TruckIcon className="h-5 w-5 text-emerald-500" />
              <span className="text-sm text-slate-600">Free shipping over $50</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg">
              <ArrowPathIcon className="h-5 w-5 text-emerald-500" />
              <span className="text-sm text-slate-600">30-day returns</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg">
              <ShieldCheckIcon className="h-5 w-5 text-emerald-500" />
              <span className="text-sm text-slate-600">Secure payment</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reviews Section */}
      <div id="reviews-section">
        <ProductReviews productId={id} reviews={reviews || []} />
      </div>
    </div>
  );
};

export default ProductDetail;
