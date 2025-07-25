import { useState } from 'react';
import { useSelector } from 'react-redux';
import { StarIcon } from '@heroicons/react/20/solid';
import ReviewForm from './ReviewForm';

const ProductReviews = ({ productId, reviews = [] }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [showForm, setShowForm] = useState(false);
  
  const toggleReviewForm = () => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = '/login?returnUrl=' + encodeURIComponent(window.location.pathname);
      return;
    }
    
    setShowForm(!showForm);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-medium text-gray-900">Customer Reviews</h2>
      </div>
      
      <div className="p-6">
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">There are no reviews yet for this product.</p>
            <button
              onClick={toggleReviewForm}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Be the first to review this product
            </button>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                </h3>
              </div>
              <button
                onClick={toggleReviewForm}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {showForm ? 'Cancel' : 'Write a Review'}
              </button>
            </div>
            
            {showForm && (
              <div className="mb-8">
                <ReviewForm productId={productId} />
              </div>
            )}
            
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[0, 1, 2, 3, 4].map((rating) => (
                        <StarIcon
                          key={rating}
                          className={`h-5 w-5 ${
                            rating < review.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <p className="ml-2 text-sm text-gray-500">
                      {review.rating} out of 5 stars
                    </p>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{review.user.name}</h4>
                    <span className="mx-2 text-gray-300">•</span>
                    <p className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
