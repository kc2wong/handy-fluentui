import { ToastIntent, ToastPosition, ToastProps } from '@fluentui/react-components';
import { createContext } from 'react';

/** Toast display configuration passed to HandyFluentUiProvider via toastConfig. */
type ToastContextConfig = {
  /** Auto-dismiss delay in milliseconds. */
  dismissTimeout?: number;
  position?: ToastPosition;
  /** Fully custom toast factory. When provided, built-in toast rendering is bypassed entirely. */
  toastCreator?: (message: string, intent: ToastIntent) => React.ReactElement<ToastProps>;
};

/** Imperative toast handle. Prefer the useToast hook which provides intent-specific helpers. */
type ToastContextType = {
  show: (intent: ToastIntent, message: string, dismissLabel?: string, intentLabel?: string) => void;
};

const ToastContext = createContext<ToastContextType>({
  show: () => {},
});

export { ToastContext as FuiToastContext };
export type { ToastContextConfig };
