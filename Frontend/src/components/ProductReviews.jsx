import { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { StarIcon } from '@heroicons/react/20/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import ReviewForm from './ReviewForm';
import productService from '../services/productService';
import { fetchProductById } from '../features/products/productsSlice';

const ReviewRatingSummary = ({ reviews }) => {
  const totalReviews = reviews.length;
  
  const ratingsCount = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      counts[review.rating] = (counts[review.rating] || 0) + 1;
    });
    return counts;
  }, [reviews]);
  
  const averageRating = useMemo(() => {
    if (totalReviews === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / totalReviews).toFixed(1);
  }, [reviews, totalReviews]);
  
  return (
    <div className="bg-slate-50 rounded-lg p-5 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col items-center mb-4 md:mb-0">
          <p className="text-4xl font-bold text-slate-900">{averageRating}</p>
          <div className="flex items-center my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(averageRating) ? 'text-amber-400' : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-slate-500">{totalReviews} avis</p>
        </div>
        
        <div className="flex-1 max-w-md">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingsCount[rating] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            
            return (
              <div key={rating} className="flex items-center mb-1">
                <div className="flex items-center mr-2">
                  <span className="text-xs font-medium text-slate-600 w-1">{rating}</span>
                  <StarIcon className="h-3.5 w-3.5 text-amber-400 ml-1" />
                </div>
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-slate-500 ml-2 w-8">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
const ProductReviews = ({ productId, reviews = [] }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [showForm, setShowForm] = useState(false);
  const [filterRating, setFilterRating] = useState(0); // 0 means show all
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'highest', 'lowest'
  const [editingReview, setEditingReview] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Find user's review if exists
  const userReview = useMemo(() => {
    if (!user) return null;
    return reviews.find(review => review.user?.id === user.id);
  }, [reviews, user]);
  
  // Check if user has already reviewed this product
  const hasUserReviewed = Boolean(userReview);

  const toggleReviewForm = () => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = '/login?returnUrl=' + encodeURIComponent(window.location.pathname);
      return;
    }
    
    // Reset editing review when toggling form
    setEditingReview(null);
    
    // Toggle form visibility
    setShowForm(!showForm);
    
    // Scroll to form if opening
    if (!showForm) {
      setTimeout(() => {
        const formElement = document.getElementById('review-form');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowForm(true);
    
    // Scroll to form
    setTimeout(() => {
      const formElement = document.getElementById('review-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleDeleteReview = async (reviewId) => {
    if (confirmDelete !== reviewId) {
      setConfirmDelete(reviewId);
      return;
    }

    try {
      setIsDeleting(true);
      await productService.deleteReview(productId, reviewId);
      
      // Refresh product data to update reviews
      dispatch(fetchProductById(productId));
      
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Échec de la suppression de l\'avis. Veuillez réessayer plus tard.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancel delete confirmation if user clicks elsewhere
  useEffect(() => {
    const handleClickOutside = () => {
      setConfirmDelete(null);
    };

    if (confirmDelete) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [confirmDelete]);
  
  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    let filtered = [...reviews];
    
    // Filter by rating
    if (filterRating > 0) {
      filtered = filtered.filter(review => review.rating === filterRating);
    }
    
    // Sort reviews
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'highest':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }
    
    return filtered;
  }, [reviews, filterRating, sortBy]);
  
  const handleFilterChange = (rating) => {
    setFilterRating(rating === filterRating ? 0 : rating);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200 mt-12">
      <div className="px-6 py-5 border-b border-slate-200 flex flex-wrap items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Avis clients</h2>
        {!hasUserReviewed && isAuthenticated && (
          <button
            onClick={toggleReviewForm}
            disabled={hasUserReviewed}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
              showForm
                ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transform hover:scale-105'
            } mt-3 sm:mt-0`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {showForm
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              }
            </svg>
            <span>{showForm ? 'Annuler' : 'Écrire un avis'}</span>
          </button>
        )}
        {hasUserReviewed && (
          <div className="flex space-x-2">
            <button
              onClick={() => handleEditReview(userReview)}
              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
              title="Modifier votre avis"
            >
              <PencilSquareIcon className="h-4 w-4" />
              <span>Modifier</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteReview(userReview.id);
              }}
              className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                confirmDelete === userReview.id
                  ? 'bg-red-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-red-100 hover:text-red-700'
              }`}
              disabled={isDeleting}
              title="Supprimer votre avis"
            >
              <TrashIcon className="h-4 w-4" />
              <span>{confirmDelete === userReview.id ? 'Confirmer' : 'Supprimer'}</span>
            </button>
          </div>
        )}
      </div>
      
      <div className="p-6">
        {reviews.length === 0 ? (
          <div>
            {showForm ? (
              <div id="review-form" className="mb-8 border-2 border-emerald-100 rounded-lg p-1 bg-white">
                <ReviewForm 
                  productId={productId} 
                  reviewToEdit={editingReview}
                  onReviewSubmitted={() => {
                    setShowForm(false);
                    setEditingReview(null);
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-12 px-4 bg-slate-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <p className="text-slate-600 mb-6">Il n'y a pas encore d'avis pour ce produit.</p>
                {isAuthenticated ? (
                  <button
                    onClick={toggleReviewForm}
                    className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transform hover:scale-105"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Soyez le premier à donner votre avis</span>
                  </button>
                ) : (
                  <a
                    href={'/login?returnUrl=' + encodeURIComponent(window.location.pathname)}
                    className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 bg-slate-200 hover:bg-slate-300 text-slate-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Connectez-vous pour laisser un avis</span>
                  </a>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Review Summary and Statistics */}
            <ReviewRatingSummary reviews={reviews} />
            
            {/* Review Form */}
            {showForm && (
              <div id="review-form" className="mb-8 border-2 border-emerald-100 rounded-lg p-1 bg-white">
                <ReviewForm 
                  productId={productId}
                  reviewToEdit={editingReview}
                  onReviewSubmitted={() => {
                    setShowForm(false);
                    setEditingReview(null);
                  }}
                />
              </div>
            )}
            
            {/* Filters and Sorting */}
            <div className="flex flex-wrap items-center justify-between pb-6 border-b border-slate-200 mb-6">
              <div className="flex flex-wrap items-center space-x-2 mb-3 sm:mb-0">
                <span className="text-sm font-medium text-slate-700">Filtrer :</span>
                <div className="flex space-x-1">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleFilterChange(rating)}
                      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        filterRating === rating
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                      }`}
                    >
                      {rating}
                      <StarIcon className="h-3 w-3 ml-1" />
                    </button>
                  ))}
                  {filterRating > 0 && (
                    <button
                      onClick={() => setFilterRating(0)}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-200 text-slate-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Tout voir
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                <span className="text-sm font-medium text-slate-700 mr-2">Trier par :</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg border border-slate-200 py-1 px-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 bg-slate-50"
                >
                  <option value="recent">Plus récents</option>
                  <option value="highest">Meilleures notes</option>
                  <option value="lowest">Notes les plus basses</option>
                </select>
              </div>
            </div>
            
            {/* Reviews List */}
            <div className="space-y-6">
              {filteredReviews.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-lg">
                  <p className="text-slate-600">Aucun avis ne correspond à votre filtre.</p>
                </div>
              ) : (
                filteredReviews.map((review) => (
                  <div key={review.id} className="border-b border-slate-200 pb-6 last:border-b-0 last:pb-0">
                    <div className="flex flex-wrap items-start justify-between mb-2">
                      <div className="flex flex-col">
                        <h4 className="text-lg font-semibold text-slate-900 mb-1">{review.title || 'Avis'}</h4>
                        <div className="flex items-center">
                          <div className="flex items-center">
                            {[0, 1, 2, 3, 4].map((rating) => (
                              <StarIcon
                                key={rating}
                                className={`h-4 w-4 ${
                                  rating < review.rating ? 'text-amber-400' : 'text-slate-200'
                                }`}
                                aria-hidden="true"
                              />
                            ))}
                          </div>
                          <p className="ml-2 text-sm text-slate-500">
                            {review.rating} sur 5 étoiles
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-slate-100 px-3 py-1 rounded-lg">
                        <p className="text-xs text-slate-500">
                          {new Date(review.created_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <div className="flex items-center justify-center bg-emerald-100 text-emerald-700 h-8 w-8 rounded-full mr-2">
                        {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <h5 className="text-sm font-medium text-slate-700">
                        {review.user?.name || 'Utilisateur anonyme'}
                      </h5>
                      {review.user?.id === user?.id && (
                        <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                          Vous
                        </span>
                      )}
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-slate-700 whitespace-pre-line">{review.comment}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
