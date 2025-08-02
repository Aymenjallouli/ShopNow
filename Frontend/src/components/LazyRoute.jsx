
import React, { Suspense, lazy } from 'react';
import Loader from './Loader';

const LazyRoute = ({ component: Component, ...props }) => {
  const LazyComponent = lazy(() => import(Component));
  
  return (
    <Suspense fallback={<Loader />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

export default LazyRoute;
