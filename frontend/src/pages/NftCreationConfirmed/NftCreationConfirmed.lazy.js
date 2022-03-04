import React, { lazy, Suspense } from 'react';

const LazyNftCreationConfirmed = lazy(() => import('./NftCreationConfirmed'));

const NftCreationConfirmed = props => (
  <Suspense fallback={null}>
    <LazyNftCreationConfirmed {...props} />
  </Suspense>
);

export default NftCreationConfirmed;
