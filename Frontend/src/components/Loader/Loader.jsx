import React from 'react';

const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-[200px] p-4">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-3 text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
};

export default Loader;
