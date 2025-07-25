import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchWishlist, removeFromWishlist, clearWishlist } from '../features/wishlist/wishlistSlice';
import { addToCart } from '../features/cart/cartSlice';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.wishlist);
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
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">Wishlist</h1>
        <div className="bg-blue-50 p-4 rounded">
          <p className="text-center">
            Please{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              login
            </Link>{' '}
            to view your wishlist.
          </p>
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
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Wishlist</h1>
        {items.length > 0 && (
          <button
            onClick={handleClearWishlist}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Clear Wishlist
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded text-center">
          <p className="text-gray-600 mb-4">Your wishlist is empty.</p>
          <Link
            to="/"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <Link to={`/product/${item.product.id}`}>
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-full h-48 object-cover"
                />
              </Link>
              <div className="p-4">
                <Link
                  to={`/product/${item.product.id}`}
                  className="text-lg font-semibold hover:text-blue-600 block mb-2"
                >
                  {item.product.name}
                </Link>
                <p className="text-gray-600 mb-2 line-clamp-2">{item.product.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xl font-bold">
                    ${item.product.discount_price || item.product.price}
                  </span>
                  {item.product.discount_price && (
                    <span className="text-sm text-gray-500 line-through">
                      ${item.product.price}
                    </span>
                  )}
                </div>
                <div className="flex mt-4 space-x-2">
                  <button
                    onClick={() => handleAddToCart(item.product.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded flex-1 hover:bg-blue-700"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
