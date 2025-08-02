import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addProductReview, fetchProductById } from '../features/products/productsSlice';
import { StarIcon } from '@heroicons/react/20/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import productService from '../services/productService';

const ReviewForm = ({ productId, reviewToEdit = null, onReviewSubmitted }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    title: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Précharger les données de l'avis en mode édition
  useEffect(() => {
    if (reviewToEdit) {
      setFormData({
        rating: reviewToEdit.rating,
        comment: reviewToEdit.comment || '',
        title: reviewToEdit.title || '',
      });
    }
  }, [reviewToEdit]);
  
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
      setFormError('Veuillez ajouter un commentaire à votre avis');
      return;
    }
    
    if (!formData.title.trim()) {
      setFormError('Veuillez ajouter un titre à votre avis');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setFormError('');
      
      const reviewData = {
        ...formData,
        product: productId,
        user: user.id,
      };
      
      if (reviewToEdit) {
        // Mettre à jour un avis existant
        await productService.updateReview(productId, reviewToEdit.id, reviewData);
        setSuccessMessage('Votre avis a été mis à jour !');
      } else {
        // Créer un nouvel avis
        await dispatch(addProductReview({ productId, reviewData })).unwrap();
        setSuccessMessage('Merci pour votre avis !');
      }
      
      // Rafraîchir les données du produit
      dispatch(fetchProductById(productId));
      
      // Reset form if not editing
      if (!reviewToEdit) {
        setFormData({
          rating: 5,
          comment: '',
          title: '',
        });
      }
      
      // Call the callback function if provided
      if (typeof onReviewSubmitted === 'function') {
        onReviewSubmitted();
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setFormError(error?.message || 'Échec de l\'envoi de l\'avis. Veuillez réessayer plus tard.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-slate-300">
      <h3 className="text-2xl font-bold text-slate-800 mb-6">
        {reviewToEdit ? 'Modifier votre avis' : 'Écrire un avis'}
      </h3>
      
      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-lg border-2 border-emerald-200 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-base">{successMessage}</span>
        </div>
      )}
      
      {formError && (
        <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-lg border-2 border-rose-200 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-base">{formError}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="mb-6">
          <label className="block text-lg font-bold text-slate-900 mb-3">
            Note
          </label>
          <div className="flex items-center bg-white p-4 rounded-lg border-2 border-slate-400 shadow-md">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData({ ...formData, rating: star })}
                className="p-1.5 focus:outline-none transition-transform hover:scale-110"
              >
                {star <= formData.rating ? (
                  <StarIcon className="h-12 w-12 text-amber-500" />
                ) : (
                  <StarOutlineIcon className="h-12 w-12 text-slate-400" />
                )}
              </button>
            ))}
            <span className="ml-4 text-lg font-bold text-slate-800">
              {formData.rating} étoile{formData.rating > 1 ? 's' : ''}
            </span>
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="title" className="block text-lg font-bold text-slate-900 mb-3">
            Titre de l'avis
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder="Résumez votre expérience en quelques mots"
            className="block w-full border-2 border-slate-400 rounded-lg shadow-md py-4 px-5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg bg-white"
          />
        </div>
        
        <div className="mb-8">
          <label htmlFor="comment" className="block text-lg font-bold text-slate-900 mb-3">
            Votre avis détaillé
          </label>
          <textarea
            id="comment"
            name="comment"
            rows={5}
            value={formData.comment}
            onChange={handleChange}
            placeholder="Partagez votre expérience avec ce produit..."
            className="block w-full border-2 border-slate-400 rounded-lg shadow-md py-4 px-5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg bg-white"
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center space-x-2 rounded-xl px-6 py-4 text-lg font-semibold transition-all duration-200 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transform hover:scale-105"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-lg">Envoi en cours...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-lg">{reviewToEdit ? 'Mettre à jour' : 'Publier mon avis'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
