import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { addProductReview, fetchProductById } from '../../features/products/productsSlice';
import { StarIcon } from '@heroicons/react/20/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import productService from '../../services/productService';

const ReviewForm = ({ productId, reviewToEdit = null, onReviewSubmitted }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
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
      setFormError(t('reviewForm.commentRequired', 'Veuillez ajouter un commentaire à votre avis'));
      return;
    }

    if (!formData.title.trim()) {
      setFormError(t('reviewForm.titleRequired', 'Veuillez ajouter un titre à votre avis'));
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
  setSuccessMessage(t('reviewForm.updated', 'Votre avis a été mis à jour !'));
      } else {
        // Créer un nouvel avis
        await dispatch(addProductReview({ productId, reviewData })).unwrap();
  setSuccessMessage(t('reviewForm.thankYou', 'Merci pour votre avis !'));
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
  setFormError(error?.message || t('reviewForm.submitError', "Échec de l'envoi de l'avis. Veuillez réessayer plus tard."));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
  <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
  <h3 className="text-xl font-semibold text-slate-900 mb-4">
        {reviewToEdit ? t('reviewForm.editTitle', 'Modifier votre avis') : t('reviewForm.writeTitle', 'Écrire un avis')}
      </h3>
      
      {successMessage && (
  <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 flex items-center text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-base">{successMessage}</span>
        </div>
      )}
      
      {formError && (
  <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-md border border-rose-200 flex items-center text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-base">{formError}</span>
        </div>
      )}
      
  <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {t('reviewForm.rating', 'Note')}
          </label>
          <div className="flex items-center bg-white p-3 rounded-md border border-slate-300 shadow-sm">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData({ ...formData, rating: star })}
                className="p-1 focus:outline-none transition-transform hover:scale-110"
              >
                {star <= formData.rating ? (
                  <StarIcon className="h-7 w-7 text-amber-500" />
                ) : (
                  <StarOutlineIcon className="h-7 w-7 text-slate-300" />
                )}
              </button>
            ))}
            <span className="ml-3 text-sm font-medium text-slate-700">
              {t('reviewForm.stars', { count: formData.rating }, { defaultValue: '{{count}} étoile', plural: '{{count}} étoiles' })}
            </span>
          </div>
        </div>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
            {t('reviewForm.title', "Titre de l'avis")}
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder={t('reviewForm.titlePlaceholder', 'Résumez votre expérience en quelques mots')}
            className="block w-full border border-slate-300 rounded-md shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white placeholder:text-slate-400 text-slate-800 caret-emerald-600"
          />
        </div>
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-slate-700 mb-2">
            {t('reviewForm.comment', 'Votre avis détaillé')}
          </label>
          <textarea
            id="comment"
            name="comment"
            rows={5}
            value={formData.comment}
            onChange={handleChange}
            placeholder={t('reviewForm.commentPlaceholder', 'Partagez votre expérience avec ce produit...')}
            className="block w-full border border-slate-300 rounded-md shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white placeholder:text-slate-400 text-slate-800 caret-emerald-600"
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-medium transition bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white shadow-sm"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{t('reviewForm.sending', 'Envoi...')}</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{reviewToEdit ? t('reviewForm.update', 'Mettre à jour') : t('reviewForm.submit', 'Publier mon avis')}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
