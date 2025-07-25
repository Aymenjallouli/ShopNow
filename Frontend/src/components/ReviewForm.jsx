import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addProductReview } from '../features/products/productsSlice';
import { StarIcon } from '@heroicons/react/20/solid';

const ReviewForm = ({ productId }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rating' ? Number(value) : value,
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.comment.trim()) {
      setFormError('Please add a comment to your review');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setFormError('');
      
      await dispatch(addProductReview({ productId, reviewData: formData })).unwrap();
      
      // Reset form
      setFormData({
        rating: 5,
        comment: '',
      });
      
      setSuccessMessage('Thank you for your review!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setFormError(error || 'Failed to submit review. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Write a Review</h3>
      
      {successMessage && (
        <div className="mb-4 p-2 bg-green-50 text-green-700 rounded">
          {successMessage}
        </div>
      )}
      
      {formError && (
        <div className="mb-4 p-2 bg-red-50 text-red-700 rounded">
          {formError}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rating
          </label>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData({ ...formData, rating: star })}
                className="p-1 focus:outline-none"
              >
                <StarIcon
                  className={`h-6 w-6 ${
                    star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-500">
              {formData.rating} out of 5 stars
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
            Review
          </label>
          <textarea
            id="comment"
            name="comment"
            rows={4}
            value={formData.comment}
            onChange={handleChange}
            placeholder="Share your experience with this product..."
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
