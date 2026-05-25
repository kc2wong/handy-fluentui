import { useContext } from 'react';

import { FuiToastContext } from '@context/toast-context';

/** Returns intent-specific helpers (success, error, warning, info) wrapping the underlying show() call. */
const useToast = () => {
  const { show } = useContext(FuiToastContext);
  return {
    success: (msg: string, dismissLabel?: string, intentLabel?: string) => show('success', msg, dismissLabel, intentLabel),
    error: (msg: string, dismissLabel?: string, intentLabel?: string) => show('error', msg, dismissLabel, intentLabel),
    warning: (msg: string, dismissLabel?: string, intentLabel?: string) => show('warning', msg, dismissLabel, intentLabel),
    info: (msg: string, dismissLabel?: string, intentLabel?: string) => show('info', msg, dismissLabel, intentLabel),
  };
};

export { useToast };
