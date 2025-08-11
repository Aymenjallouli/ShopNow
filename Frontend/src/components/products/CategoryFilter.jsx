
import { useTranslation } from 'react-i18next';

const CategoryFilter = ({ categories = [], selectedCategory, onCategoryChange }) => {
  const { t } = useTranslation();
  // Ensure categories is always an array
  const safeCategories = Array.isArray(categories) ? categories : [];
  
  return (
    <div className="w-full md:w-1/3">
      <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">
        {t('categoryFilter.filterBy', 'Filter by Category')}
      </label>
      <select
        id="category"
        name="category"
        value={selectedCategory || 'all'}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="w-full border border-slate-200 bg-slate-50 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300 sm:text-sm text-slate-700 transition-all duration-200"
      >
        <option value="all">{t('categoryFilter.allCategories', 'All Categories')}</option>
        {safeCategories.length > 0 && safeCategories.map((category) => (
          <option key={category?.id || Math.random()} value={category?.id?.toString() || ''}>
            {category?.name || t('categoryFilter.unknownCategory', 'Unknown Category')}
          </option>
        ))}
      </select>
    </div>
  );
};


export default CategoryFilter;
