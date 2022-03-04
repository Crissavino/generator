import React, { lazy, Suspense } from 'react';

const LazyLayout = lazy(() => import('./Layout'));

const Layout = props => (
  <Suspense fallback={null}>
    <LazyLayout {...props} />
  </Suspense>
);

export default Layout;
