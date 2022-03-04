import React, { lazy, Suspense } from 'react';

const LazyUserArea = lazy(() => import('./UserArea'));

const UserArea = props => (
  <Suspense fallback={null}>
    <LazyUserArea {...props} />
  </Suspense>
);

export default UserArea;
