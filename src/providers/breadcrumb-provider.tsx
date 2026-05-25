import { ReactNode, useState } from 'react';

import { BreadcrumbItem, FuiBreadcrumbContext } from '@context/breadcrumb-context';

/**
 * Provides state management for the global breadcrumb trail.
 * Consumed via useBreadcrumb() hook.
 */
const BreadcrumbProvider = ({ children }: { children: ReactNode }) => {
  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbItem[]>([]);

  return (
    <FuiBreadcrumbContext.Provider value={{ items: breadcrumbItems, setItems: setBreadcrumbItems }}>
      {children}
    </FuiBreadcrumbContext.Provider>
  );
};

export { BreadcrumbProvider };
