import { useContext } from 'react';
import { useMediaQuery } from 'usehooks-ts';

import { HandyFluentUiContext } from '@context/handy-fluent-ui-context';

/** Returns true when the viewport width is at or below mobileBreakpoint. */
const useIsMobile = (): boolean => {
  const ctx = useContext(HandyFluentUiContext);
  if (!ctx) {
    throw new Error('useIsMobile must be used within HandyFluentUiProvider');
  }
  return useMediaQuery(`(max-width: ${ctx.mobileBreakpoint}px)`);
};

export { useIsMobile };
