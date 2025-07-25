const CategoryFilter = ({ categories = [], selectedCategory, onCategoryChange }) => {
  // Ensure categories is always an array
  const safeCategories = Array.isArray(categories) ? categories : [];
  
  return (
    <div className="w-full md:w-1/3">
      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
        Filter by Category
      </label>
      <select
        id="category"
        name="category"
        value={selectedCategory || 'all'}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        <option value="all">All Categories</option>
        {safeCategories.length > 0 && safeCategories.map((category) => (
          <option key={category?.id || Math.random()} value={category?.id?.toString() || ''}>
            {category?.name || 'Unknown Category'}
          </option>
        ))}
      </select>
    </div>
  );
};


export default CategoryFilter;
