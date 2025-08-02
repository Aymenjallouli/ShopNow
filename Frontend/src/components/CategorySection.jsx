import React, { useState, useEffect } from 'react';

const CategorySection = ({ categories, onCategorySelect, selectedCategory }) => {
  // État pour suivre l'animation de la catégorie sélectionnée
  const [clickedCategoryId, setClickedCategoryId] = useState(null);
  
  // Ensure categories is always an array
  const safeCategories = Array.isArray(categories) ? categories : [];
  
  // Default image for categories without images
  const defaultCategoryImage = 'https://via.placeholder.com/300x200?text=Category';
  
  // Gestion du clic sur une catégorie avec animation
  const handleCategoryClick = (categoryId) => {
    // Si on clique sur la catégorie déjà sélectionnée, on la désélectionne
    if (categoryId === selectedCategory) {
      categoryId = 'all';
    }
    
    setClickedCategoryId(categoryId);
    
    // Réinitialiser l'animation après 500ms mais garder la sélection
    setTimeout(() => {
      setClickedCategoryId(null);
      
      // Appeler le callback de sélection
      if (onCategorySelect) {
        onCategorySelect(categoryId);
      }
    }, 500);
  };
  
  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
            Browse Categories
          </h2>
          <p className="text-slate-600">
            Find your favorite products by category
          </p>
        </div>
      </div>
      
      {safeCategories.length === 0 ? (
        <div className="flex justify-center items-center p-8 bg-slate-50 rounded-xl">
          <p className="text-slate-500">No categories available</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {safeCategories.map((category) => {
            const categoryId = category?.id?.toString() || '';
            const isClicked = clickedCategoryId === categoryId;
            const isSelected = selectedCategory === categoryId;
            
            return (
              <div 
                key={category?.id || Math.random()} 
                className={`bg-white rounded-2xl overflow-hidden border transform transition-all duration-300 cursor-pointer
                  ${isClicked ? 'scale-95 shadow-inner' : 'hover:scale-[1.02]'}
                  ${isSelected 
                    ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500 ring-opacity-50 shadow-md' 
                    : 'hover:shadow-md border-slate-100'}
                `}
                onClick={() => handleCategoryClick(categoryId)}
              >
                <div className="block h-full">
                  <div className="aspect-w-16 aspect-h-9 w-full relative">
                    <img 
                      src={category?.image || defaultCategoryImage} 
                      alt={category?.name || 'Category'} 
                      className={`w-full h-36 object-cover transition-all duration-300 
                        ${isClicked ? 'brightness-90' : ''}
                        ${isSelected ? 'brightness-105 saturate-[1.2]' : ''}
                      `}
                      onError={(e) => { e.target.src = defaultCategoryImage; }}
                    />
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className={`font-semibold text-center transition-all duration-300 
                      ${isClicked ? 'text-emerald-700' : ''}
                      ${isSelected ? 'text-emerald-700 font-bold' : 'text-slate-800'}
                    `}>
                      {category?.name || 'Unknown Category'}
                    </h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategorySection;
