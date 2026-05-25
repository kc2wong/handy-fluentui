import { useContext } from 'react';

import { FuiToastContext } from '@context/toast-context';

/** Returns intent-specific helpers (success, error, warning, info) wrapping the underlying show() call. */
const useToast = () => {
  const { show } = useContext(FuiToastContext);
  return {
    success: (msg: string, dismissLabel?: string) => show(msg, dismissLabel, 'success'),
    error: (msg: string) => show(msg, undefined, 'error'),
    warning: (msg: string, dismissLabel?: string) => show(msg, dismissLabel, 'warning'),
    info: (msg: string, dismissLabel?: string) => show(msg, dismissLabel, 'info'),
  };
};

export { useToast };
