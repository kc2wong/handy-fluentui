import { ToastIntent, ToastPosition, ToastProps } from '@fluentui/react-components';
import { createContext } from 'react';

/** Toast display configuration passed to HandyFluentUiProvider via toastConfig. */
type ToastContextConfig = {
  /** Auto-dismiss delay in milliseconds. */
  dismissTimeout?: number;
  position?: ToastPosition;
  /** Fully custom toast factory. When provided, built-in toast rendering is bypassed entirely. */
  toastCreator?: (message: string, intent: ToastIntent) => React.ReactElement<ToastProps>;
  /** Default label showing as toast title  */
  label?: {
    dismiss?: string;
    success?: string;
    info?: string;
    warning?: string;
    error?: string;
  };
};

/** Imperative toast handle. Prefer the useToast hook which provides intent-specific helpers. */
type ToastContextType = {
  show: (message: string, dismissLabel?: string, intent?: ToastIntent) => void;
};

const ToastContext = createContext<ToastContextType>({
  show: () => {},
});

export { ToastContext as FuiToastContext };
export type { ToastContextConfig };
